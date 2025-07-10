from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from docx import Document
import pymongo
import io
from models.UserScores import UserScoreDB, UserScore, TopicScore
from pydantic import BaseModel
from typing import Dict



app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.post("/parse_file")
async def parse_file(file: UploadFile = File(...)):
    try:
        print(file)
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
            doc = Document(docx_file)
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

# Request models for API
class UpdateTopicScoreRequest(BaseModel):
    topic: str
    score: float

class CreateUserRequest(BaseModel):
    user_id: str

# UserScore API Endpoints
@app.post("/users")
async def create_user(request: CreateUserRequest):
    """Create a new user with empty topic scores"""
    try:
        new_user = UserScoreDB.create_user_score(request.user_id)
        return {"success": True, "data": new_user, "message": f"User {request.user_id} created successfully"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/users/{user_id}/scores")
async def get_user_scores(user_id: str):
    """Get all topic scores for a user"""
    try:
        user_scores = UserScoreDB.get_user_scores(user_id)
        if user_scores is None:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"success": True, "data": user_scores}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.put("/users/{user_id}/scores")
async def update_topic_score(user_id: str, request: UpdateTopicScoreRequest):
    """Update or add a topic score for a user"""
    try:
        updated_scores = UserScoreDB.update_topic_score(user_id, request.topic, request.score)
        return {"success": True, "data": updated_scores}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/users/{user_id}/scores/{topic}")
async def get_topic_score(user_id: str, topic: str):
    """Get a specific topic score for a user"""
    try:
        score = UserScoreDB.get_topic_score(user_id, topic)
        if score is None:
            raise HTTPException(status_code=404, detail=f"Topic '{topic}' not found for user {user_id}")
        return {"success": True, "data": {"user_id": user_id, "topic": topic, "score": score}}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/users/scores")
async def get_all_users_scores():
    """Get all users' scores"""
    try:
        all_scores = UserScoreDB.get_all_users_scores()
        return {"success": True, "data": all_scores}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.delete("/users/{user_id}/scores")
async def delete_user_scores(user_id: str):
    """Delete all scores for a user"""
    try:
        deleted = UserScoreDB.delete_user_scores(user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        return {"success": True, "message": f"All scores for user {user_id} have been deleted"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")



