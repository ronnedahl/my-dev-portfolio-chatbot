
"""
Security testing script for Peterbot AI
Run this while your backend is running on localhost:8000
"""

import requests
import time
import json
from typing import Dict, List

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name: str):
    print(f"\n{Colors.BLUE}=== {name} ==={Colors.END}")

def print_success(message: str):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def print_error(message: str):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def print_info(message: str):
    print(f"{Colors.YELLOW}ℹ️  {message}{Colors.END}")

def test_security_headers():
    """Test security headers implementation"""
    print_test("Testing Security Headers")
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        headers = response.headers
        
        required_headers = {
            "X-Content-Type-Options": "nosniff",
            "X-Frame-Options": "DENY",
            "X-XSS-Protection": "1; mode=block",
            "Referrer-Policy": "strict-origin-when-cross-origin"
        }
        
        all_good = True
        for header, expected in required_headers.items():
            if header in headers:
                if headers[header] == expected:
                    print_success(f"{header}: {headers[header]}")
                else:
                    print_error(f"{header}: {headers[header]} (expected: {expected})")
                    all_good = False
            else:
                print_error(f"{header}: Missing")
                all_good = False
        
        # Check for Permissions-Policy (may vary)
        if "Permissions-Policy" in headers:
            print_success(f"Permissions-Policy: {headers['Permissions-Policy']}")
        
        return all_good
        
    except Exception as e:
        print_error(f"Failed to test headers: {str(e)}")
        return False

def test_rate_limiting():
    """Test rate limiting implementation"""
    print_test("Testing Rate Limiting")
    
    print_info("Sending 65 requests to test 60 req/min limit...")
    
    rate_limited = False
    for i in range(65):
        try:
            response = requests.post(
                f"{BASE_URL}/chat/",
                json={
                    "query": f"Test message {i+1}",
                    "conversation_id": "rate_limit_test",
                    "user_id": "test_user"
                },
                timeout=5
            )
            
            # Print rate limit info
            if i % 10 == 0 or response.status_code != 200:
                remaining = response.headers.get('X-RateLimit-Remaining', 'N/A')
                print(f"  Request {i+1}: Status {response.status_code}, Remaining: {remaining}")
            
            if response.status_code == 429:
                print_success(f"Rate limiting activated after {i+1} requests!")
                print_info(f"Response: {response.json()}")
                rate_limited = True
                break
                
            # Small delay to not overwhelm
            time.sleep(0.1)
            
        except Exception as e:
            print_error(f"Request {i+1} failed: {str(e)}")
    
    if not rate_limited:
        print_error("Rate limiting did not activate after 65 requests")
    
    return rate_limited

def test_protected_routes():
    """Test authentication on protected routes"""
    print_test("Testing Protected Routes")
    
    admin_endpoints = [
        "/admin/cache/stats",
        "/admin/cache/clear",
        "/admin/cache/cleanup",
        "/admin/vector-cache/info"
    ]
    
    all_protected = True
    
    for endpoint in admin_endpoints:
        try:
            # Test without auth
            response = requests.get(f"{BASE_URL}{endpoint}")
            
            if response.status_code == 401:
                print_success(f"{endpoint} - Protected (401)")
            else:
                print_error(f"{endpoint} - NOT PROTECTED! Status: {response.status_code}")
                all_protected = False
            
            # Test with invalid token
            headers = {"Authorization": "Bearer invalid-token-12345"}
            response = requests.get(f"{BASE_URL}{endpoint}", headers=headers)
            
            if response.status_code == 401:
                print_success(f"{endpoint} - Invalid token rejected")
            else:
                print_error(f"{endpoint} - Invalid token accepted! Status: {response.status_code}")
                all_protected = False
                
        except Exception as e:
            print_error(f"Failed to test {endpoint}: {str(e)}")
            all_protected = False
    
    return all_protected

def test_cors():
    """Test CORS configuration"""
    print_test("Testing CORS Configuration")
    
    try:
        # Test preflight request
        response = requests.options(
            f"{BASE_URL}/chat/",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            }
        )
        
        if response.status_code == 200:
            cors_headers = {
                "Access-Control-Allow-Origin": response.headers.get("Access-Control-Allow-Origin"),
                "Access-Control-Allow-Methods": response.headers.get("Access-Control-Allow-Methods"),
                "Access-Control-Allow-Headers": response.headers.get("Access-Control-Allow-Headers")
            }
            
            for header, value in cors_headers.items():
                if value:
                    print_success(f"{header}: {value}")
                else:
                    print_error(f"{header}: Missing")
            
            return True
        else:
            print_error(f"CORS preflight failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Failed to test CORS: {str(e)}")
        return False

def test_api_functionality():
    """Test basic API functionality"""
    print_test("Testing Basic API Functionality")
    
    try:
        # Test health endpoint
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print_success("Health endpoint working")
        else:
            print_error(f"Health endpoint failed: {response.status_code}")
        
        # Test chat endpoint
        response = requests.post(
            f"{BASE_URL}/chat/",
            json={
                "query": "Hej, fungerar säkerheten?",
                "conversation_id": "security_test",
                "user_id": "test_user"
            }
        )
        
        if response.status_code == 200:
            data = response.json()
            if "response" in data:
                print_success(f"Chat endpoint working - Response length: {len(data['response'])} chars")
            else:
                print_error("Chat endpoint returned no response")
        else:
            print_error(f"Chat endpoint failed: {response.status_code}")
            
        return True
        
    except Exception as e:
        print_error(f"API functionality test failed: {str(e)}")
        return False

def main():
    """Run all security tests"""
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}Peterbot AI Security Testing{Colors.END}")
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=2)
        print_success(f"Backend is running at {BASE_URL}")
    except:
        print_error(f"Backend is not running at {BASE_URL}")
        print_info("Please start the backend with: uv run uvicorn src.main:app --reload")
        return
    
    # Run tests
    results = {
        "Security Headers": test_security_headers(),
        "Protected Routes": test_protected_routes(),
        "Rate Limiting": test_rate_limiting(),
        "CORS": test_cors(),
        "API Functionality": test_api_functionality()
    }
    
    # Summary
    print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}Test Summary{Colors.END}")
    print(f"{Colors.BLUE}{'='*50}{Colors.END}")
    
    passed = sum(1 for result in results.values() if result)
    total = len(results)
    
    for test_name, result in results.items():
        if result:
            print_success(f"{test_name}")
        else:
            print_error(f"{test_name}")
    
    print(f"\n{Colors.BLUE}Total: {passed}/{total} tests passed{Colors.END}")
    
    if passed == total:
        print_success("\nAll security features are working correctly! 🎉")
    else:
        print_error("\nSome security features need attention!")

if __name__ == "__main__":
    main()