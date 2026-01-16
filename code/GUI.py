# GUI.py

import os
import torch
import pickle
import pandas as pd
import numpy as np
import branca.colormap as cm
import streamlit as st
import pydeck as pdk
import warnings
warnings.filterwarnings("ignore")

from tqdm import tqdm
from datetime import datetime, timedelta
from streamlit_folium import folium_static
from geopandas import GeoDataFrame
from shapely.geometry import Point
from geopy.geocoders import Nominatim
from geopy.exc import GeocoderTimedOut

import config
from LSTMModel import ConvLSTMModel
from DataPreprocessing import DataPreprocessing
from WeatherModel import WeatherModel
from TimeseriesModel import TimeseriesModel

@st.cache_data
def get_location_coordinates(place_name):
    try:
        geolocator = Nominatim(user_agent="crime_hotspot_app")
        location = geolocator.geocode(f"{place_name}, Bengaluru, India")
        if location:
            return location.latitude, location.longitude
    except:
        return None
    return None

device = 'cpu'
projectDir = config.PROJECT_DIR
minus_days = config.SEQ_LEN + 1
start_date = datetime.strptime(config.START_DATE[1:-1], '%Y-%m-%d')
left_limit = start_date + timedelta(days=minus_days)
right_limit = datetime.strptime(config.END_DATE[1:-1], '%Y-%m-%d')
crimeType = [crime.lower() for crime in config.CRIME_TYPE]

# in order to use the cache in streamlit, functions can only be written in isolated function instead of a whole class
@st.cache_data
def loadNYCShape():
    """
    Function to load NYC shape and save it in cache

    Output: NYCShape <list>: list of grids that are not on the map.
    """
    print("Initializing NYC Map")
    NYCShapeDir = projectDir + '/Data/PreprocessedDatasets/NYCGridsShape.pkl'
    # load pickle file if it was trainde before
    if (os.path.isfile(NYCShapeDir)):
        with open(NYCShapeDir, 'rb') as file:
            NYCShape = pickle.load(file)
            return NYCShape

    # For custom datasets (like Bengaluru), we don't use the NYC shapefile filtering.
    # Return empty list means "no grids are excluded".
    print("Skipping NYC Map shape filtering for custom dataset.")
    NYCShape = []
    return NYCShape

@st.cache_data
def loadDataset():
    """
    Function to load dataset and save it to cache

    Output: features<DataFrame>: features
            labels<DataFrame>: labels
            dataPivot<DataFrame>: crime table
            crimeData<DataFrame>: crime data info
    """
    print("Initilizing Dataset")
    dp = DataPreprocessing(projectDir)
    features, labels, dataPivot, crimeData = dp.features, dp.labels, dp.dataPivot, dp.data
    return features, labels, dataPivot, crimeData

@st.cache_resource
def loadLSTMModel():
    """
    Function to load ConvLSTM model and save it to cache

    Output: LSTM_model<Object>: loaded ConvLSTM model
    """
    print('Loading ConvLSTM Model')
    # model_save_path = projectDir + '/Data/ModelWeights' + f'/BestModel__bs-({config.TRAIN_BATCH_SIZE})_threshold-({config.CLASS_THRESH})_weights-({config.BCE_WEIGHTS}).pt'
    model_save_path = projectDir + '/Data/ModelWeights/BestModel.pt'
    model = torch.load(model_save_path, map_location=torch.device(device) )
    LSTM_model = ConvLSTMModel(input_dim=config.CRIME_TYPE_NUM, hidden_dim=config.HIDDEN_DIM, kernel_size=config.KERNEL_SIZE, bias=True)
    LSTM_model.load_state_dict(model['model'])
    return LSTM_model

@st.cache_resource
def loadWeatherModel():
    """
    Function to load Weather model and save it to cache

    Output: WeatherModel<Object>: loaded Weather model
    """
    print('Loading Weather Model')
    return WeatherModel(projectDir)

@st.cache_resource
def loadTimeseriesModel(crimeData):
    """
    Function to load Timeseries model and save it to cache

    Output: Timeseries<Object>: loaded Timeseries model
    """
    print('Loading Timeseries Model')
    return TimeseriesModel(projectDir, crimeData)

