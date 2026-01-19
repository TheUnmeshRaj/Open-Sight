import json

import pandas as pd

csv_path = r'app/components/dataset_cleaned.csv'
df = pd.read_csv(csv_path, low_memory=False)

# Year-wise breakdown
print('=== YEAR-WISE CRIMES ===')
year_data = df.groupby('FIR_YEAR').size()
for year, count in year_data.items():
    print(f'{int(year)}: {count}')

# Month-wise breakdown
print('\n=== MONTHLY TRENDS ===')
monthly_data = df.groupby('FIR_MONTH').size().sort_index()
for month, count in monthly_data.items():
    print(f'Month {int(month)}: {count}')

# Day of week
print('\n=== DAY OF WEEK ===')
day_map = {1:'Mon', 2:'Tue', 3:'Wed', 4:'Thu', 5:'Fri', 6:'Sat', 7:'Sun'}
day_data = df.groupby('FIR_Day').size().sort_index()
for day, count in day_data.items():
    print(f'{day_map.get(day)}: {count}')

# Arrest rate
arrest_rate = (df['Arrested Count\tNo.'].sum() / df['Accused Count'].sum() * 100)
conviction_rate = (df['Conviction Count'].sum() / df['Accused Count'].sum() * 100)
print(f'\n=== RATES ===')
print(f'Arrest Rate: {arrest_rate:.2f}%')
print(f'Conviction Rate: {conviction_rate:.2f}%')

# FIR Stage
print('\n=== FIR STAGE ===')
stage_data = df['FIR_Stage'].value_counts()
for stage, count in stage_data.items():
    pct = count/len(df)*100
    print(f'{stage}: {count} ({pct:.1f}%)')

# Crime type breakdown
print('\n=== TOP 10 CRIME GROUPS ===')
crime_groups = df['CrimeGroup_Name'].value_counts().head(10)
for crime, count in crime_groups.items():
    pct = count/len(df)*100
    print(f'{crime}: {count} ({pct:.1f}%)')
