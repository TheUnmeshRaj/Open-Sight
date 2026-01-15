"""
Crime Hotspot Prediction API Server
Backend Flask application for serving crime predictions and hotspot data
"""

import os
import sys
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# Add backend code directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'code'))

app = Flask(__name__)
CORS(app)

# Configuration
app.config['JSON_SORT_KEYS'] = False
BACKEND_PORT = int(os.getenv('BACKEND_PORT', 5000))
BACKEND_DEBUG = os.getenv('BACKEND_DEBUG', 'False') == 'True'

# Mock data generators (replace with actual model inference later)
def generate_mock_hotspots(city: str, threshold: float = 0.5):
    """Generate mock hotspot data for demonstration"""
    cities_data = {
        'bangalore': {
            'center': [12.9716, 77.5946],
            'hotspots': [
                {'lat': 12.9352, 'lon': 77.6245, 'risk': 0.85},
                {'lat': 12.9716, 'lon': 77.5946, 'risk': 0.72},
                {'lat': 12.935, 'lon': 77.62, 'risk': 0.68},
                {'lat': 13.0027, 'lon': 77.5914, 'risk': 0.61},
                {'lat': 12.9142, 'lon': 77.6391, 'risk': 0.55},
            ]
        },
        'delhi': {
            'center': [28.7041, 77.1025],
            'hotspots': [
                {'lat': 28.7041, 'lon': 77.1025, 'risk': 0.89},
                {'lat': 28.6328, 'lon': 77.2197, 'risk': 0.76},
            ]
        },
        'mumbai': {
            'center': [19.0760, 72.8777],
            'hotspots': [
                {'lat': 19.0760, 'lon': 72.8777, 'risk': 0.82},
                {'lat': 19.0176, 'lon': 72.8479, 'risk': 0.71},
            ]
        },
        'newyork': {
            'center': [40.7128, -74.0060],
            'hotspots': [
                {'lat': 40.7128, 'lon': -74.0060, 'risk': 0.88},
                {'lat': 40.7580, 'lon': -73.9855, 'risk': 0.75},
                {'lat': 40.6892, 'lon': -74.0445, 'risk': 0.63},
            ]
        }
    }

    city_data = cities_data.get(city.lower(), cities_data['bangalore'])
    hotspots = []

    for idx, hs in enumerate(city_data['hotspots']):
        if hs['risk'] >= threshold:
            risk_level = 'high' if hs['risk'] >= 0.75 else ('medium' if hs['risk'] >= 0.6 else 'low')
            hotspots.append({
                'id': f'hotspot-{city}-{idx}',
                'latitude': hs['lat'],
                'longitude': hs['lon'],
                'riskLevel': risk_level,
                'crimeCount': int(50 * hs['risk']) + 10,
            })

    return hotspots

def generate_mock_statistics(city: str):
    """Generate mock statistics for demonstration"""
    hotspots = generate_mock_hotspots(city, threshold=0.0)
    
    total_crimes = sum(hs['crimeCount'] for hs in hotspots)
    avg_risk = np.mean([0.85, 0.72, 0.68, 0.61, 0.55])
    
    # Generate mock time series data
    time_series = []
    base_date = datetime.now() - timedelta(days=30)
    for i in range(30):
        date = (base_date + timedelta(days=i)).strftime('%Y-%m-%d')
        crimes = int(total_crimes / 30 + np.random.normal(0, 5))
        predicted = int(total_crimes / 30 + np.random.normal(0, 3))
        time_series.append({
            'date': date,
            'crimes': max(0, crimes),
            'predicted': max(0, predicted)
        })

    return {
        'hotspotsCount': len(hotspots),
        'totalCrimes': total_crimes,
        'averageRiskLevel': float(avg_risk),
        'predictionAccuracy': 0.85,
        'timeSeriesData': time_series
    }

# API Routes

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/api/hotspots', methods=['GET'])
def get_hotspots():
    """Get crime hotspots for a city and threshold"""
    try:
        city = request.args.get('city', 'bangalore')
        threshold = float(request.args.get('threshold', 0.5))
        date = request.args.get('date')

        hotspots = generate_mock_hotspots(city, threshold)

        return jsonify({
            'city': city,
            'threshold': threshold,
            'date': date or datetime.now().strftime('%Y-%m-%d'),
            'hotspots': hotspots,
            'count': len(hotspots)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/predictions', methods=['GET'])
def get_predictions():
    """Get model predictions for a city"""
    try:
        city = request.args.get('city', 'bangalore')
        time_window = request.args.get('timeWindow', 'current')

        # In production, this would call the actual ML model
        predictions = {
            'city': city,
            'timeWindow': time_window,
            'timestamp': datetime.now().isoformat(),
            'data': generate_mock_hotspots(city, 0.0)
        }

        return jsonify(predictions)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/statistics', methods=['GET'])
def get_statistics():
    """Get statistics and insights for a city"""
    try:
        city = request.args.get('city', 'bangalore')

        stats = generate_mock_statistics(city)

        return jsonify(stats)

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train', methods=['POST'])
def train_model():
    """Trigger model retraining (placeholder)"""
    try:
        data = request.get_json()
        city = data.get('city', 'bangalore')

        return jsonify({
            'status': 'training_started',
            'city': city,
            'message': 'Model training initiated. Check back later for results.',
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    """Handle 500 errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("Starting Crime Hotspot Prediction API Server...")
    print(f"Running on http://localhost:{BACKEND_PORT}")
    app.run(host='0.0.0.0', port=BACKEND_PORT, debug=BACKEND_DEBUG)
