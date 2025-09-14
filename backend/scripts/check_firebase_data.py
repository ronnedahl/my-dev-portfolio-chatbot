#!/usr/bin/env python3
"""Check Firebase data and collection names."""

import os
import sys
import asyncio
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv
load_dotenv()

async def check_firebase_collections():
    """Check all collections in Firebase."""
    print("🔍 Checking Firebase Collections...")
    
    try:
        import firebase_admin
        from firebase_admin import credentials, firestore
        from src.config import settings
        
        # Initialize Firebase
        if not firebase_admin._apps:
            cred = credentials.Certificate(settings.get_firebase_credentials())
            firebase_admin.initialize_app(cred)
        
        db = firestore.client()
        
        # Get all collections
        print("\n📋 Available collections:")
        collections = db.collections()
        collection_names = []
        
        for collection in collections:
            collection_names.append(collection.id)
            print(f"- {collection.id}")
            
            # Count documents in each collection
            docs = list(collection.limit(5).stream())
            doc_count = len(list(collection.stream()))
            print(f"  Documents: {doc_count}")
            
            # Show sample document
            if docs:
                sample_doc = docs[0].to_dict()
                print(f"  Sample document fields: {list(sample_doc.keys())}")
                
                # Check if it has expected fields
                if 'content' in sample_doc:
                    print(f"  Content preview: {sample_doc['content'][:100]}...")
                if 'text' in sample_doc:
                    print(f"  Text preview: {sample_doc['text'][:100]}...")
                if 'embedding' in sample_doc:
                    print(f"  Has embedding: Yes (length: {len(sample_doc['embedding'])})")
        
        print(f"\n📌 Current configured collection: {settings.firebase_collection_name}")
        
        # Check specific collection
        if settings.firebase_collection_name not in collection_names:
            print(f"⚠️  WARNING: Configured collection '{settings.firebase_collection_name}' not found!")
            print(f"💡 Available collections: {', '.join(collection_names)}")
        
        # Check the specific collection more thoroughly
        print(f"\n🔎 Checking configured collection: {settings.firebase_collection_name}")
        collection_ref = db.collection(settings.firebase_collection_name)
        docs = list(collection_ref.stream())
        
        print(f"Total documents: {len(docs)}")
        
        if docs:
            print("\nDocument structure analysis:")
            for i, doc in enumerate(docs[:3]):  # Check first 3 docs
                doc_data = doc.to_dict()
                print(f"\nDocument {i+1} (ID: {doc.id}):")
                print(f"  Fields: {list(doc_data.keys())}")
                
                # Check for expected fields
                if 'content' in doc_data:
                    print(f"  Content: {doc_data['content'][:150]}...")
                if 'text' in doc_data:
                    print(f"  Text: {doc_data['text'][:150]}...")
                if 'embedding' in doc_data:
                    print(f"  Embedding: {len(doc_data['embedding'])} dimensions")
                else:
                    print(f"  ⚠️  No embedding field found!")
                
                # Check metadata
                if 'metadata' in doc_data:
                    print(f"  Metadata: {doc_data['metadata']}")
        
        return collection_names
        
    except Exception as e:
        print(f"❌ Error checking Firebase: {e}")
        import traceback
        traceback.print_exc()
        return []

async def test_direct_search():
    """Test search with different field names."""
    print("\n\n🔍 Testing search with different field configurations...")
    
    try:
        from src.services import FirebaseVectorStore, EmbeddingService
        from src.config import settings
        import firebase_admin
        from firebase_admin import firestore
        
        # Get database reference
        db = firestore.client()
        embedding_service = EmbeddingService()
        
        # Generate embedding for search query
        query = "peter age 51 years old"
        print(f"Generating embedding for query: '{query}'")
        query_embedding = await embedding_service.embed_text(query)
        print(f"✅ Query embedding generated (length: {len(query_embedding)})")
        
        # Try to search manually
        print("\n📊 Manual search in collection...")
        collection_ref = db.collection(settings.firebase_collection_name)
        docs = list(collection_ref.stream())
        
        results = []
        for doc in docs:
            doc_data = doc.to_dict()
            
            # Check which field contains the embedding
            embedding_field = None
            if 'embedding' in doc_data:
                embedding_field = 'embedding'
            elif 'embeddings' in doc_data:
                embedding_field = 'embeddings'
            elif 'vector' in doc_data:
                embedding_field = 'vector'
            
            if embedding_field and doc_data[embedding_field]:
                # Calculate similarity
                doc_embedding = doc_data[embedding_field]
                similarity = embedding_service.calculate_similarity(query_embedding, doc_embedding)
                
                # Get text content
                text_content = doc_data.get('text') or doc_data.get('content') or doc_data.get('chunk') or 'No text found'
                
                results.append({
                    'id': doc.id,
                    'text': text_content,
                    'similarity': similarity,
                    'fields': list(doc_data.keys())
                })
        
        # Sort by similarity
        results.sort(key=lambda x: x['similarity'], reverse=True)
        
        print(f"\nFound {len(results)} documents with embeddings")
        print("\nTop 5 results:")
        for i, result in enumerate(results[:5]):
            print(f"\n{i+1}. Document ID: {result['id']}")
            print(f"   Similarity: {result['similarity']:.3f}")
            print(f"   Text: {result['text'][:200]}...")
            print(f"   Fields: {result['fields']}")
        
        return len(results) > 0
        
    except Exception as e:
        print(f"❌ Error in direct search: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Run all checks."""
    print("🧪 Firebase Data Structure Check")
    print("=" * 60)
    
    # Check collections
    collections = await check_firebase_collections()
    
    # Test direct search
    await test_direct_search()
    
    print("\n" + "=" * 60)
    print("💡 Recommendations:")
    
    if not collections:
        print("❌ Could not connect to Firebase")
    else:
        print("✅ Firebase connection successful")
        print(f"📌 Make sure FIREBASE_COLLECTION_NAME in .env matches your actual collection")
        print(f"📌 Make sure documents have both 'text' and 'embedding' fields")

if __name__ == "__main__":
    asyncio.run(main())