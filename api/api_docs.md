# Quiz App API Documentation

## Overview
This is a FastAPI-based quiz application that provides file parsing capabilities and user management with MongoDB integration.

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

## User Management Endpoints

### 2. Create New User
Create a new user with optional topic scores.

**Endpoint:** `POST /users`

**Request:**
```json
{
  "user_id": "string",
  "topic_scores": [
    {"mathematics": 8.5},
    {"science": 9.2}
  ]
}
```

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
     -d '{"user_id": "user123", "topic_scores": [{"mathematics": 8.5}]}'
```

### 3. Get All Users
Retrieve all users in the system.

**Endpoint:** `GET /users`

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
curl -X GET "http://localhost:8000/users"
```

### 4. Get a Single User
Retrieve a user by user_id.

**Endpoint:** `GET /users/{user_id}`

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

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X GET "http://localhost:8000/users/user123"
```

### 5. Delete a User
Delete a user by user_id.

**Endpoint:** `DELETE /users/{user_id}`

**Response:**
```json
{
  "success": true,
  "message": "User user123 has been deleted"
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X DELETE "http://localhost:8000/users/user123"
```

### 6. Update User Scores
Replace all topic scores for a user.

**Endpoint:** `PUT /users/{user_id}/scores`

**Request:**
```json
{
  "topic_scores": [
    {"mathematics": 9.0},
    {"science": 8.7}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "topic_scores": [
      {"mathematics": 9.0},
      {"science": 8.7}
    ]
  },
  "message": "User user123 scores updated successfully"
}
```

**Error Responses:**
- `404 Not Found`: User not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X PUT "http://localhost:8000/users/user123/scores" \
     -H "Content-Type: application/json" \
     -d '{"topic_scores": [{"mathematics": 9.0}, {"science": 8.7}]}'
```

---

## Document Management Endpoints

### 1. Create Document
Create a new document for a user.

**Endpoint:** `POST /documents`

**Request:**
```json
{
  "user_id": "string",
  "title": "string",
  "document_content": "string",
  "topic_scores": [
    {"mathematics": 8.5},
    {"science": 9.2}
  ],
  "questions": [
    "What is the capital of France?",
    "Explain Newton's second law."
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Physics Notes",
    "document_content": "Content of the document...",
    "topic_scores": [
      {"mathematics": 8.5},
      {"science": 9.2}
    ],
    "questions": [
      "What is the capital of France?",
      "Explain Newton's second law."
    ],
    "created_at": "2024-06-01T12:00:00Z",
    "updated_at": "2024-06-01T12:00:00Z"
  },
  "message": "Document created successfully"
}
```

**Error Responses:**
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X POST "http://localhost:8000/documents" \
     -H "Content-Type: application/json" \
     -d '{"user_id": "user123", "title": "Physics Notes", "document_content": "Content...", "topic_scores": [{"mathematics": 8.5}], "questions": ["What is the capital of France?"]}'
```

### 2. Get All Documents
Retrieve all documents, optionally filtered by user_id.

**Endpoint:** `GET /documents`
- Optional query parameter: `user_id`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "user_id": "user123",
      "title": "Physics Notes",
      "document_content": "Content of the document...",
      "topic_scores": [
        {"mathematics": 8.5},
        {"science": 9.2}
      ],
      "questions": [
        "What is the capital of France?"
      ],
      "created_at": "2024-06-01T12:00:00Z",
      "updated_at": "2024-06-01T12:00:00Z"
    }
  ]
}
```

**Error Responses:**
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X GET "http://localhost:8000/documents"
curl -X GET "http://localhost:8000/documents?user_id=user123"
```

### 3. Get a Single Document
Retrieve a document by its ID.

**Endpoint:** `GET /documents/{document_id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Physics Notes",
    "document_content": "Content of the document...",
    "topic_scores": [
      {"mathematics": 8.5},
      {"science": 9.2}
    ],
    "questions": [
      "What is the capital of France?"
    ],
    "created_at": "2024-06-01T12:00:00Z",
    "updated_at": "2024-06-01T12:00:00Z"
  }
}
```

**Error Responses:**
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X GET "http://localhost:8000/documents/507f1f77bcf86cd799439011"
```

### 4. Delete a Document
Delete a document by its ID.

**Endpoint:** `DELETE /documents/{document_id}`

**Response:**
```json
{
  "success": true,
  "message": "Document 507f1f77bcf86cd799439011 has been deleted"
}
```

