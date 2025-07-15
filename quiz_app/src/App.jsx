import { useState, useEffect } from "react";
import axios from "axios";
import { FileParser } from "./pages/FileParser";
import { QuizPage } from "./pages/QuizPage";
import { TopicSelectionPage } from "./pages/TopicSelectionPage";
import { DocumentViewer } from "./pages/DocumentViewer";
import { Login } from "./pages/Login";
import { SignUp } from "./pages/SignUp";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { generateQuiz, getTopicsFromText } from "./utils/ai";
import { Loading } from "./components/Loading";
import { Navbar } from "./components/Navbar";
import { Dashboard } from "./pages/Dashboard";
import { auth } from "./config/firebase-config";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  createUser,
  getUserScores,
  convertTopicScoresToObject,
  updateMultipleTopicScores,
} from "./utils/api";
import { ResultsPage } from "./pages/ResultsPage";

function App() {
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [textContent, setTextContent] = useState("");
  const [questions, setQuestions] = useState([]);
  const [userScores, setUserScores] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeUser, setActiveUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // const url = process.env.REACT_APP_API_URL || "http://localhost:4000";
  const url = "http://localhost:8000";

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthLoading(true);
      if (user) {
        console.log("User is authenticated:", user);
        setCurrentUser(user);
        setActiveUser(user.uid);
        setIsAuthenticated(true);

        // Ensure user exists in database (only once per session)
        try {
          console.log("Ensuring user exists in database for UID:", user.uid);
          await createUser(user.uid);
        } catch (error) {
          console.error("Error creating user in database:", error);
          // Don't block authentication for this error
        }
      } else {
        console.log("User is not authenticated");
        setCurrentUser(null);
        setActiveUser(null);
        setIsAuthenticated(false);
        setUserScores({});
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load user scores from database when activeUser changes
  useEffect(() => {
    const loadUserScores = async () => {
      if (!activeUser || !isAuthenticated) {
        setUserScores({});
        return;
      }

      try {
        setLoading(true);
        const response = await getUserScores(activeUser);
        const scoresObject = convertTopicScoresToObject(
          response.data.topic_scores || []
        );
        setUserScores(scoresObject);
      } catch (error) {
        console.error("Error loading user scores:", error);
        setUserScores({});
      } finally {
        setLoading(false);
      }
    };

    loadUserScores();
  }, [activeUser, isAuthenticated]);

  // Handle user logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setActiveUser(null);
      setIsAuthenticated(false);
      setUserScores({});
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Function to update scores in database
  const updateUserScoresInDB = async (newScores) => {
    try {
      await updateMultipleTopicScores(activeUser, newScores);
      setUserScores(newScores);
    } catch (error) {
      console.error("Error updating scores in database:", error);
    }
  };

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
      const topics = await getTopicsFromText(
        textContent,
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

  // Protected Route component
  const ProtectedRoute = ({ children }) => {
    if (authLoading) {
      return <Loading />;
    }
    return isAuthenticated ? children : <Navigate to="/login" replace />;
  };

  if (authLoading) {
    return <Loading />;
  }

  return (
    <>
      <BrowserRouter>
        {isAuthenticated && (
          <Navbar
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}
        <Routes>
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login
                  setIsAuthenticated={setIsAuthenticated}
                  setActiveUser={setActiveUser}
                />
              )
            }
          />
          <Route
            path="/signup"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <SignUp
                  setIsAuthenticated={setIsAuthenticated}
                  setActiveUser={setActiveUser}
                />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <FileParser
                  handleFileSelect={handleFileSelect}
                  textContent={textContent}
                  setTextContent={setTextContent}
                  selectedFile={selectedFile}
                  handleExtractTopics={handleExtractTopics}
                  handleGenerateQuiz={handleGenerateQuiz}
                  userScores={userScores}
                  setUserScores={updateUserScoresInDB}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/topic-selection"
            element={
              <ProtectedRoute>
                <TopicSelectionPage
                  handleGenerateQuiz={handleGenerateQuiz}
                  userScores={userScores}
                  setUserScores={updateUserScoresInDB}
                  activeUser={activeUser}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <QuizPage
                  questions={questions}
                  userScores={userScores}
                  setUserScores={updateUserScoresInDB}
                  activeUser={activeUser}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard topicScores={userScores} activeUser={activeUser} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/document/:documentId"
            element={
              <ProtectedRoute>
                <DocumentViewer 
                  userScores={userScores} 
                  setUserScores={updateUserScoresInDB}
                  activeUser={activeUser}
                />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results"
            element={
              <ProtectedRoute>
                <ResultsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={
              <Navigate
                to={isAuthenticated ? "/dashboard" : "/login"}
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>

      {loading && <Loading />}
    </>
  );
}

export default App;
