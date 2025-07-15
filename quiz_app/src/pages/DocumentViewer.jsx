import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { getDocument, updateDocumentQuestions } from "../utils/api";
import { generateQuiz } from "../utils/ai";
import { Loading } from "../components/Loading";

export const DocumentViewer = ({ userScores, setUserScores, activeUser }) => {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [numQuestions, setNumQuestions] = useState(10);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      console.log("DocumentViewer - Loading document with ID:", documentId);
      const response = await getDocument(documentId);
      console.log("DocumentViewer - Document response:", response);
      setDocument(response.data);
      
      // Initialize selected topics from document's topic scores
      if (response.data.topic_scores) {
        const topics = response.data.topic_scores.map(scoreObj => 
          Object.keys(scoreObj)[0]
        );
        setSelectedTopics(topics);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNewQuiz = async () => {
    if (selectedTopics.length === 0) {
      alert("Please select at least one topic for the quiz.");
      return;
    }

    try {
      setGeneratingQuiz(true);
      
      // Get previous questions from the document
      const previousQuestions = document.questions || [];
      
      // Generate new quiz questions
      const newQuestions = await generateQuiz(
        document.document_content,
        selectedTopics,
        previousQuestions,
        numQuestions
      );

      // Update document with new questions
      const updatedQuestions = [...previousQuestions, ...newQuestions];
      await updateDocumentQuestions(documentId, updatedQuestions);

      // Navigate to quiz with new questions
      navigate("/quiz", { 
        state: { 
          documentId: documentId,
          questions: newQuestions 
        } 
      });
    } catch (error) {
      console.error("Error generating new quiz:", error);
      alert("Error generating quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const toggleTopic = (topic) => {
    setSelectedTopics(prev => 
      prev.includes(topic) 
        ? prev.filter(t => t !== topic)
        : [...prev, topic]
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Document Not Found</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="quiz-btn"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {document.title || "Untitled Document"}
            </h1>
            <p className="text-gray-600">
              Created: {new Date(document.created_at).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Document Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Document Content
              </h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {document.document_content}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Topic Scores */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Topic Scores
              </h3>
              {document.topic_scores && document.topic_scores.length > 0 ? (
                <div className="space-y-3">
                  {document.topic_scores.map((scoreObj, index) => {
                    const topic = Object.keys(scoreObj)[0];
                    const score = scoreObj[topic];
                    return (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">
                          {topic}
                        </span>
                        <span className="text-sm font-bold text-blue-600">
                          {score}/10
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 italic">No topic scores available</p>
              )}
            </div>

            {/* Generate New Quiz */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Generate New Quiz
              </h3>
              
              {/* Topic Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Topics
                </label>
                {document.topic_scores && document.topic_scores.length > 0 ? (
                  <div className="space-y-2">
                    {document.topic_scores.map((scoreObj, index) => {
                      const topic = Object.keys(scoreObj)[0];
                      return (
                        <label key={index} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedTopics.includes(topic)}
                            onChange={() => toggleTopic(topic)}
                            className="mr-2"
                          />
                          <span className="text-sm text-gray-700">{topic}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No topics available</p>
                )}
              </div>

              {/* Number of Questions */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                  <option value={15}>15 Questions</option>
                  <option value={20}>20 Questions</option>
                  <option value={25}>25 Questions</option>
                </select>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerateNewQuiz}
                disabled={selectedTopics.length === 0 || generatingQuiz}
                className="w-full quiz-btn"
              >
                {generatingQuiz ? "Generating Quiz..." : "Generate New Quiz"}
              </button>
            </div>

            {/* Previous Questions */}
            {document.questions && document.questions.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Previous Questions ({document.questions.length})
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {document.questions.slice(-5).map((question, index) => (
                    <div key={index} className="text-sm text-gray-600 p-2 bg-gray-50 rounded">
                      {question.question || question}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 