**Error Responses:**
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X DELETE "http://localhost:8000/documents/507f1f77bcf86cd799439011"
```

### 5. Update Document Scores
Replace all topic scores for a document.

**Endpoint:** `PUT /documents/{document_id}/scores`

**Request:**
```json
{
  "topic_scores": [
    {"mathematics": 9.0},
    {"science": 8.7}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Physics Notes",
    "document_content": "Content of the document...",
    "topic_scores": [
      {"mathematics": 9.0},
      {"science": 8.7}
    ],
    "questions": [
      "What is the capital of France?"
    ],
    "created_at": "2024-06-01T12:00:00Z",
    "updated_at": "2024-06-01T12:05:00Z"
  },
  "message": "Document scores updated successfully"
}
```

**Error Responses:**
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X PUT "http://localhost:8000/documents/507f1f77bcf86cd799439011/scores" \
     -H "Content-Type: application/json" \
     -d '{"topic_scores": [{"mathematics": 9.0}, {"science": 8.7}]}'
```

### 6. Update Document Questions
Update the questions for a document (keeps only the last 10 questions).

**Endpoint:** `PUT /documents/{document_id}/questions`

**Request:**
```json
{
  "questions": [
    "What is the capital of France?",
    "Explain Newton's second law.",
    "What is the speed of light?"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "user_id": "user123",
    "title": "Physics Notes",
    "document_content": "Content of the document...",
    "topic_scores": [
      {"mathematics": 9.0},
      {"science": 8.7}
    ],
    "questions": [
      "Explain Newton's second law.",
      "What is the speed of light?"
    ],
    "created_at": "2024-06-01T12:00:00Z",
    "updated_at": "2024-06-01T12:10:00Z"
  },
  "message": "Document questions updated successfully"
}
```

**Error Responses:**
- `404 Not Found`: Document not found
- `500 Internal Server Error`: Database connection issues

**Example:**
```bash
curl -X PUT "http://localhost:8000/documents/507f1f77bcf86cd799439011/questions" \
     -H "Content-Type: application/json" \
     -d '{"questions": ["Explain Newton\'s second law.", "What is the speed of light?"]}'
```

---

## Data Models

### User Document Structure
```json
{
  "_id": "ObjectId (auto-generated)",
  "user_id": "string (unique)",
  "topic_scores": [
    {"topic_name": score_value},
    {"topic_name": score_value}
  ]
}
```

### Document Structure
```json
{
  "_id": "ObjectId (auto-generated)",
  "user_id": "string",
  "title": "string",
  "document_content": "string",
  "topic_scores": [
    {"topic": score}
  ],
  "questions": [
    "string"
  ],
  "created_at": "ISODate",
  "updated_at": "ISODate"
}
```

### Request Models

#### CreateUserRequest
```json
{
  "user_id": "string (required)",
  "topic_scores": [
    {"topic": score}
  ]
}
```

#### UpdateUserScoresRequest
```json
{
  "topic_scores": [
    {"topic": score}
  ]
}
```

#### CreateDocumentRequest
```json
{
  "user_id": "string",
  "title": "string",
  "document_content": "string",
  "topic_scores": [
    {"topic": score}
  ],
  "questions": [
    "string"
  ]
}
```

#### UpdateScoresRequest (for Document)
```json
{
  "topic_scores": [
    {"topic": score}
  ]
}
```

#### UpdateQuestionsRequest (for Document)
```json
{
  "questions": [
    "string"
  ]
}
```

---

## Database Configuration

### MongoDB Connection
- **Host:** localhost
- **Port:** 27017
- **Database:** quiz_app
- **Collection:** users

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
- `200 OK`: Successful GET/PUT/DELETE requests
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

## Examples

### Complete User Management Workflow

1. **Create a new user:**
   ```bash
   curl -X POST "http://localhost:8000/users" \
        -H "Content-Type: application/json" \
        -d '{"user_id": "student001", "topic_scores": [{"mathematics": 8.5}]}'
   ```

2. **Update all topic scores for the user:**
   ```bash
   curl -X PUT "http://localhost:8000/users/student001/scores" \
        -H "Content-Type: application/json" \
        -d '{"topic_scores": [{"mathematics": 9.0}, {"science": 8.7}]}'
   ```

3. **Get all users:**
   ```bash
   curl -X GET "http://localhost:8000/users"
   ```

4. **Get a single user:**
   ```bash
   curl -X GET "http://localhost:8000/users/student001"
   ```

5. **Delete a user:**
   ```bash
   curl -X DELETE "http://localhost:8000/users/student001"
   ```
