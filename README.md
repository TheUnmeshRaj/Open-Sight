# OpenSight - Crime Hotspot Prediction System

A full stack application for predicting and visualizing crime hotspots using machine learning and spatiotemporal analysis.

## Features

- **Interactive Map Dashboard**: Real-time visualization of crime hotspots with risk levels
- **Predictive Analytics**: ML-powered crime prediction for multiple cities
- **Risk Assessment**: Grid-based risk classification (High/Medium/Low)
- **Time Series Analysis**: Historical crime trends and predictions
- **User Authentication**: Secure login with Supabase
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Technology Stack

### Frontend
- **Next.js 16**: React framework with server-side rendering
- **React 19**: UI components and state management
- **Leaflet & React-Leaflet**: Interactive mapping
- **Recharts**: Data visualization and charts
- **Tailwind CSS**: Utility-first CSS framework
- **Supabase**: Authentication and database

### Backend
- **Flask**: Lightweight Python web framework
- **Flask-CORS**: Cross-origin resource sharing
- **NumPy/Pandas**: Data processing and analysis
- **Scikit-learn**: Machine learning models
- **Geopandas**: Geospatial data handling

## Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Supabase account (for authentication)

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd d:\Dev\opensight
   ```

2. **Setup Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python app.py
   ```
   Backend runs on: http://localhost:5000

3. **Setup Frontend**
   ```bash
   cd ../clientside
   npm install
   npm run dev
   ```
   Frontend runs on: http://localhost:3000

4. **Configure Environment**
   - Copy `.env.example.local` to `.env.local` in `clientside/`
   - Add your Supabase credentials

## API Documentation

### Core Endpoints

#### Get Hotspots
```
GET /api/hotspots
?city=bangalore&threshold=0.5&date=2024-01-15
```
Returns list of crime hotspots with risk levels and crime counts.

#### Get Predictions
```
GET /api/predictions
?city=bangalore&timeWindow=current
```
Returns predicted hotspots for specified time window.

#### Get Statistics
```
GET /api/statistics
?city=bangalore
```
Returns aggregated statistics, trends, and insights.

#### Train Model
```
POST /api/train
{ "city": "bangalore" }
```
Initiates model retraining process.

## Data Pipeline

1. **Data Collection**: Aggregates crime data from multiple sources
2. **Preprocessing**: Cleans and standardizes location and timestamp data
3. **Feature Engineering**: Extracts temporal and spatial features
4. **Spatial Processing**: Divides city into grid cells
5. **Model Training**: Trains predictive models on historical data
6. **Prediction**: Generates risk predictions for future hotspots
7. **Visualization**: Displays results on interactive maps

## Supported Cities

- Bangalore (primary)
- Delhi
- Mumbai
- New York

## Dashboard Features

### Control Panel
- City selection
- Risk threshold adjustment (0.0 - 1.0)
- Time window selection (Current/Week/Month/Quarter)
- Data refresh controls

### Statistics Cards
- Active hotspots count
- Total crimes recorded
- Average risk level
- Model prediction accuracy

### Interactive Map
- Color-coded markers (Red=High, Yellow=Medium, Green=Low)
- Risk level indicators
- Crime count information
- Hover tooltips with coordinates

### Hotspots Table
- Detailed list of all active hotspots
- Risk level indicators
- Crime counts
- Geographic coordinates

## Project Structure

```
opensight/
├── backend/
│   ├── app.py                 # Flask API server
│   ├── requirements.txt        # Python dependencies
│   ├── code/
│   │   ├── CrimeModel.py      # ML models
│   │   ├── CrimeDataAdapter.py # Data processing
│   │   └── ...
│   └── Data/
│       ├── Datasets/          # Crime data files
│       └── ShapeBorough/      # Geographic shapefiles
├── clientside/
│   ├── app/
│   │   ├── api/               # Next.js API routes
│   │   ├── login/             # Auth page
│   │   └── page.tsx           # Dashboard
│   ├── components/
│   │   ├── HotspotMap.tsx     # Map visualization
│   │   ├── Statistics.tsx     # Stats cards
│   │   └── ControlPanel.tsx   # Controls
│   ├── lib/
│   │   └── supabase/          # Supabase config
│   └── package.json
├── SETUP.md                   # Setup instructions
└── README.md                  # This file
```

## Authentication

Uses Supabase for secure user authentication:
1. Sign up / Sign in via email
2. Session tokens stored securely
3. Automatic redirection on logout
4. Protected dashboard routes

## Performance Optimization

- Client-side map rendering with React-Leaflet
- Lazy loading of components
- API response caching
- Responsive grid layout
- Optimized data fetching

## Contributing

Guidelines for contributing to the project:
1. Fork the repository
2. Create a feature branch
3. Make changes with clear commit messages
4. Submit a pull request

## License

This project is part of the OpenSight initiative for sustainable urban safety.

## Support & Documentation

- **Setup Guide**: See [SETUP.md](SETUP.md)
- **Issues**: Report bugs or request features via GitHub issues
- **API Docs**: Available at `/api/docs` (when deployed)

## Roadmap

- [ ] Real-time crime data integration
- [ ] Advanced filtering and search
- [ ] Export predictions to CSV/GeoJSON
- [ ] Mobile app version
- [ ] Community reporting features
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
