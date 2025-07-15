import pymongo
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
try:
    # Use environment variable for MongoDB URI, fallback to localhost for development
    mongodb_uri = os.getenv('MONGO_URI', 'localhost:27017')
    if mongodb_uri.startswith('mongodb://'):
        client = pymongo.MongoClient(mongodb_uri)
    else:
        # Handle the case where MONGODB_URI is just the host:port
        client = pymongo.MongoClient(mongodb_uri)
    
    db = client.quiz_app
    
    # Collections
    users_collection = db.users
    documents_collection = db.documents
    
    logger.info("Connected to MongoDB successfully")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
    raise 