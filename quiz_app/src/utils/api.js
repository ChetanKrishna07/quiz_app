import axios from "axios";

// const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
const API_BASE_URL = "http://localhost:8000";

// API utility functions for user score management

/**
 * Create a new user with empty topic scores
 * @param {string} userId - The unique identifier for the user
 * @returns {Promise<Object>} - Response data
 */
export const createUser = async (userId) => {
  try {
    console.log("Creating user with ID:", userId);
    const response = await axios.post(
      `${API_BASE_URL}/users`,
      {
        user_id: userId,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("User creation successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("User creation error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 400) {
      // Check if it's a "user already exists" error
      const errorMessage =
        error.response?.data?.message || error.response?.data?.detail;
      if (errorMessage && errorMessage.includes("already exists")) {
        console.log("User already exists, continuing...");
        return { success: true, message: "User already exists" };
      }
    }
    throw error;
  }
};

/**
 * Get all topic scores for a user
 * @param {string} userId - The unique identifier for the user
 * @returns {Promise<Object>} - User scores data
 */
export const getUserScores = async (userId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/scores`);
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
 * Update or add a topic score for a user
 * @param {string} userId - The unique identifier for the user
 * @param {string} topic - The topic name
 * @param {number} score - The score value (0-10)
 * @returns {Promise<Object>} - Response data
 */
export const updateTopicScore = async (userId, topic, score) => {
  try {
    // Validate inputs
    if (!userId || !topic || score === undefined || score === null) {
      throw new Error("Missing required parameters: userId, topic, or score");
    }
    
    // Ensure score is a number and within valid range
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || numericScore < 0 || numericScore > 10) {
      throw new Error(`Invalid score: ${score}. Score must be between 0 and 10.`);
    }
    
    const requestData = {
      topic: topic,
      score: numericScore,
    };
    console.log("updateTopicScore - Request data:", requestData);
    console.log("updateTopicScore - URL:", `${API_BASE_URL}/users/${userId}/scores`);
    
    const response = await axios.put(`${API_BASE_URL}/users/${userId}/scores`, requestData);
    console.log("updateTopicScore - Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error updating topic score:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Get a specific topic score for a user
 * @param {string} userId - The unique identifier for the user
 * @param {string} topic - The topic name
 * @returns {Promise<Object>} - Topic score data
 */
export const getTopicScore = async (userId, topic) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/users/${userId}/scores/${topic}`
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      // Topic not found, return score of 0
      return { success: true, data: { score: 0 } };
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
 * Update multiple topic scores for a user
 * @param {string} userId - The unique identifier for the user
 * @param {Object} topicScores - Object with topic names as keys and scores as values
 * @returns {Promise<void>}
 */
export const updateMultipleTopicScores = async (userId, topicScores) => {
  try {
    console.log("updateMultipleTopicScores - userId:", userId);
    console.log("updateMultipleTopicScores - topicScores:", topicScores);
    
    const updatePromises = Object.entries(topicScores).map(([topic, score]) => {
      console.log(`updateMultipleTopicScores - Processing topic: ${topic}, score: ${score}`);
      return updateTopicScore(userId, topic, score);
    });
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating multiple topic scores:", error);
    throw error;
  }
};

// Document API functions

/**
 * Create a new document
 * @param {Object} documentData - Document data including user_id, document_content, topic_scores, questions
 * @returns {Promise<Object>} - Response data
 */
export const createDocument = async (documentData) => {
  try {
    console.log("createDocument - Request data:", documentData);
    console.log("createDocument - URL:", `${API_BASE_URL}/documents`);
    
    const response = await axios.post(`${API_BASE_URL}/documents`, documentData);
    console.log("createDocument - Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating document:", error);
    console.error("Error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    throw error;
  }
};

/**
 * Get all documents for a user
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
    console.error("Error getting documents:", error);
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
    console.error("Error getting document:", error);
    throw error;
  }
};

/**
 * Update document scores
 * @param {string} documentId - The document ID
 * @param {Array} topicScores - Array of topic score objects
 * @returns {Promise<Object>} - Response data
 */
export const updateDocumentScores = async (documentId, topicScores) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/documents/${documentId}/scores`, {
      topic_scores: topicScores
    });
    return response.data;
  } catch (error) {
    console.error("Error updating document scores:", error);
    throw error;
  }
};

/**
 * Update document questions
 * @param {string} documentId - The document ID
 * @param {Array} questions - Array of questions
 * @returns {Promise<Object>} - Response data
 */
export const updateDocumentQuestions = async (documentId, questions) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/documents/${documentId}/questions`, {
      questions: questions
    });
    return response.data;
  } catch (error) {
    console.error("Error updating document questions:", error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} documentId - The document ID
 * @returns {Promise<Object>} - Response data
 */
export const deleteDocument = async (documentId) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/documents/${documentId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error);
    throw error;
  }
};
