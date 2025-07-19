# Quiz App - AI-Powered Learning Platform

Try it out! [Quiz App](https://quiz-app-chetan.vercel.app/login)

## Description

Quiz App is my personal project aimed to help student learn through custom AI generated quizes. It is an AI-powered learning platform that transforms your documents into interactive quizzes. Built with React, FastAPI, Caddy and OpenAI's API, this application allows users to upload documents (PDF, DOCX, TXT, MD), automatically extract key topics, and generate personalized quiz questions to test their knowledge.

## Features

- **📄 Document Processing**: Upload and parse PDF, DOCX, TXT, and Markdown files
- **🤖 AI-Powered Topic Extraction**: Automatically identify key topics from your content using OpenAI GPT-4
- **🎯 Interactive Quizzes**: Generate multiple-choice questions based on extracted topics
- **📊 Progress Tracking**: Monitor your learning progress across different topics with a comprehensive dashboard
- **🔐 User Authentication**: Secure login with Firebase Authentication (Google Sign-in and Email/Password)
- **📱 Responsive Design**: Modern, mobile-friendly interface built with Tailwind CSS
- **🚀 Real-time Scoring**: Track and update your scores in real-time with MongoDB integration

## Tech Stack

### Frontend
- **React** - Modern React with hooks and functional components
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Firebase** - Authentication and user management
- **OpenAI API** - AI-powered content analysis and quiz generation

### Backend
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database for user scores and data
- **PyPDF2** - PDF parsing
- **python-docx** - Microsoft Word document parsing
- **Uvicorn** - ASGI server

### Deployement
- **Backend** - Azure Web App
- **Fronted** - Vercel

### Infrastructure for testing
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Caddy** - Web server for static file serving

## Dev Set up

Before running this application, make sure you have the following installed:

- **Docker** and **Docker Compose**
- **Node.js** (for local development)
- **Python 3.10+** (for local development)
- **MongoDB** (for local development)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# OpenAI API Key (Required)
OPENAI_API_KEY=your_openai_api_key_here

# MongoDB Connection String (Required)
MONGO_URI=mongodb://localhost:27017/quiz_app

```

### Getting Your OpenAI API Key

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up or log in to your account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your `.env` file

## Quick Start with Docker

The easiest way to run the application is using Docker Compose:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd quiz_app
```

### 2. Set Environment Variables
```bash
# Set your OpenAI API key
OPENAI_API_KEY="your_openai_api_key_here"

# Set MongoDB URI (if using external MongoDB)
MONGO_URI="mongodb://localhost:27017/quiz_app"
```

### 3. Build and Run with Docker Compose
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

### 4. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:4000
- **API Documentation**: http://localhost:4000/docs

## Usage

### 1. Authentication
- Sign up or log in using Google authentication or email/password
- Your account will be automatically created in the database

### 2. Upload Content
- Navigate to the file upload section
- Upload a document (PDF, DOCX, TXT, MD) or paste text content
- Click "Generate Quiz" to extract topics

### 3. Topic Selection
- Review the automatically extracted topics
- Add or remove topics as needed
- Select the number of questions you want to generate

### 4. Take the Quiz
- Answer multiple-choice questions
- Review your results and see your score
- Track your progress in the dashboard

### 5. Monitor Progress
- View your learning progress across all topics
- See your scores and improvement over time
- Identify areas that need more focus

## API Endpoints

The backend provides the following main endpoints:

- `POST /parse_file` - Parse uploaded documents
- `POST /users` - Create new user
- `GET /users/{user_id}/scores` - Get user scores
- `PUT /users/{user_id}/scores` - Update topic scores
- `GET /users/{user_id}/scores/{topic}` - Get specific topic score

For detailed API documentation, visit http://localhost:4000/docs when the backend is running.

## Project Structure

```
quiz_app/
├── api/                    # Backend FastAPI application
│   ├── main.py            # FastAPI app entry point
│   ├── models/            # Database models
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container configuration
├── quiz_app/              # Frontend React application
│   ├── src/               # React source code
│   │   ├── components/    # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── package.json       # Node.js dependencies
│   └── Dockerfile         # Frontend container configuration
├── docker-compose.yaml    # Multi-container orchestration
└── README.md             # This file
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Error**
   - Ensure your `OPENAI_API_KEY` is set correctly
   - Check that the API key has sufficient credits
   - Verify the key is valid in the OpenAI dashboard

2. **MongoDB Connection Issues**
   - Ensure MongoDB is running
   - Check the `MONGO_URI` environment variable
   - Verify network connectivity

3. **Docker Build Failures**
   - Clear Docker cache: `docker system prune -a`
   - Rebuild without cache: `docker-compose build --no-cache`

4. **Port Conflicts**
   - Ensure ports 3000 and 4000 are available
   - Modify ports in `docker-compose.yaml` if needed

### Development Tips

- Use `docker-compose logs -f` to monitor container logs
- Run `docker-compose down` to stop all services
- Use `docker-compose restart <service>` to restart specific services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Review the API documentation at http://localhost:4000/docs
3. Open an issue in the repository

---

**Happy Learning! 🎓** 
