import { useState } from "react";
import { FileUpload } from "./components/FileUpload/FileUpload";
import { Loading } from "./components/Loading/Loading";
import axios from "axios";

import "./App.css";

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");

  const url = "http://localhost:8000" || process.env.REACT_APP_API_URL;

  const handleFileSelect = async (file) => {
    setSelectedFile(file);
    console.log("Selected file:", file);
    if (file) {
      let parsed_content = await parseFile({ file: file });
      console.log("Parsed content:", parsed_content);
      setTextContent(parsed_content);
    } else {
      setTextContent("");
    }
  };

  const parseFile = async (file) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file.file);

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
      console.log(error);
      setLoading(false);
      return "Error parsing file";
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
}

export default App;
