import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateDocumentQuestions, updateDocumentScores } from "../utils/api";

export const QuizPage = ({ questions: questionsProp, userScores, setUserScores }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { documentId } = location.state || {};

  // Use a local copy of questions to prevent reset on parent re-render
  const [localQuestions] = useState(() => questionsProp);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState("");

  if (!localQuestions || localQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">No Quiz Questions</h1>
        <button
          onClick={() => navigate("/dashboard")}
          className="quiz-btn"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  const currentQuestion = localQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === localQuestions.length - 1;

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (selectedOption) {
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: selectedOption,
      }));

      if (isLastQuestion) {
        // Calculate scores and update backend before navigating
        handleFinishQuiz();
      } else {
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedOption("");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedOption(userAnswers[currentQuestionIndex - 1] || "");
    }
  };

  // Calculate scores for results page
  const calculateScore = () => {
    let score = 0;
    localQuestions.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  const calculateTopicWiseScore = () => {
    const topicScores = {};
    localQuestions.forEach((question, index) => {
      const topic = question.topic || "Unknown Topic";
      const isCorrect = userAnswers[index] === question.answer;
      if (!topicScores[topic]) {
        topicScores[topic] = { correct: 0, total: 0 };
      }
      topicScores[topic].total++;
      if (isCorrect) {
        topicScores[topic].correct++;
      }
    });
    return topicScores;
  };

  const getCurrentTopicScores = () => {
    const currentScores = {};
    localQuestions.forEach((question, index) => {
      const topic = question.topic || "Unknown Topic";
      if (!currentScores[topic]) {
        currentScores[topic] = 0;
      }
      if (userAnswers[index] !== undefined) {
        const isCorrect = userAnswers[index] === question.answer;
        currentScores[topic] += isCorrect ? 0.5 : -0.5;
        currentScores[topic] = Math.max(0, Math.min(10, currentScores[topic]));
      }
    });
    return currentScores;
  };

  // When quiz is finished, update scores and navigate to results
  const handleFinishQuiz = async () => {
    // Update user scores
    if (userScores && setUserScores) {
      const updatedScores = { ...userScores };
      localQuestions.forEach((question, index) => {
        const topic = question.topic || "Unknown Topic";
        if (!updatedScores[topic]) {
          updatedScores[topic] = 0;
        }
        if (userAnswers[index] !== undefined) {
          let scoreChange = userAnswers[index] === question.answer ? 0.5 : -0.5;
          updatedScores[topic] += scoreChange;
          updatedScores[topic] = Math.max(0, Math.min(10, updatedScores[topic]));
        }
      });
      setUserScores(updatedScores);
    }
    // Update document if available
    if (documentId && localQuestions.length > 0) {
      try {
        await updateDocumentQuestions(documentId, localQuestions);
        const currentScores = getCurrentTopicScores();
        const documentTopicScores = Object.entries(currentScores).map(([topic, score]) => ({
          [topic]: Math.max(0, Math.min(10, score)),
        }));
        await updateDocumentScores(documentId, documentTopicScores);
      } catch (error) {
        console.error("Error updating document:", error);
      }
    }
    // Navigate to results page with all necessary data
    navigate("/results", {
      state: {
        userAnswers,
        questions: localQuestions,
        score: calculateScore(),
        topicScores: calculateTopicWiseScore(),
        documentId,
        overallScores: userScores,
      },
    });
  };

  // Quiz in progress
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {localQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(
                ((currentQuestionIndex + 1) / localQuestions.length) * 100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / localQuestions.length) * 100
                }%`,
              }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="mb-8">
          {/* Topic Badge */}
          <div className="flex justify-center mb-4">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
              Topic: {currentQuestion.topic || "General"}
            </span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {currentQuestion.question}
          </h1>

          {/* Options */}
          <div className="space-y-4">
            {currentQuestion.options.map((option, index) => (
              <label
                key={index}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-blue-50 ${
                  selectedOption === option
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-blue-300"
                }`}
              >
                <input
                  type="radio"
                  name="quiz-option"
                  value={option}
                  checked={selectedOption === option}
                  onChange={() => handleOptionSelect(option)}
                  className="sr-only"
                />
                <div
                  className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                    selectedOption === option
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-300"
                  }`}
                >
                  {selectedOption === option && (
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  )}
                </div>
                <span className="text-lg text-gray-700 font-medium">
                  {option}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="quiz-btn"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {localQuestions.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index < currentQuestionIndex
                    ? "bg-green-500"
                    : index === currentQuestionIndex
                    ? "bg-blue-500"
                    : "bg-gray-300"
                }`}
              ></div>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={!selectedOption}
            className="quiz-btn"
          >
            {isLastQuestion ? "Finish Quiz" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};
