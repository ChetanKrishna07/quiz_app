import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/FileUpload";
import { TopicSelectionModal } from "../components/TopicSelectionModal";
import { Loading } from "../components/Loading";

export const FileParser = ({
  handleFileSelect,
  textContent,
  setTextContent,
  selectedFile,
  handleExtractTopics,
  handleGenerateQuiz,
  userScores,
  setUserScores,
}) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [extractedTopics, setExtractedTopics] = useState([]);
  const [loading, setLoading] = useState(false);

  const onGenerateQuiz = async () => {
    try {
      setLoading(true);
      // First extract topics from the text
      const topics = await handleExtractTopics();
      console.log("FileParser.jsx Topics: ", topics);
      setLoading(false);
      if (topics && topics.length > 0) {
        setExtractedTopics(topics);
        setShowModal(true);
      } else {
        // If no topics extracted, show modal with empty topics
        setExtractedTopics([]);
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error extracting topics:", error);
      setLoading(false);
      // You could add error handling/user notification here
    }
  };

  const onModalGenerateQuiz = async (selectedTopics, numQuestions) => {
    try {
      setLoading(true);
      const questions = await handleGenerateQuiz(selectedTopics, numQuestions);
      setLoading(false);
      if (questions && questions.length > 0) {
        navigate("/quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setExtractedTopics([]);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8 bg-background">
        <div className="max-w-6xl w-full space-y-6 lg:space-y-8">
          <div className="text-center">
            <h1 className="mb-4">Generate Quiz from Your Content</h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              Upload a document or paste your content to create an interactive
              quiz
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* File Upload Section */}
            <div className="space-y-4">
              <h2>Upload Document</h2>
              <FileUpload onFileSelect={handleFileSelect} />
            </div>

            {/* Text Input Section */}
            <div className="space-y-4">
              <h2>Or Paste Your Content</h2>
              <textarea
                className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Paste your content here..."
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          </div>

          <div className="text-center">
            <button
              className="quiz-btn"
              disabled={!selectedFile && !textContent.trim()}
              onClick={onGenerateQuiz}
            >
              Generate Quiz
            </button>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && <Loading />}

      {/* Topic Selection Modal */}
      <TopicSelectionModal
        isOpen={showModal}
        onClose={closeModal}
        extractedTopics={extractedTopics}
        onGenerateQuiz={onModalGenerateQuiz}
        userScores={userScores}
        setUserScores={setUserScores}
      />
    </>
  );
};
