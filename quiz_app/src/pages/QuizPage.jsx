import React from "react";
import { useState } from "react";

export const QuizPage = ({ questions }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

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
        setShowResults(true);
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

  const calculateScore = () => {
    let score = 0;
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        score++;
      }
    });
    return score;
  };

  const calculateTopicWiseScore = () => {
    const topicScores = {};
    
    questions.forEach((question, index) => {
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

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setShowResults(false);
    setSelectedOption("");
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);
    const topicScores = calculateTopicWiseScore();

    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Quiz Results
            </h1>
            <div className="text-6xl font-bold mb-4">
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
            <p className="text-2xl text-gray-600 mb-2">
              You scored {percentage}%
            </p>
            <p className="text-lg text-gray-500">
              {percentage >= 70
                ? "Excellent work! 🎉"
                : percentage >= 50
                ? "Good job! 👍"
                : "Keep practicing! 📚"}
            </p>
          </div>

          {/* Topic-wise Score */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4">
              Topic-wise Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(topicScores).map(([topic, scores]) => {
                const topicPercentage = Math.round((scores.correct / scores.total) * 100);
                return (
                  <div key={topic} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2 truncate" title={topic}>
                      {topic}
                    </h3>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">
                        {scores.correct}/{scores.total} correct
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          topicPercentage >= 70
                            ? "text-green-600"
                            : topicPercentage >= 50
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {topicPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          topicPercentage >= 70
                            ? "bg-green-500"
                            : topicPercentage >= 50
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${topicPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-2">
              Review Your Answers
            </h2>
            {questions.map((question, index) => {
              const userAnswer = userAnswers[index];
              const isCorrect = userAnswer === question.answer;

              return (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-800">
                      {index + 1}. {question.question}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                      {question.topic || "General"}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 mr-2">
                        Your answer:
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
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
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 mr-2">
                          Correct answer:
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {question.answer} ✓
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button
              onClick={restartQuiz}
              className="quiz-btn"
            >
              Take Quiz Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(
                ((currentQuestionIndex + 1) / questions.length) * 100
              )}
              % Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
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
            {questions.map((_, index) => (
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
