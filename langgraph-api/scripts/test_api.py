#!/usr/bin/env python3
"""Test script for API endpoints."""

import asyncio
import httpx
import json
from typing import Dict, Any

BASE_URL = "http://localhost:8000"

async def test_health():
    """Test health endpoint."""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print(f"Health check: {response.status_code}")
        print(json.dumps(response.json(), indent=2))
        return response.status_code == 200

async def test_chat(query: str):
    """Test chat endpoint."""
    async with httpx.AsyncClient() as client:
        payload = {
            "query": query,
            "conversation_id": "test_conv",
            "user_id": "test_user"
        }
        response = await client.post(f"{BASE_URL}/chat/", json=payload)
        print(f"Chat response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Response: {data['response']}")
            print(f"Retrieved context: {len(data['retrieved_context'])} documents")
        else:
            print(f"Error: {response.text}")
        return response.status_code == 200

async def test_document_create():
    """Test document creation."""
    async with httpx.AsyncClient() as client:
        payload = {
            "text": "Peter har 5 års erfarenhet av Python-programmering och har arbetat med FastAPI i 2 år.",
            "metadata": {
                "category": "experience",
                "tags": ["python", "fastapi", "programming"]
            }
        }
        response = await client.post(f"{BASE_URL}/documents/", json=payload)
        print(f"Document create: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Created document: {data['document_id']}")
            return data['document_id']
        else:
            print(f"Error: {response.text}")
        return None

async def test_search(query: str):
    """Test search endpoint."""
    async with httpx.AsyncClient() as client:
        payload = {
            "query": query,
            "top_k": 3,
            "threshold": 0.7
        }
        response = await client.post(f"{BASE_URL}/search/", json=payload)
        print(f"Search response: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {data['total_results']} results")
            for result in data['results']:
                print(f"- {result['text'][:100]}... (similarity: {result['similarity']:.3f})")
        else:
            print(f"Error: {response.text}")
        return response.status_code == 200

async def main():
    """Run all tests."""
    print("🧪 Testing Peterbot LangGraph API")
    print("=" * 50)
    
    # Test health
    print("\n1. Testing health endpoint...")
    await test_health()
    
    # Test document creation
    print("\n2. Testing document creation...")
    doc_id = await test_document_create()
    
    # Test search
    print("\n3. Testing search...")
    await test_search("Python programming experience")
    
    # Test chat
    print("\n4. Testing chat...")
    await test_chat("Tell me about Peter's Python experience")
    
    print("\n✅ Testing complete!")

if __name__ == "__main__":
    asyncio.run(main())