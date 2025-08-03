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
    topics: List[str] = []
    questions: List[str] = []


class UpdateQuestionsRequest(BaseModel):
    questions: List[str]


class UpdateTopicsRequest(BaseModel):
    topics: List[str]


class Document(BaseModel):
    id: Optional[str] = None
    user_id: str
    title: str
    document_content: str
    topics: List[str] = []
    questions: List[str] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class DocumentDB:
    @staticmethod
    def create_document(user_id: str, document_content: str, title: Optional[str] = None, topics: Optional[List[str]] = None):
        """Create a new document"""
        try:
            # Generate a default title if none provided
            if title is None:
                title = f"Document {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')}"
            
            if topics is None:
                topics = []
            
            document_data = {
                "user_id": user_id,
                "title": title,
                "topics": topics,
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
    def update_document_topics(document_id: str, topics: List[str]):
        """Update topics for a document"""
        try:
            result = documents_collection.update_one(
                {"_id": ObjectId(document_id)},
                {
                    "$set": {
                        "topics": topics,
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            
            if result.modified_count > 0:
                updated_doc = documents_collection.find_one({"_id": ObjectId(document_id)})
                updated_doc['_id'] = str(updated_doc['_id'])
                logger.info(f"Updated document topics for document {document_id}")
                return updated_doc
            return None
            
        except Exception as e:
            logger.error(f"Error updating document topics for {document_id}: {e}")
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

    @staticmethod
    def get_document_with_user_scores(document_id: str):
        """Get a document by ID with user scores merged for topics"""
        try:
            # Import UserDB inside method to avoid circular imports
            from models.User import UserDB
            
            doc = documents_collection.find_one({"_id": ObjectId(document_id)})
            if not doc:
                return None
            
            doc['_id'] = str(doc['_id'])
            
            # Get user scores for this document's user
            user = UserDB.get_user(doc['user_id'])
            user_scores = {}
            if user and user.get('topic_scores'):
                for score_item in user['topic_scores']:
                    for topic, score in score_item.items():
                        user_scores[topic] = score
            
            # Add scores to document topics
            doc['topics_with_scores'] = []
            for topic in doc.get('topics', []):
                doc['topics_with_scores'].append({
                    'topic': topic,
                    'user_score': user_scores.get(topic, 0.0)
                })
            
            return doc
        except Exception as e:
            logger.error(f"Error getting document with user scores {document_id}: {e}")
            return None

    @staticmethod
    def get_documents_by_user_with_scores(user_id: str):
        """Get all documents for a user with user scores merged for topics"""
        try:
            # Import UserDB inside method to avoid circular imports
            from models.User import UserDB
            
            docs = list(documents_collection.find({"user_id": user_id}))
            
            # Get user scores once
            user = UserDB.get_user(user_id)
            user_scores = {}
            if user and user.get('topic_scores'):
                for score_item in user['topic_scores']:
                    for topic, score in score_item.items():
                        user_scores[topic] = score
            
            # Process each document
            for doc in docs:
                doc['_id'] = str(doc['_id'])
                
                # Add scores to document topics
                doc['topics_with_scores'] = []
                for topic in doc.get('topics', []):
                    doc['topics_with_scores'].append({
                        'topic': topic,
                        'user_score': user_scores.get(topic, 0.0)
                    })
            
            return docs
        except Exception as e:
            logger.error(f"Error getting documents with user scores for user {user_id}: {e}")
            raise

    @staticmethod
    def get_all_documents_with_scores():
        """Get all documents with user scores merged for topics"""
        try:
            # Import UserDB inside method to avoid circular imports
            from models.User import UserDB
            
            docs = list(documents_collection.find())
            
            # Cache user scores to avoid repeated DB calls
            user_scores_cache = {}
            
            for doc in docs:
                doc['_id'] = str(doc['_id'])
                user_id = doc['user_id']
                
                # Get user scores from cache or DB
                if user_id not in user_scores_cache:
                    user = UserDB.get_user(user_id)
                    user_scores = {}
                    if user and user.get('topic_scores'):
                        for score_item in user['topic_scores']:
                            for topic, score in score_item.items():
                                user_scores[topic] = score
                    user_scores_cache[user_id] = user_scores
                
                user_scores = user_scores_cache[user_id]
                
                # Add scores to document topics
                doc['topics_with_scores'] = []
                for topic in doc.get('topics', []):
                    doc['topics_with_scores'].append({
                        'topic': topic,
                        'user_score': user_scores.get(topic, 0.0)
                    })
            
            return docs
        except Exception as e:
            logger.error(f"Error getting all documents with user scores: {e}")
            raise 