# Quiz App API Documentation

## Overview
This is a FastAPI-based quiz application that provides file parsing capabilities and user score management with MongoDB integration.

## Base URL
```
http://localhost:8000
```

## Authentication
Currently, no authentication is required for the API endpoints.

---

## File Processing Endpoints

### 1. Parse File
Parse uploaded files (PDF, DOCX, TXT, MD) and extract text content.

**Endpoint:** `POST /parse_file`

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: File upload

**Supported File Types:**
- PDF (.pdf)
- Microsoft Word (.docx)
- Plain Text (.txt)
- Markdown (.md)

**Response:**
```json
{
  "success": true,
  "data": {
    "text_content": "Extracted text content from the file..."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Unsupported file type. Supported formats: PDF, DOCX, TXT, MD"
}
```

**Example using curl:**
```bash
curl -X POST "http://localhost:8000/parse_file" \
     -F "file=@document.pdf"
```

---

## User Score Management Endpoints

### 2. Create New User
Create a new user with empty topic scores.

**Endpoint:** `POST /users`

**Request:**
```json
{
  "user_id": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "topic_scores": []
  },
  "message": "User user123 created successfully"
}
```

**Error Responses:**
- `400 Bad Request`: User already exists
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X POST "http://localhost:8000/users" \
     -H "Content-Type: application/json" \
     -d '{"user_id": "user123"}'
```

### 3. Get All Topic Scores for a User
Retrieve all topic scores for a specific user.

**Endpoint:** `GET /users/{user_id}/scores`

**Parameters:**
- `user_id` (path): String - The unique identifier for the user

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "topic_scores": [
      {"mathematics": 8.5},
      {"science": 9.2},
      {"history": 7.8}
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X GET "http://localhost:8000/users/user123/scores"
```

### 4. Update Topic Score
Update or add a topic score for a specific user.

**Endpoint:** `PUT /users/{user_id}/scores`

**Parameters:**
- `user_id` (path): String - The unique identifier for the user

**Request:**
```json
{
  "topic": "mathematics",
  "score": 8.5
}
```

**Validation Rules:**
- `topic`: Non-empty string
- `score`: Float between 0 and 10

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "topic_scores": [
      {"mathematics": 8.5},
      {"science": 9.2}
    ]
  }
}
```

**Behavior:**
- If the user doesn't exist, a new user will be created with the provided score
- If the topic already exists, it will be updated
- If the topic doesn't exist, it will be added to the user's scores

**Error Responses:**
- `400 Bad Request`: Invalid score (not between 0-10) or empty topic
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X PUT "http://localhost:8000/users/user123/scores" \
     -H "Content-Type: application/json" \
     -d '{"topic": "mathematics", "score": 85.5}'
```

### 5. Get Specific Topic Score
Retrieve a specific topic score for a user.

**Endpoint:** `GET /users/{user_id}/scores/{topic}`

**Parameters:**
- `user_id` (path): String - The unique identifier for the user
- `topic` (path): String - The topic name

**Response:**
```json
{
  "success": true,
  "data": {
    "user_id": "user123",
    "topic": "mathematics",
    "score": 8.5
  }
}
```

**Error Responses:**
- `404 Not Found`: User or topic not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X GET "http://localhost:8000/users/user123/scores/mathematics"
```

### 6. Get All Users' Scores
Retrieve scores for all users in the system.

**Endpoint:** `GET /users/scores`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": "user123",
      "topic_scores": [
        {"mathematics": 8.5},
        {"science": 9.2}
      ]
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "user_id": "user456",
      "topic_scores": [
        {"history": 7.8}
      ]
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X GET "http://localhost:8000/users/scores"
```

### 7. Delete User Scores
Delete all scores for a specific user.

**Endpoint:** `DELETE /users/{user_id}/scores`

**Parameters:**
- `user_id` (path): String - The unique identifier for the user

**Response:**
```json
{
  "success": true,
  "message": "All scores for user user123 have been deleted"
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X DELETE "http://localhost:8000/users/user123/scores"
```

---

## Document Endpoints

### Create Document
**POST** `/documents`

Create a new document with content.

**Request Body:**
```json
{
  "user_id": "user123",
  "title": "Mathematics and Physics Study Guide",
  "document_content": "This is the content of the document...",
  "topic_scores": [
    {"mathematics": 8.0},
    {"physics": 7.5}
  ],
  "questions": [
    "What is the derivative of x²?",
    "Explain Newton's laws of motion."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Mathematics and Physics Study Guide",
    "topic_scores": [
      {"mathematics": 8.0},
      {"physics": 7.5}
    ],
    "questions": [
      "What is the derivative of x²?",
      "Explain Newton's laws of motion."
    ],
    "document_content": "This is the content of the document...",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  },
  "message": "Document created successfully"
}
```

### Get Document by ID
**GET** `/documents/{document_id}`

Retrieve a specific document by its ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Mathematics and Physics Study Guide",
    "topic_scores": [
      {"math": 8.5},
      {"science": 7.2}
    ],
    "document_content": "This is the content of the document...",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T12:00:00Z"
  }
}
```

### Get All Documents
**GET** `/documents`

Get all documents. Optionally filter by user_id.

**Query Parameters:**
- `user_id` (optional): Filter documents by user ID

**Examples:**
- `GET /documents` - Get all documents
- `GET /documents?user_id=user123` - Get documents for specific user

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "user_id": "user123",
      "title": "Mathematics Study Guide",
          "topic_scores": [
      {"mathematics": 8.0}
    ],
      "document_content": "Document 1 content...",
      "created_at": "2024-01-01T12:00:00Z",
      "updated_at": "2024-01-01T12:00:00Z"
    },
    {
      "id": "507f1f77bcf86cd799439012",
      "user_id": "user456",
      "title": "Physics Fundamentals",
      "topic_scores": [
        {"physics": 7.5}
      ],
      "document_content": "Document 2 content...",
      "created_at": "2024-01-01T13:00:00Z",
      "updated_at": "2024-01-01T13:00:00Z"
    }
  ]
}
```

