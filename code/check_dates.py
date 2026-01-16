import pandas as pd
import os
import config

def check_dates():
    dataset_path = os.path.join(config.PROJECT_DIR, "Data/Datasets", config.DATASET_FILENAME)
    print(f"Reading dataset: {dataset_path}")
    
    try:
        df = pd.read_csv(dataset_path)
    except Exception as e:
        print(f"Error reading CSV: {e}")
        return

    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        min_date = df['date'].min()
        max_date = df['date'].max()
        
        print(f"Dataset Date Range:")
        print(f"Min Date: {min_date}")
        print(f"Max Date: {max_date}")
        
        print(f"\nConfigured Dates:")
        print(f"START_DATE: {config.START_DATE}")
        print(f"END_DATE: {config.END_DATE}")
    else:
        print("Column 'date' not found.")

if __name__ == "__main__":
    check_dates()
