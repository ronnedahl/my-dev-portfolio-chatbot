
"""
Test middleware fixes
"""

import requests
import time

BASE_URL = "http://localhost:8000"

def test_health_endpoint():
    """Test health endpoint after middleware fix"""
    print("Testing health endpoint...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            print("✅ Health endpoint working!")
            return True
        else:
            print(f"❌ Health endpoint failed: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Health test failed: {str(e)}")
        return False

def test_cors_options():
    """Test CORS OPTIONS request"""
    print("\nTesting CORS OPTIONS...")
    
    try:
        response = requests.options(
            f"{BASE_URL}/chat/",
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
            cors_origin = response.headers.get("Access-Control-Allow-Origin")
            if cors_origin:
                print(f"✅ CORS working! Origin: {cors_origin}")
                return True
            else:
                print("❌ CORS headers missing")
                return False
        else:
            print(f"❌ CORS OPTIONS failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ CORS test failed: {str(e)}")
        return False

def test_security_headers():
    """Test security headers"""
    print("\nTesting security headers...")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        expected_headers = [
            "X-Content-Type-Options",
            "X-Frame-Options", 
            "X-XSS-Protection",
            "Referrer-Policy"
        ]
        
        missing_headers = []
        for header in expected_headers:
            if header not in response.headers:
                missing_headers.append(header)
            else:
                print(f"✅ {header}: {response.headers[header]}")
        
        if missing_headers:
            print(f"❌ Missing headers: {missing_headers}")
            return False
        else:
            print("✅ All security headers present!")
            return True
            
    except Exception as e:
        print(f"❌ Security headers test failed: {str(e)}")
        return False

def main():
    print("=" * 50)
    print("Middleware Fix Testing")
    print("=" * 50)
    
    results = {
        "Health Endpoint": test_health_endpoint(),
        "CORS OPTIONS": test_cors_options(), 
        "Security Headers": test_security_headers()
    }
    
    print("\n" + "=" * 50)
    print("Results:")
    print("=" * 50)
    
    passed = 0
    for test_name, result in results.items():
        if result:
            print(f"✅ {test_name}")
            passed += 1
        else:
            print(f"❌ {test_name}")
    
    print(f"\nPassed: {passed}/{len(results)} tests")
    
    if passed == len(results):
        print("🎉 All middleware tests passed!")
    else:
        print("❌ Some tests failed - check output above")

if __name__ == "__main__":
    main()