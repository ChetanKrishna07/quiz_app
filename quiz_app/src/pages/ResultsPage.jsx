import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const ResultsPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    userAnswers = {},
    questions = [],
    score = 0,
    topicScores = {},
    documentId = null,
  } = location.state || {};

  if (!questions.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
          No Results Available
        </h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="quiz-btn"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const percentage = Math.round((score / questions.length) * 100);

  const getTopicColor = (score) => {
    if (score >= 7) return { bg: "bg-green-500", text: "text-green-600" };
    if (score >= 5) return { bg: "bg-yellow-500", text: "text-yellow-600" };
    if (score >= 3) return { bg: "bg-orange-500", text: "text-orange-600" };
    return { bg: "bg-red-500", text: "text-red-600" };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Quiz Results
            </h1>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">
              <span
                className={`${
                  percentage >= 70
                    ? "text-green-600"
                    : percentage >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                {score}/{questions.length}
              </span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-2">
              You scored {percentage}%
            </p>
            <p className="text-base sm:text-lg text-gray-500">
              {percentage >= 70
                ? "Excellent work! 🎉"
                : percentage >= 50
                ? "Good job! 👍"
                : "Keep practicing! 📚"}
            </p>
          </div>

          {/* Topic-wise Score */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-3 sm:mb-4">
              Current Quiz Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {Object.entries(topicScores).map(([topic, scores]) => (
                <div key={topic} className="bg-gray-50 rounded-lg p-3 sm:p-4">
                  <h3
                    className="font-medium text-gray-800 mb-2 truncate text-sm sm:text-base"
                    title={topic}
                  >
                    {topic}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-base sm:text-lg font-semibold text-gray-700">
                      {scores.correct}/{scores.total} correct
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2">
              Review Your Answers
            </h2>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.answer;
              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3 sm:p-4 lg:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-medium text-gray-800 flex-1">
                      <span className="text-sm sm:text-base text-gray-500 mr-2">{index + 1}.</span>
                      {question.question}
                    </h3>
                    <span className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full text-center self-start sm:self-auto flex-shrink-0">
                      {question.topic || "General"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="font-medium text-gray-700 text-sm sm:text-base">
                        Your answer:
                      </span>
                      <span
                        className={`px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium text-center inline-block ${
                          isCorrect
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {userAnswer}
                        {isCorrect ? " ✓" : " ✗"}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="font-medium text-gray-700 text-sm sm:text-base">
                          Correct answer:
                        </span>
                        <span className="px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-green-100 text-green-800 inline-block text-center">
                          {question.answer} ✓
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>     

          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              {documentId && (
                <button 
                  onClick={() => navigate(`/document/${documentId}`)} 
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
                >
                  Back to Document
                </button>
              )}
            </div>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="px-4 sm:px-6 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm sm:text-base cursor-pointer"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 