### Update Document Scores
**PUT** `/documents/{document_id}/scores`

Update topic scores for a document. If a topic doesn't exist, it will be created.

**Request Body:**
```json
{
  "topic_scores": [
    {"math": 9.0},
    {"physics": 8.5},
    {"chemistry": 7.8}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Mathematics and Physics Study Guide",
    "topic_scores": [
      {"math": 9.0},
      {"physics": 8.5},
      {"chemistry": 7.8}
    ],
    "document_content": "This is the content of the document...",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T14:30:00Z"
  },
  "message": "Document scores updated successfully"
}
```

### Update Document Questions
**PUT** `/documents/{document_id}/questions`

Update questions for a document. New questions are added to existing ones, but only the last 10 questions are kept.

**Request Body:**
```json
{
  "questions": [
    "What is the integral of 2x?",
    "Define velocity and acceleration.",
    "What is the Pythagorean theorem?"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Mathematics and Physics Study Guide",
    "topic_scores": [
      {"mathematics": 8.0},
      {"physics": 7.5}
    ],
    "questions": [
      "What is the derivative of x²?",
      "Explain Newton's laws of motion.",
      "What is the integral of 2x?",
      "Define velocity and acceleration.",
      "What is the Pythagorean theorem?"
    ],
    "document_content": "This is the content of the document...",
    "created_at": "2024-01-01T12:00:00Z",
    "updated_at": "2024-01-01T14:30:00Z"
  },
  "message": "Document questions updated successfully"
}
```

### Delete Document
**DELETE** `/documents/{document_id}`

Delete a document by its ID.

**Response:**
```json
{
  "success": true,
  "message": "Document 507f1f77bcf86cd799439011 has been deleted"
}
```

## Error Responses

All endpoints return consistent error responses:

**400 Bad Request:**
```json
{
  "detail": "Error message describing the issue"
}
```

**404 Not Found:**
```json
{
  "detail": "Document 507f1f77bcf86cd799439011 not found"
}
```

**500 Internal Server Error:**
```json
{
  "detail": "Internal server error: Error message"
}
```

## Notes

- Document IDs are auto-generated MongoDB ObjectIds
- Topic scores are stored as an array of objects with `topic` and `score` fields
- Scores can be any float value
- The `updated_at` timestamp is automatically updated when scores are modified
- All timestamps are in UTC format

---

## Data Models

### UserScore Document Structure
```json
{
  "_id": "ObjectId (auto-generated)",
  "user_id": "string (unique)",
  "topic_scores": [
    {"topic_name": "score_value"},
    {"topic_name": "score_value"}
  ]
}
```

### Request Models

#### CreateUserRequest
```json
{
  "user_id": "string (required)"
}
```

#### UpdateTopicScoreRequest
```json
{
  "topic": "string (required)",
  "score": "float (required, 0-10)"
}
```

---

## Database Configuration

### MongoDB Connection
- **Host:** localhost
- **Port:** 27017
- **Database:** quiz_app
- **Collection:** user_scores

### Data Validation
- User IDs cannot be empty or whitespace-only
- Scores must be between 0 and 10 (inclusive)
- Topics cannot be empty strings
- Duplicate user IDs are not allowed

---

## Error Handling

### Standard Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes
- `200 OK`: Successful GET/PUT requests
- `201 Created`: Successful POST requests
- `400 Bad Request`: Invalid input data or validation errors
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Database or server errors

---

## CORS Configuration
The API is configured to accept requests from any origin with the following settings:
- **Allow Origins:** * (all origins)
- **Allow Methods:** GET, POST, PUT, DELETE, OPTIONS
- **Allow Headers:** * (all headers)
- **Allow Credentials:** true

---

## Development Setup

### Prerequisites
- Python 3.13+
- MongoDB running on localhost:27017
- Required Python packages (see requirements.txt)

### Installation
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start MongoDB service:
   ```bash
   mongod
   ```

3. Run the application:
   ```bash
   uvicorn main:app --reload
   ```

4. Access API documentation:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

---

## Examples

### Complete User Score Management Workflow

1. **Create a new user:**
   ```bash
   curl -X POST "http://localhost:8000/users" \
        -H "Content-Type: application/json" \
        -d '{"user_id": "student001"}'
   ```

2. **Add topic scores:**
   ```bash
   curl -X PUT "http://localhost:8000/users/student001/scores" \
        -H "Content-Type: application/json" \
        -d '{"topic": "mathematics", "score": 8.5}'
   
   curl -X PUT "http://localhost:8000/users/student001/scores" \
        -H "Content-Type: application/json" \
        -d '{"topic": "science", "score": 9.2}'
   ```

3. **Get all scores for the user:**
   ```bash
   curl -X GET "http://localhost:8000/users/student001/scores"
   ```

4. **Update a specific topic score:**
   ```bash
   curl -X PUT "http://localhost:8000/users/student001/scores" \
        -H "Content-Type: application/json" \
        -d '{"topic": "mathematics", "score": 8.8}'
   ```

5. **Get a specific topic score:**
   ```bash
   curl -X GET "http://localhost:8000/users/student001/scores/mathematics"
   ```
