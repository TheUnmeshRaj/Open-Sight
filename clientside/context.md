# Project Context: Crime Hotspot Prediction System

## Overview
This project builds a data-driven crime hotspot prediction system for Bangalore city.
It uses historical spatiotemporal crime data to predict and visualize high-risk areas
on an interactive map, supporting proactive urban safety and resource allocation.

## Problem Context
- Crime data in India is fragmented (PDFs, police sites, static reports).
- Existing systems lack:
  - Location-level granularity
  - Temporal pattern analysis
  - Automated hotspot detection
- Decision-making is slow due to non-interactive, text-heavy summaries.

## Goal
Predict and visualize future crime hotspots using machine learning on historical
spatiotemporal data to enable proactive policing and public safety planning.

## Objectives
- Identify high-risk zones using spatial + temporal patterns.
- Provide interactive map-based visualization of crime risk.
- Support authorities, urban planners, and citizens with actionable insights.
- Use open data to promote sustainability, inclusivity, and resilience (SDG 9).

## Data
- Source: Open crime datasets (Kaggle, government portals, police public data).
- Required fields:
  - Timestamp
  - Latitude & Longitude
  - Crime type/category
- Format: CSV (raw → cleaned → feature-engineered).

## Core Pipeline
1. Data Collection
   - Download and store raw crime datasets.
2. Preprocessing
   - Remove invalid/missing coordinates
   - Standardize timestamps
   - Extract time features (hour, day, month, season)
   - Encode crime categories
3. Spatial Processing
   - Divide city into uniform grid cells
   - Assign crimes to grids using lat/long
   - Compute crime counts and density per grid
4. Model Training
   - Models: Random Forest, XGBoost, LightGBM
   - Task: Predict crime count per grid per time window
   - Metrics: MAE, RMSE
5. Hotspot Prediction
   - Predict future crime intensity
   - Classify grids as hotspot / non-hotspot using threshold
6. Visualization
   - Interactive maps with:
     - Heatmaps
     - Grid-based risk levels
     - Historical vs predicted hotspots
7. Deployment
   - Backend: Model inference API
   - Frontend: Web dashboard with map visualization

## Techniques Used
- Data cleaning and feature engineering
- Geospatial grid-based analysis
- Spatiotemporal pattern detection
- Machine learning (regression / classification)
- Interactive map visualization
- Web-based deployment

## Expected Output
- Interactive dashboard showing predicted crime hotspots
- Heatmaps and grid-based risk levels
- Improved understanding of where and when crimes are likely to occur

## Scope Notes
- Focus is on prediction + visualization, not law enforcement automation.
- Uses historical data; real-time streaming is out of scope.
- Designed to be extensible for future retraining and user-reported data.
