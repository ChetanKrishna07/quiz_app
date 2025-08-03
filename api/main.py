from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from docx import Document as DocxDocument
import pymongo
import io
from models.User import UserDB, User
from models.Document import Document, CreateDocumentRequest, UpdateTopicsRequest, UpdateQuestionsRequest, DocumentDB
from pydantic import BaseModel
from typing import Dict, List, Optional
import uuid
from datetime import datetime
from bson import ObjectId
from db import documents_collection
from dotenv import load_dotenv
import os
import openai
import json
import logging

# Configure logging
logger = logging.getLogger(__name__)

load_dotenv()

# Helper function to ensure user has all topics with scores
async def ensure_user_has_topics(user_id: str, topics: List[str]):
    """Ensure user has all topics in their topic_scores, adding missing ones with score 0"""
    if not topics:
        return
    
    user = UserDB.get_user(user_id)
    if user:
        # Get current user scores as a dictionary
        current_scores = {}
        for score_item in user.get("topic_scores", []):
            for topic, score in score_item.items():
                current_scores[topic] = score
        
        # Check for missing topics and add them with score 0
        topics_added = []
        for topic in topics:
            if topic not in current_scores:
                current_scores[topic] = 0.0
                topics_added.append(topic)
        
        # Update user scores if any topics were added
        if topics_added:
            updated_scores = [{topic: score} for topic, score in current_scores.items()]
            UserDB.update_user_scores(user_id, updated_scores)
            logger.info(f"Added topics {topics_added} with score 0 for user {user_id}")
    else:
        # If user doesn't exist, create user with topics having score 0
        initial_scores = [{topic: 0.0} for topic in topics]
        UserDB.create_user(user_id, initial_scores)
        logger.info(f"Created user {user_id} with initial topics {topics}")

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Initialize OpenAI client
try:
    openai_client = openai.OpenAI(
        api_key=os.getenv("OPENAI_API_KEY")
    )
except Exception as e:
    print(f"Warning: Failed to initialize OpenAI client: {e}")
    openai_client = None

# AI Models
class ExtractTopicsRequest(BaseModel):
    text_content: str
    current_topics: Optional[List[str]] = []

class GenerateQuizRequest(BaseModel):
    text_content: str
    topic: str
    previous_questions: Optional[List[str]] = []

class GenerateDocumentNameRequest(BaseModel):
    text_content: str


@app.get("/")
def read_root():
    return {"message": "Hey! Looks like you just found access to the API! What did I do wrong? :) chetankrishna.edu@gmail.com"}

@app.get("/version")
def get_version():
    return {"version": "1"}

@app.post("/parse_file")
async def parse_file(file: UploadFile = File(...)):
    try:
        file_content = await file.read()
        filename = file.filename.lower() if file.filename else ""
        
        if filename.endswith('.pdf'):
            # Parse PDF file
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text_content = ""
            for idx, page in enumerate(pdf_reader.pages):
                text_content += f"Page {idx + 1}\n"
                text_content += page.extract_text() + "\n"
            return {"success": True, "data": {"text_content": text_content.strip()}}
            
        elif filename.endswith('.docx'):
            # Parse DOCX file
            docx_file = io.BytesIO(file_content)
            doc = DocxDocument(docx_file)
            text_content = ""
            for paragraph in doc.paragraphs:
                text_content += paragraph.text + "\n"
            return {"success": True, "data": {"text_content": text_content.strip()}}
            
        elif filename.endswith(('.txt', '.md')):
            # Parse plain text files
            text_content = file_content.decode('utf-8')
            return {"success": True, "data": {"text_content": text_content}}
            
        else:
            return {"success": False, "error": f"Unsupported file type. Supported formats: PDF, DOCX, TXT, MD"}
            
    except Exception as e:
        return {"success": False, "error": str(e)}

# New User API Endpoints
class CreateUserRequest(BaseModel):
    user_id: str
    topic_scores: Optional[List[Dict[str, float]]] = []

class UpdateUserScoresRequest(BaseModel):
    topic_scores: List[Dict[str, float]]

@app.post("/users")
async def create_user(request: CreateUserRequest):
    """Create a new user"""
    try:
        new_user = UserDB.create_user(request.user_id, request.topic_scores)
        return {"success": True, "data": new_user, "message": f"User {request.user_id} created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/users")
