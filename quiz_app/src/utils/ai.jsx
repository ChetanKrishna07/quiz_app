import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000"

const extractTopics = async (textContent, currentTopics = []) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ai/extract-topics`,
      {
        text_content: textContent,
        current_topics: currentTopics,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.data.success) {
      return JSON.stringify({ topics: response.data.data.topics });
    } else {
      throw new Error("Failed to extract topics");
    }
  } catch (error) {
    console.error("Error extracting topics:", error);
    return JSON.stringify({ topics: [] });
  }
};

const parseTopics = async (topicsResponse) => {
  try {
    let parsed = topicsResponse.trim();
    parsed = parsed.replace(/^```json\n/, "");
    parsed = parsed.replace(/\n```$/, "");
    parsed = parsed.replace(/^```/g, "");
    parsed = parsed.replace(/\n```/g, "");
    parsed = JSON.parse(parsed);
    return parsed.topics || [];
  } catch (error) {
    console.error("Error parsing topics:", error);
    return [];
  }
};

const generateQuizQuestion = async (textContent, topic, previousQuestions) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ai/generate-quiz`,
      {
        text_content: textContent,
        topic: topic,
        previous_questions: previousQuestions,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    
    if (response.data.success) {
      return JSON.stringify(response.data.data);
    } else {
      throw new Error("Failed to generate quiz question");
    }
  } catch (error) {
    console.error("Error generating quiz question:", error);
    return null;
  }
};

const parseQuizQuestion = async (question) => {
  try {
    let parsed = question.trim();
    parsed = parsed.replace(/^```json\n/, "");
    parsed = parsed.replace(/\n```$/, "");
    parsed = parsed.replace(/^```/g, "");
    parsed = parsed.replace(/\n```/g, "");
    parsed = parsed.replace(/^```/g, "");
    parsed = JSON.parse(parsed);
    return parsed;
  } catch (error) {
    console.error("Error parsing quiz question:", error);
    return null;
  }
};

export const getTopicsFromText = async (textContent, currentTopics = []) => {
  const topicsResponse = await extractTopics(textContent, currentTopics);
  const topics = await parseTopics(topicsResponse);
  return topics;
};

export const generateQuiz = async (
  textContent,
  topics,
  previousQuestions,
  numQuestions
) => {
  const questions = [];
  const topicsToUse = topics.length > 0 ? topics : ["general"];
  
  // Create a more diverse topic selection pattern
  const topicSelection = [];
  for (let i = 0; i < numQuestions; i++) {
    // Use modulo to cycle through topics, but add some randomness
    const baseIndex = i % topicsToUse.length;
    const topic = topicsToUse[baseIndex];
    topicSelection.push(topic);
  }
  
  // Shuffle the topic selection to add more variety
  for (let i = topicSelection.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [topicSelection[i], topicSelection[j]] = [topicSelection[j], topicSelection[i]];
  }

  // Track all questions to detect duplicates
  const allQuestionTexts = new Set(previousQuestions.map(q => q.toLowerCase().trim()));

  for (let i = 0; i < numQuestions; i++) {
    const topic = topicSelection[i];
    
    // Get all previous questions to avoid repetition
    const allPreviousQuestions = [
      ...previousQuestions,
      ...questions.map((q) => q.question)
    ];
    
    let attempts = 0;
    let parsedQuestion = null;
    
    // Try up to 3 times to get a unique question
    while (attempts < 3 && !parsedQuestion) {
      const question = await generateQuizQuestion(
        textContent, 
        topic, 
        allPreviousQuestions
      );
      
      parsedQuestion = await parseQuizQuestion(question);
      
      if (parsedQuestion) {
        const questionText = parsedQuestion.question.toLowerCase().trim();
        
        // Check if this question is a duplicate
        if (allQuestionTexts.has(questionText)) {
          console.warn(`Duplicate question detected: "${parsedQuestion.question}"`);
          parsedQuestion = null;
          attempts++;
        } else {
          allQuestionTexts.add(questionText);
          break;
        }
      } else {
        attempts++;
      }
    }
    
    if (parsedQuestion) {
      // Ensure the topic is included in the question object
      parsedQuestion.topic = topic;
      questions.push(parsedQuestion);
    } else {
      console.error(`Failed to generate unique question for topic: ${topic} after ${attempts} attempts`);
      // Continue with next question instead of retrying indefinitely
    }
  }
  
  console.log(`Generated ${questions.length} unique questions out of ${numQuestions} requested`);
  return questions;
};

/**
 * Generate a custom document name based on the content
 * @param {string} textContent - The document content
 * @returns {Promise<string>} - The generated document name
 */
export const generateDocumentName = async (textContent) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/ai/generate-document-name`,
      {
        text_content: textContent,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.success) {
      return response.data.data.title;
    } else {
      throw new Error("Failed to generate document name");
    }
  } catch (error) {
    console.error("Error generating document name:", error);
    return "Untitled Document";
  }
};
