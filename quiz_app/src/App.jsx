import { useState } from "react";
import axios from "axios";
import { FileParser } from "./pages/FileParser";
import { QuizPage } from "./pages/QuizPage";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import { generateQuiz, getTopicsFromText } from "./utils/ai";
import { Loading } from "./components/Loading";
import { Navbar } from "./components/Navbar";

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [questions, setQuestions] = useState([]);
  const [userScores, setUserScores] = useState({});

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

  const handleExtractTopics = async () => {
    try {
      setLoading(true);
      const topics = await getTopicsFromText(textContent);
      console.log("App.jsx Topics: ", topics);
      setLoading(false);
      return topics;
    } catch (error) {
      console.error("Error extracting topics:", error);
      setLoading(false);
      return [];
    }
  };

  const handleGenerateQuiz = async (selectedTopics, numQuestions) => {
    console.log("App.jsx Selected topics: ", selectedTopics);
    console.log("App.jsx Num questions: ", numQuestions);
    try {
      setLoading(true);
      const questions = await generateQuiz(
        textContent,
        selectedTopics,
        [],
        numQuestions
      );
      setQuestions(questions);
      setLoading(false);
      return questions;
    } catch (error) {
      console.error("Error generating quiz:", error);
      setLoading(false);
      return [];
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
      <Navbar />
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <FileParser
                handleFileSelect={handleFileSelect}
                textContent={textContent}
                setTextContent={setTextContent}
                selectedFile={selectedFile}
                handleExtractTopics={handleExtractTopics}
                handleGenerateQuiz={handleGenerateQuiz}
                userScores={userScores}
                setUserScores={setUserScores}
              />
            }
          />
          <Route path="/quiz" element={<QuizPage questions={questions} userScores={userScores} setUserScores={setUserScores} />} />
        </Routes>
      </BrowserRouter>

      {loading && <Loading />}
    </>
  );
}

export default App;
