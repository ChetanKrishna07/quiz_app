import { useState } from "react";
import axios from "axios";
import { FileParser } from "./pages/FileParser";
import { QuizPage } from "./pages/QuizPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { generateQuiz } from "./utils/ai";

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [questions, setQuestions] = useState([]);

  const url = "http://localhost:8000";

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

  const handleGenerateQuiz = async () => {
    const questions = await generateQuiz(textContent, "test", [], 10);
    setQuestions(questions);
    return questions; // Return questions so FileParser can handle navigation
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
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <FileParser
                handleFileSelect={handleFileSelect}
                textContent={textContent}
                setTextContent={setTextContent}
                loading={loading}
                selectedFile={selectedFile}
                handleGenerateQuiz={handleGenerateQuiz}
              />
            }
          />
          <Route path="/quiz" element={<QuizPage questions={questions} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
