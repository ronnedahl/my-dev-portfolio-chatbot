#!/usr/bin/env python3
"""
Simple test to see if CORS is working after fixes
"""

import requests

def test_simple_get():
    """Test simple GET request"""
    print("Testing simple GET request...")
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ GET request working")
            return True
        else:
            print(f"❌ GET failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ GET failed: {e}")
        return False

def test_options_health():
    """Test OPTIONS on health endpoint"""
    print("\nTesting OPTIONS /health...")
    try:
        response = requests.options(
            "http://localhost:8000/health",
            headers={"Origin": "http://localhost:5173"},
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        if response.status_code == 200:
            print("✅ OPTIONS /health working")
            return True
        else:
            print(f"❌ OPTIONS /health failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ OPTIONS /health failed: {e}")
        return False

def test_options_chat():
    """Test OPTIONS on chat endpoint"""
    print("\nTesting OPTIONS /chat/...")
    try:
        response = requests.options(
            "http://localhost:8000/chat/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            },
            timeout=5
        )
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        if response.status_code == 200:
            print("✅ OPTIONS /chat/ working")
            return True
        else:
            print(f"❌ OPTIONS /chat/ failed: {response.text}")
            return False
    except Exception as e:
        print(f"❌ OPTIONS /chat/ failed: {e}")
        return False

def main():
    print("=" * 40)
    print("Simple CORS Testing")
    print("=" * 40)
    
    tests = [
        ("GET /health", test_simple_get),
        ("OPTIONS /health", test_options_health), 
        ("OPTIONS /chat/", test_options_chat)
    ]
    
    results = {}
    for name, test_func in tests:
        results[name] = test_func()
    
    print("\n" + "=" * 40)
    print("Results:")
    for name, result in results.items():
        status = "✅" if result else "❌"
        print(f"{status} {name}")
    
    passed = sum(1 for r in results.values() if r)
    print(f"\nPassed: {passed}/{len(results)}")

if __name__ == "__main__":
    main()