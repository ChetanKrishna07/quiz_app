import axios from "axios";

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
    const response = await axios.post(`${API_BASE_URL}/users`, {
      user_id: userId,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    console.log("User creation successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("User creation error details:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    if (error.response?.status === 400) {
      // Check if it's a "user already exists" error
      const errorMessage = error.response?.data?.message || error.response?.data?.detail;
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
    const response = await axios.put(`${API_BASE_URL}/users/${userId}/scores`, {
      topic: topic,
      score: score,
    });
    return response.data;
  } catch (error) {
    console.error("Error updating topic score:", error);
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
    const response = await axios.get(`${API_BASE_URL}/users/${userId}/scores/${topic}`);
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
    const updatePromises = Object.entries(topicScores).map(([topic, score]) =>
      updateTopicScore(userId, topic, score)
    );
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating multiple topic scores:", error);
    throw error;
  }
};
