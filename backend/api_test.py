"""
Test script for NIDS FastAPI Backend
Run this after starting the API server to test endpoints
"""

import requests
import json
import pandas as pd
from pathlib import Path

# API Configuration
BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("\n=== Testing Health Endpoint ===")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_model_info():
    """Test model info endpoint"""
    print("\n=== Testing Model Info Endpoint ===")
    response = requests.get(f"{BASE_URL}/model/info")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_labels():
    """Test labels endpoint"""
    print("\n=== Testing Labels Endpoint ===")
    response = requests.get(f"{BASE_URL}/labels")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_predict():
    """Test prediction endpoint with sample data"""
    print("\n=== Testing Prediction Endpoint ===")
    
    # Sample flow data
    sample_flows = [
        {
            "bidirectional_first_seen_ms": 1609459200000,
            "bidirectional_last_seen_ms": 1609459201000,
            "bidirectional_duration_ms": 1000,
            "src_port": 443,
            "dst_port": 12345,
            "protocol": 6,
            "src2dst_packets": 10,
            "dst2src_packets": 8,
            "src2dst_bytes": 5000,
            "dst2src_bytes": 3000,
            "src2dst_min_piat_ms": 10,
            "src2dst_max_piat_ms": 100,
            "src2dst_mean_piat_ms": 50,
            "src2dst_stddev_piat_ms": 20,
            "dst2src_min_piat_ms": 15,
            "dst2src_max_piat_ms": 90,
            "dst2src_mean_piat_ms": 45,
            "dst2src_stddev_piat_ms": 18
        }
    ]
    
    payload = {"flows": sample_flows}
    
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_csv_upload():
    """Test CSV upload endpoint"""
    print("\n=== Testing CSV Upload Endpoint ===")
    
    # Check if flow_features.csv exists
    csv_path = Path("flow_features.csv")
    if not csv_path.exists():
        print("❌ flow_features.csv not found. Skipping CSV upload test.")
        return False
    
    with open(csv_path, 'rb') as f:
        files = {'file': ('flow_features.csv', f, 'text/csv')}
        response = requests.post(f"{BASE_URL}/predict/csv", files=files)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_results_list():
    """Test results listing endpoint"""
    print("\n=== Testing Results List Endpoint ===")
    response = requests.get(f"{BASE_URL}/results")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def test_stats():
    """Test statistics endpoint"""
    print("\n=== Testing Statistics Endpoint ===")
    response = requests.get(f"{BASE_URL}/stats")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    return response.status_code == 200


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("NIDS API Test Suite")
    print("=" * 60)
    
    tests = [
        ("Health Check", test_health),
        ("Model Info", test_model_info),
        ("Attack Labels", test_labels),
        ("Prediction", test_predict),
        ("CSV Upload", test_csv_upload),
        ("Results List", test_results_list),
        ("Statistics", test_stats)
    ]
    
    results = {}
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except requests.exceptions.ConnectionError:
            print(f"\n❌ Connection Error: Make sure the API server is running at {BASE_URL}")
            return
        except Exception as e:
            print(f"\n❌ Error in {test_name}: {str(e)}")
            results[test_name] = False
    
    # Print summary
    print("\n" + "=" * 60)
    print("Test Summary")
    print("=" * 60)
    for test_name, passed in results.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    total = len(results)
    passed = sum(results.values())
    print(f"\nTotal: {passed}/{total} tests passed")


if __name__ == "__main__":
    run_all_tests()
