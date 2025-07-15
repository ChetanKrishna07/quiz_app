from typing import List, Dict, Optional
from pydantic import BaseModel, validator
from bson import ObjectId
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Import database connection
from db import users_collection

class TopicScore(BaseModel):
    topic: str
    score: float
    
    @validator('score')
    def validate_score(cls, v):
        if v < 0 or v > 10:
            raise ValueError('Score must be between 0 and 10')
        return v

class User(BaseModel):
    user_id: str
    topic_scores: List[Dict[str, float]] = []
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if not v or not v.strip():
            raise ValueError('User ID cannot be empty')
        return v.strip()

class UserDB:
    @staticmethod
    def create_user(user_id: str, topic_scores: Optional[List[Dict[str, float]]] = None) -> Dict:
        """Create a new user document"""
        try:
            if topic_scores is None:
                topic_scores = []
            existing_user = users_collection.find_one({"user_id": user_id})
            if existing_user:
                raise ValueError(f"User {user_id} already exists")
            user_doc = {
                "user_id": user_id,
                "topic_scores": topic_scores
            }
            result = users_collection.insert_one(user_doc)
            user_doc['_id'] = str(result.inserted_id)
            logger.info(f"Created user document for user {user_id}")
            return user_doc
        except Exception as e:
            logger.error(f"Error creating user for {user_id}: {e}")
            raise

    @staticmethod
    def get_user(user_id: str) -> Optional[Dict]:
        """Get a user by user_id"""
        try:
            user = users_collection.find_one({"user_id": user_id})
            if user:
                user['_id'] = str(user['_id'])
                return user
            return None
        except Exception as e:
            logger.error(f"Error getting user {user_id}: {e}")
            raise

    @staticmethod
    def get_all_users() -> List[Dict]:
        """Get all users from the database"""
        try:
            users = list(users_collection.find())
            for user in users:
                user['_id'] = str(user['_id'])
            return users
        except Exception as e:
            logger.error(f"Error getting all users: {e}")
            raise

    @staticmethod
    def delete_user(user_id: str) -> bool:
        """Delete a user by user_id"""
        try:
            result = users_collection.delete_one({"user_id": user_id})
            if result.deleted_count > 0:
                logger.info(f"Deleted user {user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting user {user_id}: {e}")
            raise

    @staticmethod
    def update_user_scores(user_id: str, topic_scores: List[Dict[str, float]]) -> Optional[Dict]:
        """Update topic scores for a user (replaces all topic scores)"""
        try:
            result = users_collection.update_one(
                {"user_id": user_id},
                {"$set": {"topic_scores": topic_scores}}
            )
            if result.matched_count == 0:
                return None
            updated_user = users_collection.find_one({"user_id": user_id})
            if updated_user:
                updated_user['_id'] = str(updated_user['_id'])
                logger.info(f"Updated topic scores for user {user_id}")
                return updated_user
            return None
        except Exception as e:
            logger.error(f"Error updating user scores for {user_id}: {e}")
            raise