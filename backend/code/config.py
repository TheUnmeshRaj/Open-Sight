# Adapted config for custom crime hotspot prediction

import os
import numpy as np

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

###################################################################
# Dataset configuration
###################################################################

# Single aggregated crime channel
CRIME_TYPE = ["crime"]
CRIME_TYPE_NUM = 1

# -------- CHANGE THESE TO MATCH YOUR CITY --------
# Set bounds based on your dataset min/max
# Bengaluru bounding box
LAT_MIN = 12.80
LAT_MAX = 13.15
LON_MIN = 77.45
LON_MAX = 77.80
# ------------------------------------------------

# Grid resolution
LAT_GRIDS = 50
LON_GRIDS = 50

# Sequence length (past days used for prediction)
SEQ_LEN = 12

# Dates (used only for slicing, not strict)
START_DATE = "'2019-01-01'"
START_SELECT_DATE = "'2019-02-01'"
END_DATE = "'2025-12-31'"
TRAIN_VAL_DATE = "'2024-01-01'"
VAL_TEST_DATE = "'2025-01-01'"

###################################################################
# Grid helper functions
###################################################################

LAT_BINS = np.linspace(start=LAT_MIN, stop=LAT_MAX, num=LAT_GRIDS + 1)
LON_BINS = np.linspace(start=LON_MIN, stop=LON_MAX, num=LON_GRIDS + 1)

def coord2grid(lats, longs):
    cell_x = np.digitize(lats, LAT_BINS, right=True)
    cell_y = np.digitize(longs, LON_BINS, right=True)

    cell_x = [-1 if i == 0 or i == len(LAT_BINS) else i for i in cell_x]
    cell_y = [-1 if i == 0 or i == len(LON_BINS) else i for i in cell_y]

    return cell_x, cell_y

def grid2coord(x, y):
    lat = LAT_BINS[x]
    lon = LON_BINS[y]
    return lat, lon

###################################################################
# LSTM model parameters
###################################################################

DROP_P = 0.5
HIDDEN_DIM = 64
KERNEL_SIZE = 3

###################################################################
# Training configuration
###################################################################

DEVICE = "cpu"  

BCE_WEIGHTS = [1, 20]

RANDOM_SEED = 42
TRAIN_BATCH_SIZE = 16
LEARNING_RATE = 3e-5
N_EPOCHS = 5

SAVE = True
MODEL_SAVE_PATH = PROJECT_DIR + "/Data/ModelWeights"

CLASS_THRESH = 0.5
MULTIPLY_FACTOR = 0.3