def getPredDataByDate(date, LSTMModel, weatherModel, timeseriesModel, dataPivot, features, labels):
    """
    Function to get predicted data by using those three models

    Input: date<String>: selected date
           LSTMModel<Object>: loaded LSTMModel
           weatherModel<Object>: loaded weatherModel
           timeseriesModel<Object>: loaded timeseriesModel
           dataPivot<DataFrame>: crime timetable
           features<DataFrame>: features
           labels<DataFrame>: labels
    """

    dt = datetime.strptime(date[1:-1], '%Y-%m-%d')
    if (dt <= left_limit):
        print(f"Please choose date after {start_date}.", end=" ")
        print("The crime data before that date is not applied due to limited computing resources.")
        return 0
    elif (dt > right_limit):
        print(f"Please choose data before {right_limit}.")
        print("Currently the model can not access future data for prediction.(Use data of last 12 days to predict on that day)")
        return 0
    
    # determine if the input date is valid for prediction
    minus_days = config.SEQ_LEN + 1
    if (dataPivot.query(f"date < {config.START_DATE}").shape[0] == 0):
        startIndex = 0
    else:
        startIndex = int(dataPivot.query(f"date < {config.START_DATE}").shape[0] / config.CRIME_TYPE_NUM - minus_days)
    
    # get input feature and true labels
    found_index = int(dataPivot.query(f"date < {date}").shape[0] / config.CRIME_TYPE_NUM - minus_days) - startIndex
    labels_by_date = labels[found_index]
    features_by_date = features[found_index]
    
    # get pred from ConvLSTM
    processed_features = torch.from_numpy(features_by_date).to(device).unsqueeze(0).float()
    pred_data = LSTMModel(processed_features)[0][0]
    
    getWeatherFactor = weatherModel.getWeatherFactor(date[1:-1])
    getTimeseriesFactor = [timeseriesModel.getTimeseriesFactor(crime_name, date[1:-1]) for crime_name in crimeType]
    
    return pred_data, labels_by_date, getWeatherFactor, getTimeseriesFactor

def getHexagonData(pred_data, getWeatherFactor, getTimeseriesFactor, NYCShape, type_num, threshold, temporal_factor = True):
    """
    Function to get hexagon data

    Input: date<String>: selected date
           getWeatherFactor<float>: weather factor
           getTimeseriesFactor<float>: timeseries factor
           NYCShape<list>: gird number that are not in NYC
           type_num<int>: selected crime type index number
           threshold<float>: threshold for prediction
    
           Output<DataFrame>: latitude longitude list for plot 3d map
    """
    lat_lon_list = []
    for x in range(pred_data.shape[1]):
        for y in range(pred_data.shape[2]):
            if (((x,y) not in NYCShape) or ((x+1,y) not in NYCShape) or ((x,y+1) not in NYCShape) or ((x+1,y+1) not in NYCShape)) and x < config.LAT_GRIDS-1 and y < config.LON_GRIDS-1:
                
                weight = np.float64(pred_data[type_num][x][y])

                if temporal_factor:
                    weight = weight * getWeatherFactor * getTimeseriesFactor[type_num]
                if pred_data[type_num][x][y] < threshold:
                    weight = weight * config.MULTIPLY_FACTOR
                    
                lat = config.LAT_BINS[x] + config.DIFF_LAT
                lon = config.LON_BINS[y] + config.DIFF_LON

                num = int(weight*100)
                for _ in range(num):
                    lat_lon_list.append(np.array([lat, lon]))

                # # make columns more clear and beautiful
                # if (weight > 0.7):
                #     num = int(weight*10)
                #     for _ in range(num):
                #         lat_lon_list.append(np.array([lat, lon]))
                
                # if (weight > 0.9):
                #     num = int(weight*30)
                #     for _ in range(num):
                #         lat_lon_list.append(np.array([lat, lon]))

    df = pd.DataFrame(lat_lon_list, columns=['lat', 'lon'])

    return df

