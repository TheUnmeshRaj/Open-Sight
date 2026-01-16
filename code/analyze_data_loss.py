import pandas as pd
import config
import os

def analyze():
    dataset_path = os.path.join(config.PROJECT_DIR, "Data/Datasets", config.DATASET_FILENAME)
    print(f"Loading dataset: {dataset_path}")
    
    # Load raw data with original column names
    try:
        data = pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Error loading dataset: {e}")
        return

    total_rows = len(data)
    print(f"\n--- DATASET ANALYSIS ---")
    print(f"Total Rows: {total_rows}")

    # Standardize columns
    data.rename(columns={
        "latitude": "Latitude",
        "longitude": "Longitude",
        "crime_type": "TYPE",
    }, inplace=True)

    # 1. Check Bad Coordinates (Null or 0,0)
    invalid_coords = data[
        (data["Latitude"].isnull()) | 
        (data["Longitude"].isnull()) | 
        (data["Latitude"] == 0) | 
        (data["Longitude"] == 0)
    ]
    invalid_count = len(invalid_coords)
    
    # Drop invalid for further analysis
    valid_data = data.drop(invalid_coords.index)
    
    # 2. Check bounds
    # "Metro" bounds from config
    lat_min, lat_max = config.LAT_MIN, config.LAT_MAX
    lon_min, lon_max = config.LON_MIN, config.LON_MAX
    
    inside_bounds = valid_data[
        (valid_data["Latitude"] >= lat_min) & (valid_data["Latitude"] <= lat_max) &
        (valid_data["Longitude"] >= lon_min) & (valid_data["Longitude"] <= lon_max)
    ]
    
    inside_count = len(inside_bounds)
    outside_count = len(valid_data) - inside_count

    print(f"\n--- BREAKDOWN ---")
    print(f"1. Invalid/Missing Coordinates: {invalid_count} ({invalid_count/total_rows*100:.1f}%)")
    print(f"2. Valid Coordinates: {len(valid_data)}")
    print(f"   - Inside Metro Bounds: {inside_count} ({inside_count/total_rows*100:.1f}%)")
    print(f"   - Outside Metro Bounds: {outside_count} ({outside_count/total_rows*100:.1f}%)")
    
    print(f"\n--- BOUNDS USED ---")
    print(f"Lat: {lat_min} to {lat_max}")
    print(f"Lon: {lon_min} to {lon_max}")
    
    if outside_count > 0:
        out_df = valid_data[
            (valid_data["Latitude"] < lat_min) | (valid_data["Latitude"] > lat_max) |
            (valid_data["Longitude"] < lon_min) | (valid_data["Longitude"] > lon_max)
        ]
        print(f"\n--- OUTSIDE DATA SAMPLE ---")
        print(out_df[['Latitude', 'Longitude']].describe())

if __name__ == "__main__":
    analyze()
