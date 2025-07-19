import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

// API utility functions for user and document management

/**
 * Parse a file and return the text content
 * @param {File} file - The file to parse
 * @returns {Promise<string>} - The text content of the file
 */
export const parseFile = async (file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    console.log("Parsing file:", file);
    console.log("Form data:", formData.get("file"));

    const response = await axios.post(`${API_BASE_URL}/parse_file`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    if (response.data.success) {
      return response.data.data.text_content;
    } else {
      return "Error parsing file";
    }
  } catch (error) {
    console.log(error);
    return "Error parsing file";
  }
};

/**
 * Create a new user with optional topic scores
 * @param {string} userId - The unique identifier for the user
 * @param {Array} topicScores - Optional array of topic score objects
 * @returns {Promise<Object>} - Response data
 */
export const createUser = async (userId, topicScores = []) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/users`,
      {
        user_id: userId,
        topic_scores: topicScores,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 400) {
      // User already exists
      const errorMessage =
        error.response?.data?.message || error.response?.data?.detail;
      if (errorMessage && errorMessage.includes("already exists")) {
        return { success: true, message: "User already exists" };
      }
    }
    throw error;
  }
};

/**
 * Get all user data (including topic scores)
 * @param {string} userId - The unique identifier for the user
 * @returns {Promise<Object>} - User data
 */
export const getUserScores = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
    // topic_scores is an array of objects: [{topic: score}]
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // User not found, return empty scores
      return { success: true, data: { topic_scores: [] } };
    }
    throw error;
  }
};

/**
 * Convert database topic_scores array to object format
 * @param {Array} topicScoresArray - Array of topic score objects from database
 * @returns {Object} - Object with topic names as keys and scores as values
 */
export const convertTopicScoresToObject = (topicScoresArray) => {
  const scoresObject = {};
  if (Array.isArray(topicScoresArray)) {
    topicScoresArray.forEach((scoreObj) => {
      Object.keys(scoreObj).forEach((topic) => {
        scoresObject[topic] = scoreObj[topic];
      });
    });
  }
  return scoresObject;
};

/**
 * Update all topic scores for a user (replaces all scores)
 * @param {string} userId - The unique identifier for the user
 * @param {Object} topicScores - Object with topic names as keys and scores as values
 * @returns {Promise<Object>} - Response data
 */
export const updateMultipleTopicScores = async (userId, topicScores) => {
  try {
    // Convert topicScores object to array of {topic: score} objects
    const topicScoresArray = Object.entries(topicScores).map(
      ([topic, score]) => ({ [topic]: score })
    );
    const response = await axios.put(
      `${API_BASE_URL}/users/${userId}/scores`,
      { topic_scores: topicScoresArray },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Document API functions

/**
 * Create a new document
 * @param {Object} documentData - Document data including user_id, title, document_content, topic_scores, questions
 * @returns {Promise<Object>} - Response data
 */
export const createDocument = async (documentData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/documents`,
      documentData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get all documents, optionally filtered by user_id
 * @param {string} userId - Optional user ID to filter documents
 * @returns {Promise<Object>} - Documents data
 */
export const getDocuments = async (userId = null) => {
  try {
    const url = userId
      ? `${API_BASE_URL}/documents?user_id=${userId}`
      : `${API_BASE_URL}/documents`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get a specific document by ID
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Document data
 */
export const getDocument = async (documentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, detail: "Document not found" };
    }
    throw error;
  }
};

/**
 * Update all topic scores for a document
 * @param {string} documentId - The document ID
 * @param {Array} topicScores - Array of topic score objects
 * @returns {Promise<Object>} - Response data
 */
export const updateDocumentScores = async (documentId, topicScores) => {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/documents/${documentId}/scores`,
      { topic_scores: topicScores },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update questions for a document (keeps only last 10 questions)
 * @param {string} documentId - The document ID
 * @param {Array} questions - Array of questions
 * @returns {Promise<Object>} - Response data
 */
export const updateDocumentQuestions = async (documentId, questions) => {
  try {
    console.log("Updating document questions:", questions);
    const data = { questions: questions };
    const response = await axios.put(
      `${API_BASE_URL}/documents/${documentId}/questions`,
      data,
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a document by ID
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
