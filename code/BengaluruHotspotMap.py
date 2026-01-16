import torch
import folium
from folium.plugins import HeatMap
import numpy as np
import os

import config
from LSTMModel import ConvLSTMModel
from DataPreLoader import DataPreLoader

# ------------------------------------------------
# Load trained ConvLSTM model
# ------------------------------------------------
device = torch.device("cpu")

model = ConvLSTMModel(
    input_dim=config.CRIME_TYPE_NUM,
    hidden_dim=config.HIDDEN_DIM,
    kernel_size=config.KERNEL_SIZE,
    bias=True
).to(device)

checkpoint_path = os.path.join(config.MODEL_SAVE_PATH, "BestModel.pt")
checkpoint = torch.load(checkpoint_path, map_location=device)

model.load_state_dict(checkpoint["model"])
model.eval()

# ------------------------------------------------
# Load test data
# ------------------------------------------------
prep_path = os.path.join(config.PROJECT_DIR, "Data/PreprocessedDatasets")

test_data = DataPreLoader(
    prepDatasetsPath=prep_path,
    device=device,
    name="test"
)

# Take one test sample
X, _ = test_data[0]
X = X.unsqueeze(0)  # add batch dimension

# ------------------------------------------------
# Run model prediction
# ------------------------------------------------
with torch.no_grad():
    pred = model(X)

# Expected shape: [1, 1, crime_types, 50, 50]
pred = pred.squeeze().cpu().numpy()

# Ensure correct shape
pred = pred.reshape(
    config.CRIME_TYPE_NUM,
    config.LAT_GRIDS,
    config.LON_GRIDS
)

# Average across crime types → (50, 50)
pred = pred.mean(axis=0)

# ------------------------------------------------
# 🔥 NORMALIZE PREDICTIONS (CRITICAL)
# ------------------------------------------------
pred = pred.astype(float)
pred = pred - pred.min()
pred = pred / (pred.max() + 1e-8)

print("Prediction statistics:")
print("Min:", pred.min())
print("Max:", pred.max())
print("Non-zero grid cells:", np.count_nonzero(pred))

# ------------------------------------------------
# Convert grid predictions → lat/lon heatmap
# ------------------------------------------------
heat_data = []

# Percentile-based hotspot selection
cutoff = np.percentile(pred, 85)  # top 15% grids

for x in range(config.LAT_GRIDS):
    for y in range(config.LON_GRIDS):
        intensity = pred[x, y]
        if intensity >= cutoff:
            lat, lon = config.grid2coord(x + 1, y + 1)
            heat_data.append([lat, lon, float(intensity)])

print(f"Hotspot cells plotted: {len(heat_data)}")

# ------------------------------------------------
# Create Bengaluru map
# ------------------------------------------------
bengaluru_map = folium.Map(
    location=[12.9716, 77.5946],
    zoom_start=11,
    tiles="cartodbpositron"
)

HeatMap(
    heat_data,
    radius=18,
    blur=22,
    min_opacity=0.3,
    max_zoom=13
).add_to(bengaluru_map)

# ------------------------------------------------
# Save output
# ------------------------------------------------
output_dir = os.path.join(config.PROJECT_DIR, "Outputs")
os.makedirs(output_dir, exist_ok=True)

out_path = os.path.join(output_dir, "bengaluru_crime_hotspots.html")
bengaluru_map.save(out_path)

print(f"✅ Bengaluru crime hotspot map saved at:\n{out_path}")