#!/usr/bin/env python3
"""
Debug middleware setup to understand CORS issues
"""

import sys
import os
sys.path.append('langgraph-api')

# Try to import and check middleware setup
try:
    from src.middleware.security import setup_security_middleware
    from src.config.settings import Settings
    print("✅ Imports successful")
    
    # Check settings
    settings = Settings()
    print(f"✅ Settings loaded - API_ENV: {settings.api_env}")
    
    # Create a fake FastAPI app to test middleware setup
    class FakeApp:
        def __init__(self):
            self.middleware_stack = []
            
        def add_middleware(self, middleware_class, **kwargs):
            self.middleware_stack.append({
                'class': middleware_class.__name__,
                'kwargs': kwargs
            })
            print(f"Added middleware: {middleware_class.__name__}")
    
    # Test middleware setup
    fake_app = FakeApp()
    setup_security_middleware(fake_app)
    
    print("\nMiddleware stack:")
    for i, middleware in enumerate(fake_app.middleware_stack):
        print(f"{i+1}. {middleware['class']}")
        if middleware['kwargs']:
            for key, value in middleware['kwargs'].items():
                print(f"   {key}: {value}")
    
    print("\n✅ Middleware setup test completed successfully")
    
except Exception as e:
    print(f"❌ Error: {str(e)}")
    import traceback
    traceback.print_exc()