def run():
    """
    Function to run the GUI
    """
    # load NYC shape and datasets
    NYCShape = loadNYCShape()
    features, labels, dataPivot, crimeData = loadDataset()
    # load models
    LSTMModel = loadLSTMModel()
    weatherModel = loadWeatherModel()
    timeseriesModel = loadTimeseriesModel(crimeData)

    # limited by timeseries model
    startDate  = datetime.strptime(config.START_SELECT_DATE[1:-1], '%Y-%m-%d')
    endDate    = datetime.strptime(config.END_DATE[1:-1], '%Y-%m-%d')
    
    # Initialize session state for map view
    if 'view_lat' not in st.session_state:
        st.session_state['view_lat'] = (config.LAT_MIN + config.LAT_MAX) / 2
        st.session_state['view_lon'] = (config.LON_MIN + config.LON_MAX) / 2
        st.session_state['view_zoom'] = 10

    with st.sidebar:
        st.write("## Mode Selection")
        app_mode = st.radio("Choose Mode:", ["Prediction Model", "Cumulative Heatmap (All Data)"])
        st.write("---")
        
        st.write("## 🔍 Search Location")
        search_query = st.text_input("Enter place name (e.g. Indiranagar)")
        if search_query:
            coords = get_location_coordinates(search_query)
            if coords:
                lat, lon = coords
                st.session_state['view_lat'] = lat
                st.session_state['view_lon'] = lon
                st.session_state['view_zoom'] = 14
                st.success(f"Found: {search_query}")
            else:
                st.error("Location not found in Bengaluru")
        st.write("---")

        # Visualization Style
        st.write("## 🎨 Map Style")
        vis_type = st.radio("Choose Style:", ["Heatmap (2D)", "Hexagon (3D)"])
        st.write("---")

    if app_mode == "Prediction Model":
        # Input parameters in the sidebar
        with st.sidebar:
            st.sidebar.write("Choose Parameters for Prediction")
            with st.form("my_form"):
                # select data in the given range
                dateChosen = st.date_input("Choose date:",  min_value=startDate, max_value=endDate, value=startDate)
                dataChosenStr = dateChosen.strftime('%Y-%m-%d')
                inputDate = f"\'{dataChosenStr}\'"

                # select one of eight crime type
                typeChosen = st.radio("Select crime type:", crimeType)
                type_num = crimeType.index(typeChosen)

                # select threshold for prediction
                threshold = st.select_slider("Adjust threshold:", options=[i/100 for i in range(1,100)])
                # button for start processing prediction
                submitted = st.form_submit_button("Predict")
        
        # default map when initializing
        if not submitted:
            st.write()
            "👈 👈 👈 Please choose parameters for prediction"
            st.pydeck_chart(pdk.Deck(
                map_style=None,
                initial_view_state=pdk.ViewState(
                    longitude = st.session_state['view_lon'],
                    latitude = st.session_state['view_lat'],
                    zoom = st.session_state['view_zoom'],
                    pitch=50,
                ),
                layers=[]
            ))

        # plot 3d interactive map by using pydeck_chart
        if submitted:
            st.write()
            # show selected parameters
            'You selected: ', typeChosen, 'on date ', dateChosen, 'with threshold of ', threshold
            'Prediction Results: '
            pred_data, real_data, getWeatherFactor, getTimeseriesFactor = getPredDataByDate(inputDate, LSTMModel, weatherModel, timeseriesModel, dataPivot, features, labels)
            chart_data = getHexagonData(pred_data, getWeatherFactor, getTimeseriesFactor, NYCShape, type_num, threshold)
            if vis_type == "Hexagon (3D)":
                layer = pdk.Layer(
                    'HexagonLayer',
                    data=chart_data,
                    get_position='[lon, lat]',
                    radius=400,
                    elevation_scale=1,
                    elevation_range=[0, 8000],
                    auto_highlight=True,
                    pickable=True,
                    extruded=True,
                    opacity=0.6,
                )
            else:
                layer = pdk.Layer(
                    'HeatmapLayer',
                    data=chart_data,
                    get_position='[lon, lat]',
                    opacity=0.9,
                    radiusPixels=50,
                )

            st.pydeck_chart(pdk.Deck(
                map_style=None,
                initial_view_state=pdk.ViewState(
                    longitude = st.session_state['view_lon'],
                    latitude = st.session_state['view_lat'],
                    zoom = st.session_state['view_zoom'],
                    pitch=40 if vis_type == "Hexagon (3D)" else 0,
                ),
                layers=[layer],
            ))

    elif app_mode == "Cumulative Heatmap (All Data)":
        st.write("## 🗺️ Cumulative Crime Heatmap")
        
        # Get unique crime types from the dataset
        all_crime_types = sorted(crimeData['TYPE'].unique().tolist())
        
        with st.sidebar:
            st.write("## 🕸️ Filter Data")
            selected_types = st.multiselect(
                "Select Crime Types:",
                options=all_crime_types,
                default=all_crime_types
            )
            st.write("---")

        st.write(f"Displaying {len(selected_types)} crime types within configured bounds.")
        
        # Filter raw data based on config bounds AND selected types
        df_display = crimeData[
            (crimeData['Longitude'] >= config.LON_MIN) & (crimeData['Longitude'] <= config.LON_MAX) &
            (crimeData['Latitude'] >= config.LAT_MIN) & (crimeData['Latitude'] <= config.LAT_MAX) &
            (crimeData['TYPE'].isin(selected_types))
        ]
        
        st.write(f"**Total Points Displayed:** {len(df_display)}")

        if vis_type == "Hexagon (3D)":
            layer = pdk.Layer(
                'HexagonLayer',
                data=df_display,
                get_position='[Longitude, Latitude]',
                radius=200,
                elevation_scale=4,
                elevation_range=[0, 3000],
                auto_highlight=True,
                pickable=True,
                extruded=True,
                coverage=1,
                opacity=0.6
            )
        else:
            layer = pdk.Layer(
                'HeatmapLayer',
                data=df_display,
                get_position='[Longitude, Latitude]',
                opacity=0.9,
                radiusPixels=30,
            )

        st.pydeck_chart(pdk.Deck(
            map_style=None,
            initial_view_state=pdk.ViewState(
                longitude = st.session_state['view_lon'],
                latitude = st.session_state['view_lat'],
                zoom = st.session_state['view_zoom'],
                pitch=40 if vis_type == "Hexagon (3D)" else 0,
            ),
            layers=[layer],
        ))

if __name__ == "__main__":
    run()



