from typing import List, Optional, Dict
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Import database connection
from db import documents_collection


class PyObjectId(ObjectId):
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)

    @classmethod
    def __modify_schema__(cls, field_schema):
        field_schema.update(type="string")


class CreateDocumentRequest(BaseModel):
    user_id: str
    title: str
    document_content: str
    topic_scores: List[Dict[str, float]] = []
    questions: List[str] = []


class UpdateQuestionsRequest(BaseModel):
    questions: List[str]


class UpdateScoresRequest(BaseModel):
    topic_scores: List[Dict[str, float]]


class Document(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    document_content: str
    topic_scores: List[Dict[str, float]] = []
    questions: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DocumentDB:
    @staticmethod
    def create_document(user_id: str, document_content: str, title: Optional[str] = None):
        """Create a new document"""
        try:
            # Generate a default title if none provided
            if title is None:
                title = f"Document {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"
            
            document_data = {
                "user_id": user_id,
                "title": title,
                "topic_scores": [],
                "document_content": document_content,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            result = documents_collection.insert_one(document_data)
            document_data["_id"] = str(result.inserted_id)
            logger.info(f"Created document for user {user_id}")
            return document_data
        except Exception as e:
            logger.error(f"Error creating document for user {user_id}: {e}")
            raise

    @staticmethod
    def get_document(document_id: str):
        """Get a document by ID"""
        try:
            doc = documents_collection.find_one({"_id": ObjectId(document_id)})
            if doc:
                doc['_id'] = str(doc['_id'])
                return doc
            return None
        except Exception as e:
            logger.error(f"Error getting document {document_id}: {e}")
            return None

    @staticmethod
    def get_documents_by_user(user_id: str):
        """Get all documents for a user"""
        try:
            docs = list(documents_collection.find({"user_id": user_id}))
            for doc in docs:
                doc['_id'] = str(doc['_id'])
            return docs
        except Exception as e:
            logger.error(f"Error getting documents for user {user_id}: {e}")
            raise

    @staticmethod
    def get_all_documents():
        """Get all documents"""
        try:
            docs = list(documents_collection.find())
            for doc in docs:
                doc['_id'] = str(doc['_id'])
            return docs
        except Exception as e:
            logger.error(f"Error getting all documents: {e}")
            raise

    @staticmethod
    def update_document_scores(document_id: str, topic_scores: List[Dict[str, float]]):
        """Update topic scores for a document"""
        try:
            # Get current document
            doc = documents_collection.find_one({"_id": ObjectId(document_id)})
            if not doc:
                return None
            
            # Convert topic scores to the format stored in DB
            scores_dict = {}
            for score_item in topic_scores:
                for topic, score in score_item.items():
                    scores_dict[topic] = score
            
            # Update existing topic scores and add new ones
            current_scores = {}
            for score_item in doc.get("topic_scores", []):
                for topic, score in score_item.items():
                    current_scores[topic] = score
            
            current_scores.update(scores_dict)
            
            # Convert back to list format
            updated_scores = [{topic: score} for topic, score in current_scores.items()]
            
            # Update the document
            result = documents_collection.update_one(
                {"_id": ObjectId(document_id)},
                {
                    "$set": {
                        "topic_scores": updated_scores,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                updated_doc = documents_collection.find_one({"_id": ObjectId(document_id)})
                updated_doc['_id'] = str(updated_doc['_id'])
                logger.info(f"Updated document scores for document {document_id}")
                return updated_doc
            return None
            
        except Exception as e:
            logger.error(f"Error updating document scores for {document_id}: {e}")
            return None

    @staticmethod
    def delete_document(document_id: str):
        """Delete a document"""
        try:
            result = documents_collection.delete_one({"_id": ObjectId(document_id)})
            if result.deleted_count > 0:
                logger.info(f"Deleted document {document_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            return False 