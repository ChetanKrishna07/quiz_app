#!/usr/bin/env python3
"""
Simple test script for Document CRUD operations
Run this after starting your FastAPI server
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_document_crud():
    print("🧪 Testing Document CRUD Operations\n")
    
    # Test 1: Create a document
    print("1. Creating a document...")
    create_data = {
        "user_id": "user123",
        "title": "Mathematics and Physics Study Guide",
        "document_content": "This is a test document about mathematics and physics.",
        "topic_scores": [
            {"mathematics": 8.0},
            {"physics": 7.5}
        ],
        "questions": [
            "What is the derivative of x²?",
            "Explain Newton's laws of motion."
        ]
    }
    
    response = requests.post(f"{BASE_URL}/documents", json=create_data)
    if response.status_code == 200:
        document = response.json()["data"]
        document_id = document["id"]
        print(f"✅ Document created with ID: {document_id}")
        print(f"   Content: {document['document_content'][:50]}...")
    else:
        print(f"❌ Failed to create document: {response.text}")
        return
    
    # Test 2: Get the document
    print("\n2. Getting the document...")
    response = requests.get(f"{BASE_URL}/documents/{document_id}")
    if response.status_code == 200:
        document = response.json()["data"]
        print(f"✅ Document retrieved successfully")
        print(f"   Topic scores: {document['topic_scores']}")
    else:
        print(f"❌ Failed to get document: {response.text}")
    
    # Test 3: Update topic scores
    print("\n3. Updating topic scores...")
    update_data = {
        "topic_scores": [
            {"mathematics": 8.5},
            {"physics": 7.2},
            {"algebra": 9.0}
        ]
    }
    
    response = requests.put(f"{BASE_URL}/documents/{document_id}/scores", json=update_data)
    if response.status_code == 200:
        document = response.json()["data"]
        print(f"✅ Topic scores updated successfully")
        print(f"   Updated scores: {document['topic_scores']}")
    else:
        print(f"❌ Failed to update scores: {response.text}")
    
    # Test 4: Add more scores (should merge with existing)
    print("\n4. Adding more topic scores...")
    more_scores = {
        "topic_scores": [
            {"calculus": 8.8},
            {"mathematics": 9.2}  # This should update the existing math score
        ]
    }
    
    response = requests.put(f"{BASE_URL}/documents/{document_id}/scores", json=more_scores)
    if response.status_code == 200:
        document = response.json()["data"]
        print(f"✅ More scores added successfully")
        print(f"   All scores: {document['topic_scores']}")
    else:
        print(f"❌ Failed to add more scores: {response.text}")
    
    # Test 5: Update questions (should keep only last 10)
    print("\n5. Updating questions...")
    new_questions = {
        "questions": [
            "What is the integral of 2x?",
            "Define velocity and acceleration.",
            "What is the Pythagorean theorem?",
            "Explain the concept of force.",
            "What is the quadratic formula?",
            "Describe the law of conservation of energy.",
            "What is the slope-intercept form?",
            "Explain the difference between speed and velocity.",
            "What is the area of a circle?",
            "Define momentum in physics.",
            "What is the derivative of sin(x)?",  # This should be kept (11th question)
            "What is the formula for kinetic energy?"  # This should be kept (12th question)
        ]
    }
    
    response = requests.put(f"{BASE_URL}/documents/{document_id}/questions", json=new_questions)
    if response.status_code == 200:
        document = response.json()["data"]
        print(f"✅ Questions updated successfully")
        print(f"   Total questions: {len(document['questions'])}")
        print(f"   Last 3 questions: {document['questions'][-3:]}")
    else:
        print(f"❌ Failed to update questions: {response.text}")
    
    # Test 6: Get all documents for user
    print("\n6. Getting all documents for user...")
    response = requests.get(f"{BASE_URL}/documents?user_id=user123")
    if response.status_code == 200:
        documents = response.json()["data"]
        print(f"✅ Found {len(documents)} documents for user123")
    else:
        print(f"❌ Failed to get user documents: {response.text}")
    
    # Test 7: Get all documents
    print("\n7. Getting all documents...")
    response = requests.get(f"{BASE_URL}/documents")
    if response.status_code == 200:
        documents = response.json()["data"]
        print(f"✅ Found {len(documents)} total documents")
    else:
        print(f"❌ Failed to get all documents: {response.text}")
    
    # Test 8: Delete the document
    print(f"\n8. Deleting document {document_id}...")
    response = requests.delete(f"{BASE_URL}/documents/{document_id}")
    if response.status_code == 200:
        print(f"✅ Document deleted successfully")
    else:
        print(f"❌ Failed to delete document: {response.text}")
    
    # Test 9: Verify deletion
    print(f"\n9. Verifying deletion...")
    response = requests.get(f"{BASE_URL}/documents/{document_id}")
    if response.status_code == 404:
        print(f"✅ Document successfully deleted (404 Not Found)")
    else:
        print(f"❌ Document still exists: {response.text}")
    
    print("\n🎉 All tests completed!")

if __name__ == "__main__":
    test_document_crud() 