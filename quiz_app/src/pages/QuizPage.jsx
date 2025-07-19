import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateDocumentQuestions, updateDocumentScores } from "../utils/api";

export const QuizPage = ({
  questions: questionsProp,
  userScores,
  setUserScores,
}) => {
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
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 text-center">
          No Quiz Questions
        </h1>
        <button onClick={() => navigate("/dashboard")} className="quiz-btn">
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
      // Save the current answer immediately
      const updatedAnswers = {
        ...userAnswers,
        [currentQuestionIndex]: selectedOption,
      };
      setUserAnswers(updatedAnswers);

      if (isLastQuestion) {
        // For the last question, we need to ensure the answer is saved before finishing
        // Use the updated answers directly instead of relying on state
        handleFinishQuiz(updatedAnswers);
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
  const calculateScore = (answers = userAnswers) => {
    let score = 0;
    localQuestions.forEach((question, index) => {
      if (answers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  const calculateTopicWiseScore = (answers = userAnswers) => {
    const topicScores = {};
    localQuestions.forEach((question, index) => {
      const topic = question.topic || "Unknown Topic";
      const isCorrect = answers[index] === question.answer;
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

  const getCurrentTopicScores = (answers = userAnswers) => {
    const currentScores = {};
    localQuestions.forEach((question, index) => {
      const topic = question.topic || "Unknown Topic";
      if (!currentScores[topic]) {
        currentScores[topic] = 0;
      }
      if (answers[index] !== undefined) {
        const isCorrect = answers[index] === question.answer;
        currentScores[topic] += isCorrect ? 0.5 : -0.5;
        currentScores[topic] = Math.max(0, Math.min(10, currentScores[topic]));
      }
    });
    return currentScores;
  };

  // When quiz is finished, update scores and navigate to results
  const handleFinishQuiz = async (finalAnswers = null) => {
    // Use the provided answers or fall back to state
    const answersToUse = finalAnswers || userAnswers;
    
    // Update user scores
    if (userScores && setUserScores) {
      const updatedScores = { ...userScores };
      localQuestions.forEach((question, index) => {
        const topic = question.topic || "Unknown Topic";
        if (!updatedScores[topic]) {
          updatedScores[topic] = 0;
        }
        if (answersToUse[index] !== undefined) {
          let scoreChange = answersToUse[index] === question.answer ? 0.5 : -0.5;
          updatedScores[topic] += scoreChange;
          updatedScores[topic] = Math.max(
            0,
            Math.min(10, updatedScores[topic])
          );
        }
      });
      setUserScores(updatedScores);
    }
    // Update document if available
    if (documentId && localQuestions.length > 0) {
      try {
        const questionsList = [];
        localQuestions.forEach((question) => {
          questionsList.push(question.question);
        });
        await updateDocumentQuestions(documentId, questionsList);
        const currentScores = getCurrentTopicScores(answersToUse);
        const documentTopicScores = Object.entries(currentScores).map(
          ([topic, score]) => ({
            [topic]: Math.max(0, Math.min(10, score)),
          })
        );
        await updateDocumentScores(documentId, documentTopicScores);
      } catch (error) {
        console.error("Error updating document:", error);
      }
    }
    // Navigate to results page with all necessary data
    navigate("/results", {
      state: {
        userAnswers: answersToUse,
        questions: localQuestions,
        score: calculateScore(answersToUse),
        topicScores: calculateTopicWiseScore(answersToUse),
        documentId,
      },
    });
  };

  // Quiz in progress
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8">
          {/* Progress Bar */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3 sm:mb-2">
              <span className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-left">
                Question {currentQuestionIndex + 1} of {localQuestions.length}
              </span>
              <span className="text-xs sm:text-sm font-medium text-gray-600 text-center sm:text-right">
                {Math.round(
                  ((currentQuestionIndex + 1) / localQuestions.length) * 100
                )}
                % Complete
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
              <div
                className="bg-blue-600 h-2 sm:h-3 rounded-full transition-all duration-300 ease-out"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / localQuestions.length) * 100
                  }%`,
                }}
              ></div>
            </div>
          </div>

          {/* Question */}
          <div className="mb-6 sm:mb-8">
            {/* Topic Badge */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <span className="px-3 sm:px-4 py-1 sm:py-2 bg-blue-100 text-blue-800 text-xs sm:text-sm font-medium rounded-full">
                Topic: {currentQuestion.topic || "General"}
              </span>
            </div>

            <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-4 sm:mb-6 text-center leading-tight">
              {currentQuestion.question}
            </h1>

            {/* Options */}
            <div className="space-y-3 sm:space-y-4">
              {currentQuestion.options.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-start sm:items-center p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:bg-blue-50 touch-manipulation ${
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
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 mr-3 sm:mr-4 flex items-center justify-center flex-shrink-0 mt-0.5 sm:mt-0 ${
                      selectedOption === option
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedOption === option && (
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="text-sm sm:text-lg text-gray-700 font-medium leading-relaxed">
                    {option}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="quiz-btn w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
            >
              Previous
            </button>

            {/* Question Dots - Hidden on mobile to save space */}
            <div className="hidden sm:flex space-x-2">
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
              className="quiz-btn w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
            >
              {isLastQuestion ? "Finish Quiz" : "Next"}
            </button>
          </div>

          {/* Mobile Question Counter - Show on mobile instead of dots */}
          <div className="sm:hidden mt-4 text-center">
            <div className="flex justify-center space-x-1">
              {localQuestions.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index < currentQuestionIndex
                      ? "bg-green-500"
                      : index === currentQuestionIndex
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
