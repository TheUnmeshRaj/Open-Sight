# Spatio-Temporal Crime Prediction Model - Walkthrough

## 🚀 Overview
We have successfully refactored the codebase, integrated a custom Bengaluru dataset, and enhanced the visualization GUI with new features. The model is now prediction-ready and configured for deployment.

## ✨ Key Achievements
1.  **Refactoring**: Cleaned up legacy code (`CrimeAgent`, `VisualizationTool`) and streamlined the project structure.
2.  **Dataset**: Integrated `bengaluru_crime_post_2019_full.csv` and auto-calculated geographic bounds.
3.  **Visualization Enhancements**:
    *   **Place Search**: Added a sidebar search to "Indiranagar", "Koramangala", etc.
    *   **Map Styles**: Added `Heatmap (2D)` vs `Hexagon (3D)` toggle.
    *   **Filtering**: Added crime type multi-select filtering.
    *   **Label Visibility**: Improved by adjusting opacity and theme.
4.  **Deployment Prep**:
    *   Setup **Git LFS** for handling large model weights (>100MB).
    *   Cleaned `requirements.txt` (Added `geopy`).

## 🛠️ How to Run Locally

```bash
# Activate Environment
source venv/bin/activate

# Run GUI
streamlit run code/GUI.py
```

## 📦 Deployment Instructions (GitHub)

The project is now on the branch `khurana_model`. To upload everything (including the large model):

```bash
# 1. Push to your branch
git push -u origin khurana_model
```

_Note: The `BestModel.pt` file (~385MB) will be uploaded via Git LFS automatically._

## 📊 Features Showcase
### 1. Interactive 3D Map
Visualize crime density with height-based hexagons.

### 2. Area Search
Fly directly to neighborhoods of interest.

### 3. Smart Filtering
Toggle between specific crime types (Theft, Robbery, etc.) to see distinct patterns.
