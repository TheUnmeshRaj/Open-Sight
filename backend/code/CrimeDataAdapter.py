import pandas as pd

INPUT_FILE = "Data/Datasets/20230320020226crime_data_extended_entries.csv"
OUTPUT_FILE = "Data/PreprocessedDatasets/crime_timeseries.csv"

# Load CSV
df = pd.read_csv(INPUT_FILE)

# Combine date + time into datetime
df["datetime"] = pd.to_datetime(
    df["date"].astype(str) + " " + df["time_of_day"].astype(str),
    errors="coerce"
)

# Drop rows with missing critical values
df = df.dropna(subset=["datetime", "latitude", "longitude"])

# Spatial binning (controls hotspot granularity)
df["lat_bin"] = df["latitude"].round(3)
df["lon_bin"] = df["longitude"].round(3)

# Aggregate crime counts (spatio-temporal signal)
crime_ts = (
    df.groupby(["datetime", "lat_bin", "lon_bin"])
      .size()
      .reset_index(name="crime_count")
)

# Save preprocessed data
crime_ts.to_csv(OUTPUT_FILE, index=False)

print("Crime time series created:", OUTPUT_FILE)