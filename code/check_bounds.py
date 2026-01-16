import pandas as pd
import os
import config

def check_bounds():
    dataset_path = os.path.join(config.PROJECT_DIR, "Data/Datasets", config.DATASET_FILENAME)
    print(f"Reading dataset: {dataset_path}")
    
    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    # Check for likely column names
    lat_col = None
    lon_col = None
    
    # Case insensitive search
    for col in df.columns:
        if col.lower() == "latitude":
            lat_col = col
        if col.lower() == "longitude":
            lon_col = col
            
    if not lat_col or not lon_col:
        print(f"Error: Could not find Latitude/Longitude columns. Found: {list(df.columns)}")
        return

    print(f"Using columns: {lat_col}, {lon_col}")
    
    # Drop NaNs
    df = df.dropna(subset=[lat_col, lon_col])
    
    # Basic validity filter
    df = df[(df[lat_col] >= -90) & (df[lat_col] <= 90)]
    df = df[(df[lon_col] >= -180) & (df[lon_col] <= 180)]

    # Filter for reasonable Bengaluru coordinates to handle swapped columns/outliers
    # Expect Lat ~12-14, Lon ~77-78
    valid_data = df[
        (df[lat_col] >= 11) & (df[lat_col] <= 15) & 
        (df[lon_col] >= 76) & (df[lon_col] <= 79)
    ]
    
    print(f"\nRows matching valid Bengaluru range (Lat 11-15, Lon 76-79): {len(valid_data)} / {len(df)}")
    
    if len(valid_data) > 0:
        v_lat_min = valid_data[lat_col].min()
        v_lat_max = valid_data[lat_col].max()
        v_lon_min = valid_data[lon_col].min()
        v_lon_max = valid_data[lon_col].max()
        
        print(f"\nRecommended CONFIG Bounds (based on valid subset):")
        print(f"LAT_MIN = {v_lat_min:.4f}")
        print(f"LAT_MAX = {v_lat_max:.4f}")
        print(f"LON_MIN = {v_lon_min:.4f}")
        print(f"LON_MAX = {v_lon_max:.4f}")
    else:
        print("No data found in expected Bengaluru range provided.")

if __name__ == "__main__":
    check_bounds()
