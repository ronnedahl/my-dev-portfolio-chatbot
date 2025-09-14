
"""
Test CORS configuration after fixes
"""

import requests
import time
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def test_cors_preflight():
    """Test CORS preflight request"""
    print(f"{Colors.BLUE}Testing CORS Preflight Request{Colors.END}")
    
    try:
        # Test OPTIONS preflight request
        response = requests.options(
            f"{BASE_URL}/chat/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            },
            timeout=5
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            cors_origin = response.headers.get("Access-Control-Allow-Origin")
            cors_methods = response.headers.get("Access-Control-Allow-Methods")
            
            if cors_origin:
                print(f"{Colors.GREEN}✅ CORS Origin: {cors_origin}{Colors.END}")
            else:
                print(f"{Colors.RED}❌ CORS Origin header missing{Colors.END}")
            
            if cors_methods:
                print(f"{Colors.GREEN}✅ CORS Methods: {cors_methods}{Colors.END}")
            else:
                print(f"{Colors.RED}❌ CORS Methods header missing{Colors.END}")
            
            return True
        else:
            print(f"{Colors.RED}❌ Preflight failed with status: {response.status_code}{Colors.END}")
            print(f"Response body: {response.text}")
            return False
            
    except Exception as e:
        print(f"{Colors.RED}❌ CORS preflight test failed: {str(e)}{Colors.END}")
        return False

def test_actual_request():
    """Test actual POST request after preflight"""
    print(f"\n{Colors.BLUE}Testing Actual POST Request{Colors.END}")
    
    try:
        response = requests.post(
            f"{BASE_URL}/chat/",
            json={
                "query": "Test CORS fix",
                "conversation_id": "cors_test",
                "user_id": "test_user"
            },
            headers={
                "Origin": "http://localhost:5173",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"{Colors.GREEN}✅ POST request successful{Colors.END}")
            print(f"Response length: {len(data.get('response', ''))} chars")
            return True
        else:
            print(f"{Colors.RED}❌ POST request failed: {response.status_code}{Colors.END}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"{Colors.RED}❌ POST request failed: {str(e)}{Colors.END}")
        return False

def test_health_check():
    """Test health endpoint"""
    print(f"\n{Colors.BLUE}Testing Health Endpoint{Colors.END}")
    
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        
        if response.status_code == 200:
            print(f"{Colors.GREEN}✅ Health check OK{Colors.END}")
            return True
        else:
            print(f"{Colors.RED}❌ Health check failed: {response.status_code}{Colors.END}")
            return False
            
    except Exception as e:
        print(f"{Colors.RED}❌ Health check failed: {str(e)}{Colors.END}")
        return False

def main():
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}CORS Fix Testing{Colors.END}")
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    
    # Check if backend is running
    if not test_health_check():
        print(f"\n{Colors.RED}Backend is not running at {BASE_URL}{Colors.END}")
        print(f"{Colors.YELLOW}Please start the backend with: uv run uvicorn src.main:app --reload{Colors.END}")
        return
    
    results = {
        "CORS Preflight": test_cors_preflight(),
        "POST Request": test_actual_request()
    }
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}Test Summary{Colors.END}")
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print(f"{Colors.GREEN}✅ {test_name}{Colors.END}")
        else:
            print(f"{Colors.RED}❌ {test_name}{Colors.END}")
    
    print(f"\n{Colors.BLUE}Total: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print(f"{Colors.GREEN}🎉 All CORS tests passed! The fix is working!{Colors.END}")
    else:
        print(f"{Colors.RED}❌ Some CORS tests failed. Check the output above.{Colors.END}")

if __name__ == "__main__":
    main()