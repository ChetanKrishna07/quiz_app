import React from "react";
import { useNavigate } from "react-router-dom";
import { Loading } from "../components/Loading";
import { FileUpload } from "../components/FileUpload";

export const FileParser = ({
  handleFileSelect,
  textContent,
  setTextContent,
  loading,
  selectedFile,
  handleGenerateQuiz,
}) => {
  const navigate = useNavigate();

  const onGenerateQuiz = async () => {
    try {
      const questions = await handleGenerateQuiz();
      if (questions && questions.length > 0) {
        navigate("/quiz");
      }
    } catch (error) {
      console.error("Error generating quiz:", error);
      // You could add error handling/user notification here
    }
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 lg:p-8">
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
    </>
  );
};