async def get_all_users():
    """Get all users"""
    try:
        users = UserDB.get_all_users()
        return {"success": True, "data": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/users/{user_id}")
async def get_user(user_id: str):
    """Get a single user by user_id"""
    try:
        user = UserDB.get_user(user_id)
        if user is None:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"success": True, "data": user}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/users/{user_id}")
async def delete_user(user_id: str):
    """Delete a user by user_id"""
    try:
        deleted = UserDB.delete_user(user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"success": True, "message": f"User {user_id} has been deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/users/{user_id}/scores")
async def update_user_scores(user_id: str, request: UpdateUserScoresRequest):
    """Update topic scores for a user (replaces all topic scores)"""
    try:
        updated_user = UserDB.update_user_scores(user_id, request.topic_scores)
        if updated_user is None:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"success": True, "data": updated_user, "message": f"User {user_id} scores updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Document API Endpoints

# Document API Endpoints
@app.post("/documents")
async def create_document(request: CreateDocumentRequest):
    """Create a new document and auto-add missing topics to user scores"""
    try:
        now = datetime.utcnow()
        
        # First, check and update user's topic scores for any new topics
        await ensure_user_has_topics(request.user_id, request.topics)
        
        # Create the document
        document_data = DocumentDB.create_document(
            user_id=request.user_id,
            document_content=request.document_content,
            title=request.title,
            topics=request.topics
        )
        
        # Add questions if provided
        if request.questions:
            documents_collection.update_one(
                {"_id": ObjectId(document_data["_id"])},
                {"$set": {"questions": request.questions, "updated_at": now}}
            )
            document_data["questions"] = request.questions
        
        return {"success": True, "data": document_data, "message": "Document created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/documents/{document_id}")
async def get_document(document_id: str):
    """Get a specific document by ID with topics and user scores"""
    try:
        doc = DocumentDB.get_document_with_user_scores(document_id)
        if doc:
            return {"success": True, "data": doc}
        else:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/documents")
