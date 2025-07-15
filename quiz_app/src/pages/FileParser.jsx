import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileUpload } from "../components/FileUpload";
import { Loading } from "../components/Loading";
import axios from "axios";

export const FileParser = ({ handleExtractTopics }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [textContent, setTextContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const url = "http://localhost:8000";

  const parseFile = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await axios.post(`${url}/parse_file`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      setLoading(false);
      if (response.data.success) {
        return response.data.data.text_content;
      } else {
        return "Error parsing file";
      }
    } catch (error) {
      setLoading(false);
      return "Error parsing file";
    }
  };

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    if (file) {
      const parsedContent = await parseFile(file);
      setTextContent(parsedContent);
    } else {
      setTextContent("");
    }
  };

  const onGenerateQuiz = async () => {
    try {
      setLoading(true);
      // Extract topics from the text content
      const topics = await handleExtractTopics(textContent);
      navigate("/topic-selection", {
        state: {
          extractedTopics: topics || [],
          textContent: textContent,
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
