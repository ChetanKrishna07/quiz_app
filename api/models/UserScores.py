from typing import List, Dict, Optional
from pydantic import BaseModel, validator
from bson import ObjectId
import logging

# Configure logging
logger = logging.getLogger(__name__)

# Import database connection
from db import user_scores_collection

class TopicScore(BaseModel):
    topic: str
    score: float
    
    @validator('score')
    def validate_score(cls, v):
        if v < 0 or v > 10:
            raise ValueError('Score must be between 0 and 10')
        return v

class UserScore(BaseModel):
    user_id: str
    topic_scores: List[Dict[str, float]] = []
    
    @validator('user_id')
    def validate_user_id(cls, v):
        if not v or not v.strip():
            raise ValueError('User ID cannot be empty')
        return v.strip()

class UserScoreDB:
    @staticmethod
    def get_user_scores(user_id: str) -> Optional[Dict]:
        """Get all topic scores for a user"""
        try:
            user_score = user_scores_collection.find_one({"user_id": user_id})
            if user_score:
                user_score['_id'] = str(user_score['_id'])  # Convert ObjectId to string
                return user_score
            return None
        except Exception as e:
            logger.error(f"Error getting user scores for {user_id}: {e}")
            raise

    @staticmethod
    def create_user_score(user_id: str, topic_scores: List[Dict[str, float]] = None) -> Dict:
        """Create a new user score document"""
        try:
            if topic_scores is None:
                topic_scores = []
            
            # Check if user already exists
            existing_user = user_scores_collection.find_one({"user_id": user_id})
            if existing_user:
                raise ValueError(f"User {user_id} already exists")
            
            user_score_doc = {
                "user_id": user_id,
                "topic_scores": topic_scores
            }
            
            result = user_scores_collection.insert_one(user_score_doc)
            user_score_doc['_id'] = str(result.inserted_id)
            
            logger.info(f"Created user score document for user {user_id}")
            return user_score_doc
        except Exception as e:
            logger.error(f"Error creating user score for {user_id}: {e}")
            raise

    @staticmethod
    def update_topic_score(user_id: str, topic: str, score: float) -> Dict:
        """Update or add a topic score for a user"""
        try:
            # Validate score
            if score < 0 or score > 10:
                raise ValueError('Score must be between 0 and 10')
            
            # Get existing user document
            user_doc = user_scores_collection.find_one({"user_id": user_id})
            
            if not user_doc:
                # Create new user document if doesn't exist
                user_doc = UserScoreDB.create_user_score(user_id, [{topic: score}])
                return user_doc
            
            # Check if topic already exists in topic_scores
            topic_scores = user_doc.get('topic_scores', [])
            topic_found = False
            
            for i, topic_score_dict in enumerate(topic_scores):
                if topic in topic_score_dict:
                    # Update existing topic score
                    topic_scores[i][topic] = score
                    topic_found = True
                    break
            
            if not topic_found:
                # Add new topic score
                topic_scores.append({topic: score})
            
            # Update the document
            result = user_scores_collection.update_one(
                {"user_id": user_id},
                {"$set": {"topic_scores": topic_scores}}
            )
            
            # Check if update was successful (either modified or matched)
            if result.matched_count == 0:
                raise Exception(f"User {user_id} not found for update")
            
            # Return updated document
            updated_doc = user_scores_collection.find_one({"user_id": user_id})
            if updated_doc:
                updated_doc['_id'] = str(updated_doc['_id'])
                logger.info(f"Updated topic score for user {user_id}, topic {topic}, score {score}")
                return updated_doc
            else:
                raise Exception("Failed to retrieve updated document")
            
        except Exception as e:
            logger.error(f"Error updating topic score for {user_id}: {e}")
            raise

    @staticmethod
    def get_all_users_scores() -> List[Dict]:
        """Get all user scores from the database"""
        try:
            users_scores = list(user_scores_collection.find())
            for user_score in users_scores:
                user_score['_id'] = str(user_score['_id'])
            return users_scores
        except Exception as e:
            logger.error(f"Error getting all users scores: {e}")
            raise

    @staticmethod
    def delete_user_scores(user_id: str) -> bool:
        """Delete all scores for a user"""
        try:
            result = user_scores_collection.delete_one({"user_id": user_id})
            if result.deleted_count > 0:
                logger.info(f"Deleted user scores for user {user_id}")
                return True
            return False
        except Exception as e:
            logger.error(f"Error deleting user scores for {user_id}: {e}")
            raise

    @staticmethod
    def get_topic_score(user_id: str, topic: str) -> Optional[float]:
        """Get a specific topic score for a user"""
        try:
            user_doc = user_scores_collection.find_one({"user_id": user_id})
            if not user_doc:
                return None
            
            topic_scores = user_doc.get('topic_scores', [])
            for topic_score_dict in topic_scores:
                if topic in topic_score_dict:
                    return topic_score_dict[topic]
            
            return None
        except Exception as e:
            logger.error(f"Error getting topic score for {user_id}, topic {topic}: {e}")
            raise