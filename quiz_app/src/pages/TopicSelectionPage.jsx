import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createDocument } from "../utils/api";
import { generateDocumentName } from "../utils/ai";

export const TopicSelectionPage = ({
  handleGenerateQuiz,
  userScores,
  setUserScores,
  activeUser,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    extractedTopics = [],
    textContent,
    selectedFile,
  } = location.state || {};

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(10);
  const [loading, setLoading] = useState(false);
  const [documentName, setDocumentName] = useState("");
  const [generatingName, setGeneratingName] = useState(false);

  // Initialize selected topics and generate document name when component mounts
  useEffect(() => {
    if (extractedTopics && extractedTopics.length > 0) {
      setSelectedTopics([...extractedTopics]);
    }

    // Generate document name if we have content
    if (textContent && !documentName) {
      generateDocumentNameFromContent();
    }
  }, [extractedTopics, textContent]);

  const generateDocumentNameFromContent = async () => {
    if (!textContent) return;

    try {
      setGeneratingName(true);
      const name = await generateDocumentName(textContent);
      setDocumentName(name);
    } catch (error) {
      console.error("Error generating document name:", error);
      setDocumentName("Untitled Document");
    } finally {
      setGeneratingName(false);
    }
  };

  const removeTopic = (indexToRemove) => {
    setSelectedTopics(
      selectedTopics.filter((_, index) => index !== indexToRemove)
    );
  };

  const addTopic = () => {
    if (newTopic.trim() && !selectedTopics.includes(newTopic.trim())) {
      setSelectedTopics([...selectedTopics, newTopic.trim()]);
      setNewTopic("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addTopic();
    }
  };

  const onGenerateQuiz = async () => {
    if (selectedTopics.length > 0) {
      try {
        setLoading(true);

        // Initialize scores for new topics and update user scores
        const updatedScores = { ...userScores };
        for (let topic of selectedTopics) {
          if (!updatedScores[topic]) {
            updatedScores[topic] = 0;
          }
        }

        // Update user scores in database
        await setUserScores(updatedScores);

        // Save document first
        const documentData = {
          user_id: activeUser,
          document_content: textContent,
          topic_scores: selectedTopics.map((topic) => ({
            [topic]: updatedScores[topic] || 0,
          })),
          questions: [],
          title: documentName || "Untitled Document",
        };

        const savedDocument = await createDocument(documentData);

        // Check if document was created successfully
        if (!savedDocument.data?._id) {
          throw new Error(
            "Failed to create document - no document ID returned"
          );
        }
        // Generate quiz using unified function with new document ID
        const questions = await handleGenerateQuiz(
          textContent,
          selectedTopics,
          numQuestions,
          savedDocument.data._id,
          [] // No previous questions for new documents
        );
        setLoading(false);

        if (questions && questions.length > 0) {
          // Navigate to quiz with document ID for later updates
          navigate("/quiz", {
            state: {
              documentId: savedDocument.data._id,
              questions: questions,
            },
          });
        }
      } catch (error) {
        console.error("Error generating quiz:", error);
        setLoading(false);
      }
    } else {
      alert("No topics selected, not generating quiz");
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Customize Your Quiz
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto">
            Select the topics you want to include in your quiz
          </p>
        </div>

        {/* Back Button */}
        <div className="text-left">
          <button
            onClick={() => navigate("/")}
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
            <span className="hidden sm:inline">Back to Content</span>
            <span className="sm:hidden">Back</span>
          </button>
        </div>

        {/* Document Name Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Document Name
          </h3>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <input
              type="text"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              placeholder="Document name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              disabled={generatingName}
            />
            <button
              onClick={generateDocumentNameFromContent}
              disabled={generatingName || !textContent}
              className="quiz-btn text-sm sm:text-base py-2 sm:py-3 whitespace-nowrap"
            >
              {generatingName ? "Generating..." : "Generate Name"}
            </button>
          </div>
        </div>

        {/* Topics Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
            Selected Topics ({selectedTopics.length})
          </h3>

          {selectedTopics.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {selectedTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-800 px-2 sm:px-3 py-1 sm:py-2 rounded-lg flex items-center gap-1 sm:gap-2 group hover:bg-blue-200 transition-colors"
                >
                  <span className="text-xs sm:text-sm font-medium break-words">{topic}</span>
                  <button
                    onClick={() => removeTopic(index)}
                    className="text-blue-600 hover:text-red-600 transition-colors flex-shrink-0"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 mb-4 sm:mb-6 italic text-sm sm:text-base">
              No topics selected. Add some topics below to create your quiz.
            </p>
          )}

          {/* Add New Topic */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-4 sm:mb-6">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Add a new topic..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
            />
            <button
              onClick={addTopic}
              disabled={!newTopic.trim()}
              className="quiz-btn text-sm sm:text-base py-2 sm:py-3 whitespace-nowrap"
            >
              Add
            </button>
          </div>

          {/* Number of Questions */}
          <div className="mb-4 sm:mb-6">
            <label className="block text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">
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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              onClick={() => navigate("/")}
              className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm sm:text-base"
            >
              Cancel
            </button>
            <button
              onClick={onGenerateQuiz}
              disabled={selectedTopics.length === 0 || loading}
              className="quiz-btn text-sm sm:text-base py-2 sm:py-3"
            >
              {loading
                ? "Generating Quiz..."
                : `Generate Quiz (${selectedTopics.length} topics, ${numQuestions} questions)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
