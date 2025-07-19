import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  getDocument,
  deleteDocument,
} from "../utils/api";
import { Loading } from "../components/Loading";
import { MdDeleteForever } from "react-icons/md";

export const DocumentViewer = ({ userScores, setUserScores, activeUser, handleGenerateQuiz }) => {
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
      const response = await getDocument(documentId);
      setDocument(response.data);

      // Initialize selected topics from document's topic scores
      if (response.data.topic_scores) {
        const topics = response.data.topic_scores.map(
          (scoreObj) => Object.keys(scoreObj)[0]
        );
        setSelectedTopics(topics);
      }
    } catch (error) {
      console.error("Error loading document:", error);
      console.error("Error details:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
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

      // Generate quiz using unified function
      const newQuestions = await handleGenerateQuiz(
        document.document_content,
        selectedTopics,
        numQuestions,
        documentId,
        previousQuestions
      );

      // Navigate to quiz with new questions
      if (newQuestions && newQuestions.length > 0) {
        navigate("/quiz", {
          state: {
            documentId: documentId,
            questions: newQuestions,
          },
        });
      }
    } catch (error) {
      console.error("Error generating new quiz:", error);
      alert("Error generating quiz. Please try again.");
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const toggleTopic = (topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  if (loading) {
    return <Loading />;
  }

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
          Document Not Found
        </h1>
        <button onClick={() => navigate("/dashboard")} className="quiz-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 break-words">
                  {document.title || "Untitled Document"}
                </h1>
                <p className="text-sm sm:text-base text-gray-600">
                  Created: {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                className="group p-2 sm:p-3 rounded-full bg-white shadow-lg hover:bg-red-100 focus:outline-none cursor-pointer touch-manipulation flex-shrink-0"
                aria-label="Delete Document"
                title="Delete Document"
                onClick={async (e) => {
                  e.stopPropagation();
                  const confirm = window.confirm("Are you sure you want to delete this document?");
                  if (confirm) {
                    try {
                      await deleteDocument(documentId);
                      navigate("/dashboard");
                    } catch (error) {
                      alert("Failed to delete document. Please try again.");
                    }
                  }
                }}
                type="button"
              >
                <MdDeleteForever className="text-red-500 text-xl sm:text-2xl group-hover:text-red-600 group-hover:scale-110 transition-all duration-300" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Document Content */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">
                Document Content
              </h2>
              <div className="prose max-w-none">
                <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {document.document_content}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-2">
            {/* Topic Scores */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Topic Scores
              </h3>
              {document.topic_scores && document.topic_scores.length > 0 ? (
                <div className="space-y-2 sm:space-y-3">
                  {document.topic_scores.map((scoreObj, index) => {
                    const topic = Object.keys(scoreObj)[0];
                    const score = scoreObj[topic];
                    return (
                      <div
                        key={index}
                        className="flex justify-between items-center"
                      >
                        <span className="text-xs sm:text-sm font-medium text-gray-700 truncate mr-2">
                          {topic}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-blue-600 flex-shrink-0">
                          {score}/10
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs sm:text-sm text-gray-500 italic">
                  No topic scores available
                </p>
              )}
            </div>

            {/* Generate New Quiz */}
            <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                Generate New Quiz
              </h3>

              {/* Topic Selection */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
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
                            className="mr-2 w-4 h-4 sm:w-5 sm:h-5"
                          />
                          <span className="text-xs sm:text-sm text-gray-700 break-words">{topic}</span>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 italic">No topics available</p>
                )}
              </div>

              {/* Number of Questions */}
              <div className="mb-3 sm:mb-4">
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
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
                className="w-full quiz-btn text-sm sm:text-base py-2 sm:py-3"
              >
                {generatingQuiz ? "Generating Quiz..." : "Generate New Quiz"}
              </button>
            </div>

            {/* Previous Questions */}
            {document.questions && document.questions.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
                  Previous Questions ({document.questions.length} / 10)
                </h3>
                <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                  {document.questions.slice(-10).map((question, index) => (
                    <div
                      key={index}
                      className="text-xs sm:text-sm text-gray-600 p-2 bg-gray-50 rounded"
                    >
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
