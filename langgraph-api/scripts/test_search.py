#!/usr/bin/env python3
"""Test script for Firebase vector store search."""

import os
import sys
import asyncio
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
load_dotenv()

async def test_firebase_search():
    """Test Firebase vector store search functionality."""
    print("🔍 Testing Firebase Vector Store Search...")
    
    try:
        from src.services import FirebaseVectorStore
        
        # Initialize vector store
        print("📝 Initializing Firebase Vector Store...")
        vector_store = FirebaseVectorStore()
        print("✅ Vector store initialized")
        
        # Test search with a simple query
        print("\n🔎 Testing search with query: 'Peter ålder age'")
        results = await vector_store.search(
            query="Peter ålder age",
            top_k=5,
            threshold=0.5
        )
        
        print(f"📊 Found {len(results)} results:")
        for i, result in enumerate(results, 1):
            print(f"\n{i}. Document ID: {result['id']}")
            print(f"   Text: {result['text'][:100]}...")
            print(f"   Similarity: {result['similarity']:.3f}")
            if result.get('metadata'):
                print(f"   Metadata: {result['metadata']}")
        
        if not results:
            print("⚠️  No results found. This could mean:")
            print("   1. No documents in Firebase collection")
            print("   2. Documents don't match the query")
            print("   3. Similarity threshold too high")
            
            # Try listing all documents
            print("\n📋 Listing all documents in collection...")
            try:
                docs, total = await vector_store.list_documents(limit=10)
                print(f"Total documents in collection: {total}")
                
                if docs:
                    print("Available documents:")
                    for doc in docs[:5]:  # Show first 5
                        print(f"- {doc.get('text', 'No text')[:80]}...")
                else:
                    print("❌ No documents found in Firebase collection!")
                    print("💡 You need to add documents first using the /documents/ API endpoint")
            except Exception as e:
                print(f"❌ Failed to list documents: {e}")
        
        return len(results) > 0
        
    except Exception as e:
        print(f"❌ Firebase search test failed: {e}")
        
        # Give specific troubleshooting advice
        error_str = str(e).lower()
        if "firebase" in error_str or "firestore" in error_str:
            print("\n💡 Firebase troubleshooting:")
            print("1. Check Firebase credentials in .env")
            print("2. Verify Firebase project has Firestore enabled")
            print("3. Check service account permissions")
        elif "openai" in error_str or "embedding" in error_str:
            print("\n💡 OpenAI troubleshooting:")
            print("1. Check OPENAI_API_KEY in .env")
            print("2. Verify API key has sufficient credits")
        
        return False

async def test_add_sample_document():
    """Add a sample document for testing."""
    print("\n📝 Adding sample document for testing...")
    
    try:
        from src.services import FirebaseVectorStore
        
        vector_store = FirebaseVectorStore()
        
        # Add a test document about Peter's age
        doc_id = await vector_store.add_document(
            text="Peter är 28 år gammal och bor i Stockholm. Han studerade datateknik på KTH.",
            metadata={
                "category": "personal_info",
                "topic": "age_location_education"
            }
        )
        
        print(f"✅ Added sample document with ID: {doc_id}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to add sample document: {e}")
        return False

async def test_full_agent():
    """Test the full LangGraph agent."""
    print("\n🤖 Testing full LangGraph agent...")
    
    try:
        from src.core.agent import run_agent
        
        result = await run_agent(
            query="Hur gammal är Peter?",
            conversation_id="test_conversation",
            user_id="test_user"
        )
        
        print("Agent response:")
        print(f"Response: {result.get('response', 'No response')}")
        print(f"Retrieved context: {len(result.get('retrieved_context', []))} documents")
        print(f"Error: {result.get('error', 'None')}")
        
        if result.get('retrieved_context'):
            print("\nRetrieved context:")
            for doc in result['retrieved_context']:
                print(f"- {doc.get('text', 'No text')[:100]}...")
        
        return result.get('response') and not result.get('error')
        
    except Exception as e:
        print(f"❌ Agent test failed: {e}")
        return False

async def main():
    """Run all search tests."""
    print("🧪 Testing Firebase Vector Store and Search")
    print("=" * 60)
    
    # Test basic search
    search_ok = await test_firebase_search()
    
    # If no results, try adding a sample document
    if not search_ok:
        print("\n" + "=" * 40)
        add_ok = await test_add_sample_document()
        
        if add_ok:
            # Test search again
            print("\n" + "=" * 40)
            search_ok = await test_firebase_search()
    
    # Test full agent
    print("\n" + "=" * 40)
    agent_ok = await test_full_agent()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Test Results:")
    print(f"Firebase Search: {'✅ OK' if search_ok else '❌ Failed'}")
    print(f"Agent Response: {'✅ OK' if agent_ok else '❌ Failed'}")
    
    if search_ok and agent_ok:
        print("\n🎉 All tests passed! Vector store is working correctly.")
    else:
        print("\n🔧 Some tests failed. Check the output above for troubleshooting.")

if __name__ == "__main__":
    asyncio.run(main())