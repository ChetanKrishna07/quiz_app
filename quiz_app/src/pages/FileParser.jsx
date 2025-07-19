import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/FileUpload";
import { Loading } from "../components/Loading";
import { parseFile } from "../utils/api";
import { getTopicsFromText } from "../utils/ai";

export const FileParser = ({ userScores, textContent, setTextContent }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [localTextContent, setLocalTextContent] = useState(textContent);

  const handleExtractTopics = async () => {
    try {
      setLoading(true);
      const topics = await getTopicsFromText(
        localTextContent,
        Object.keys(userScores)
      );
      console.log("App.jsx Topics: ", topics);
      setLoading(false);
      return topics;
    } catch (error) {
      console.error("Error extracting topics:", error);
      setLoading(false);
      return [];
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    setLoading(true);
    if (file) {
      const parsedContent = await parseFile(file);
      setLocalTextContent(parsedContent);
    } else {
      setLocalTextContent("");
    }
    setLoading(false);
  };

  const onGenerateQuiz = async () => {
    try {
      setLoading(true);
      setTextContent(localTextContent);
      // Extract topics from the text content
      console.log("FileParser.jsx onGenerateQuiz called");
      console.log("FileParser.jsx localTextContent: ", localTextContent);
      const topics = await handleExtractTopics(localTextContent);
      navigate("/topic-selection", {
        state: {
          extractedTopics: topics || [],
          textContent: localTextContent,
          selectedFile: selectedFile,
        },
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      navigate("/topic-selection", {
        state: {
          extractedTopics: [],
          textContent: textContent,
          selectedFile: selectedFile,
        },
      });
    }
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
                value={localTextContent}
                onChange={(e) => setLocalTextContent(e.target.value)}
              />
            </div>
          </div>

          <div className="text-center">
            <button
              className="quiz-btn"
              disabled={!selectedFile && !localTextContent.trim()}
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