async def get_documents(user_id: Optional[str] = None):
    """Get all documents with topics and user scores, optionally filtered by user_id"""
    try:
        if user_id:
            docs = DocumentDB.get_documents_by_user_with_scores(user_id)
        else:
            docs = DocumentDB.get_all_documents_with_scores()
        
        return {"success": True, "data": docs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/documents/{document_id}/topics")
async def update_document_topics(document_id: str, request: UpdateTopicsRequest):
    """Update topics for a document and auto-add missing topics to user scores"""
    try:
        # Get the document to find the user_id
        doc = DocumentDB.get_document(document_id)
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        user_id = doc['user_id']
        
        # Check and update user's topic scores for any new topics
        await ensure_user_has_topics(user_id, request.topics)
        
        # Update the document topics
        updated_doc = DocumentDB.update_document_topics(document_id, request.topics)
        if updated_doc:
            return {"success": True, "data": updated_doc, "message": "Document topics updated successfully"}
        else:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/documents/{document_id}/questions")
async def update_document_questions(document_id: str, request: UpdateQuestionsRequest):
    """Update questions for a document - keeps only the last 10 questions"""
    try:
        # Get current document
        doc = documents_collection.find_one({"_id": ObjectId(document_id)})
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
        
        # Get existing questions and add new ones
        existing_questions = doc.get("questions", [])
        all_questions = existing_questions + request.questions
        
        # Keep only the last 10 questions
        updated_questions = all_questions[-10:] if len(all_questions) > 10 else all_questions
        
        # Update the document
        result = documents_collection.update_one(
            {"_id": ObjectId(document_id)},
            {
                "$set": {
                    "questions": updated_questions,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            updated_doc = documents_collection.find_one({"_id": ObjectId(document_id)})
            if updated_doc:
                updated_doc["_id"] = str(updated_doc["_id"])
                return {"success": True, "data": updated_doc, "message": "Document questions updated successfully"}
            else:
                raise HTTPException(status_code=500, detail="Failed to retrieve updated document")
        else:
            raise HTTPException(status_code=500, detail="Failed to update document questions")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str):
    """Delete a document"""
    try:
        result = documents_collection.delete_one({"_id": ObjectId(document_id)})
        if result.deleted_count > 0:
            return {"success": True, "message": f"Document {document_id} has been deleted"}
        else:
            raise HTTPException(status_code=404, detail=f"Document {document_id} not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# AI Endpoints

@app.post("/ai/extract-topics")
async def extract_topics(request: ExtractTopicsRequest):
    """Extract topics from text content"""
    try:
        if openai_client is None:
            raise HTTPException(status_code=500, detail="OpenAI client not initialized")
            
        prompt = f"""
        You are a topic extraction assistant. Please analyze the following text and extract 1-4 key topics that would be suitable for creating quiz questions.
        Only extract topics that are relevant to the text content.

        Output format:
        {{
            "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4"]
        }}

        If the following topics are relevant, include them in the output exactly as they are without any modification along with any new topics you find. 
        Only include topics that are relevant to the text content, do not include topics that are not relevant to the text content.

        The current topics are:

        {', '.join(request.current_topics) if request.current_topics else 'None'}

        Text content:
        {request.text_content}
        """

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        content = response.choices[0].message.content
        # Parse the response
        try:

            # Clean up the response
            if content is None:
                raise HTTPException(status_code=500, detail="Empty response from OpenAI")
            content = content.strip()
            content = content.replace("```json\n", "").replace("\n```", "").replace("```", "")
            parsed = json.loads(content)
            topics = parsed.get("topics", [])
            return {"success": True, "data": {"topics": topics}}
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/ai/generate-quiz")
async def generate_quiz(request: GenerateQuizRequest):
    """Generate a single quiz question"""
    try:
        if openai_client is None:
            raise HTTPException(status_code=500, detail="OpenAI client not initialized")
            
        # Create a more explicit prompt to avoid repetition
        previous_questions_text = ""
        if request.previous_questions:
            previous_questions_text = "PREVIOUS QUESTIONS TO AVOID:\n"
            for i, q in enumerate(request.previous_questions, 1):
                previous_questions_text += f"{i}. {q}\n"
        
        prompt = f"""
        You are a quiz generator. Generate a SINGLE, UNIQUE question based on the topic: {request.topic}.
        
        CRITICAL REQUIREMENTS:
        1. Generate EXACTLY ONE question
        2. The question MUST be completely different from any previous questions, not even similar to them.
        3. Focus on different aspects of the topic that haven't been covered
        4. Only generate multiple-choice questions with 4 options
        5. Base the question ONLY on the provided text content
        
        
        PREVIOUS QUESTIONS TO AVOID:

        {previous_questions_text}
        
        TOPIC INFO:

        TOPIC: {request.topic}
        TEXT CONTENT: {request.text_content[:2000]}...

        OUTPUT FORMAT (JSON only):
        {{
            "question": "What is the capital of France?",
            "options": ["Paris", "London", "Berlin", "Madrid"],
            "answer": 0  # Index of the correct answer in the options array
        }}

        IMPORTANT: Ensure your question is completely different from the previous questions listed above.
        """

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,  # Increased temperature for more variety
        )

        content = response.choices[0].message.content
        # Parse the response
        try:

            # Clean up the response
            if content is None:
                raise HTTPException(status_code=500, detail="Empty response from OpenAI")
            content = content.strip()
            content = content.replace("```json\n", "").replace("\n```", "").replace("```", "")
            parsed = json.loads(content)
            # Add the topic to the response
            parsed["topic"] = request.topic
            return {"success": True, "data": parsed}
        except json.JSONDecodeError:
            raise HTTPException(status_code=500, detail="Failed to parse AI response")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/ai/generate-document-name")
async def generate_document_name(request: GenerateDocumentNameRequest):
    """Generate a document name based on content"""
    try:
        if openai_client is None:
            raise HTTPException(status_code=500, detail="OpenAI client not initialized")
            
        prompt = f"""
        You are a document naming assistant. Please analyze the following text and generate a concise title (maximum 60 characters) that captures the main topic or theme of the document.
        Generate a clear, professional title that would help users identify this document. Return only the title, no quotes or additional text.

        Text content:
        {request.text_content[:1000]}...
        """

        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )

        title = response.choices[0].message.content
        if title is None:
            raise HTTPException(status_code=500, detail="Empty response from OpenAI")
        title = title.strip()
        # Remove quotes if present
        title = title.replace('"', '').replace("'", "")
        
        return {"success": True, "data": {"title": title}}
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



