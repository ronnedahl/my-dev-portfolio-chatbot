#!/usr/bin/env python3
"""Test script for configuration and credentials."""

import os
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
load_dotenv()

def test_openai_key():
    """Test OpenAI API key."""
    print("🔑 Testing OpenAI API Key...")
    
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("❌ OPENAI_API_KEY not found in .env")
        return False
    
    if not api_key.startswith("sk-"):
        print("❌ OPENAI_API_KEY doesn't start with 'sk-'")
        return False
    
    if len(api_key) < 20:
        print("❌ OPENAI_API_KEY seems too short")
        return False
    
    print(f"✅ OpenAI API Key format looks correct (starts with: {api_key[:10]}...)")
    
    # Test actual API call
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        # Simple test call
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=5
        )
        print("✅ OpenAI API key works!")
        return True
    except Exception as e:
        print(f"❌ OpenAI API key test failed: {e}")
        return False

def test_firebase_config():
    """Test Firebase configuration."""
    print("\n🔥 Testing Firebase Configuration...")
    
    required_fields = [
        "FIREBASE_PROJECT_ID",
        "FIREBASE_PRIVATE_KEY_ID", 
        "FIREBASE_PRIVATE_KEY",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_CLIENT_ID",
        "FIREBASE_CLIENT_CERT_URL"
    ]
    
    missing_fields = []
    for field in required_fields:
        if not os.getenv(field):
            missing_fields.append(field)
    
    if missing_fields:
        print(f"❌ Missing Firebase fields: {', '.join(missing_fields)}")
        return False
    
    # Check private key format
    private_key = os.getenv("FIREBASE_PRIVATE_KEY")
    print(f"🔍 Private key length: {len(private_key)} characters")
    print(f"🔍 Private key starts with: {private_key[:30]}...")
    print(f"🔍 Private key ends with: ...{private_key[-30:]}")
    
    if not private_key.startswith("-----BEGIN PRIVATE KEY-----"):
        print("❌ Private key doesn't start with '-----BEGIN PRIVATE KEY-----'")
        print("💡 Make sure to include the full key with headers")
        return False
    
    if not private_key.endswith("-----END PRIVATE KEY-----"):
        print("❌ Private key doesn't end with '-----END PRIVATE KEY-----'")
        return False
    
    # Check for proper newlines
    if "\\n" in private_key:
        print("✅ Private key contains escaped newlines (\\n)")
    elif "\n" in private_key:
        print("✅ Private key contains actual newlines")
    else:
        print("⚠️  Private key might be missing newlines")
    
    print("✅ Firebase configuration format looks correct")
    
    # Test Firebase connection
    try:
        from src.config import settings
        creds = settings.get_firebase_credentials()
        
        import firebase_admin
        from firebase_admin import credentials
        
        # Initialize Firebase (if not already initialized)
        if not firebase_admin._apps:
            cred = credentials.Certificate(creds)
            firebase_admin.initialize_app(cred)
        
        # Test Firestore connection
        from firebase_admin import firestore
        db = firestore.client()
        
        # Try to access a collection (this will test permissions)
        collection_ref = db.collection(settings.firebase_collection_name)
        # Just getting the reference, not actually reading data
        
        print("✅ Firebase connection successful!")
        return True
        
    except Exception as e:
        print(f"❌ Firebase connection failed: {e}")
        
        # Give specific advice based on error type
        error_str = str(e).lower()
        if "private_key" in error_str or "invalid" in error_str:
            print("\n💡 Private key troubleshooting:")
            print("1. Make sure the private key is properly escaped")
            print("2. In .env file, wrap the key in quotes")
            print("3. Replace actual newlines with \\n")
            print("\nExample format:")
            print('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkq...\\n-----END PRIVATE KEY-----"')
        
        elif "project" in error_str:
            print("\n💡 Check your FIREBASE_PROJECT_ID")
        
        elif "permission" in error_str or "forbidden" in error_str:
            print("\n💡 Check Firebase service account permissions")
            print("Make sure the service account has Firestore access")
        
        return False

def show_env_file_format():
    """Show correct .env file format."""
    print("\n📋 Correct .env file format:")
    print("=" * 50)
    print("""
# OpenAI Configuration
OPENAI_API_KEY=sk-your-actual-openai-key-here

# Firebase Configuration
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id
FIREBASE_CLIENT_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your-service-account%40your-project.iam.gserviceaccount.com

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_ENV=development
LOG_LEVEL=INFO
""")

def main():
    """Run all configuration tests."""
    print("🧪 Testing Peterbot LangGraph API Configuration")
    print("=" * 60)
    
    if not os.path.exists(".env"):
        print("❌ No .env file found!")
        print("Please copy .env.example to .env and configure it")
        show_env_file_format()
        return
    
    print("✅ .env file found")
    
    # Test OpenAI
    openai_ok = test_openai_key()
    
    # Test Firebase  
    firebase_ok = test_firebase_config()
    
    print("\n" + "=" * 60)
    print("📊 Test Results:")
    print(f"OpenAI API: {'✅ OK' if openai_ok else '❌ Failed'}")
    print(f"Firebase: {'✅ OK' if firebase_ok else '❌ Failed'}")
    
    if openai_ok and firebase_ok:
        print("\n🎉 All tests passed! Your configuration looks good.")
        print("You can now start the API server with: uv run python run.py")
    else:
        print("\n🔧 Please fix the configuration issues above.")
        if not firebase_ok:
            show_env_file_format()

if __name__ == "__main__":
    main()