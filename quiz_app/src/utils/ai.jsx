import { GoogleGenAI } from "@google/genai";

const apiKey = "AIzaSyCbgI4FFLjLdk_qqrxk6k0xF2cbDwAXe3I"

const ai = new GoogleGenAI({ apiKey: apiKey });
const model = "gemini-1.5-flash";

const generateQuizQuestion = async (textContent, topic, previousQuestions) => {
    
  const prompt = `
    You are a quiz generator. Please generate a single question based on the following topic: ${topic}.
    The quiz should be based on the following content:

    ${textContent}.

    Make sure you do not repeat the previous questions.

    The previous questions are: 
    
    ${previousQuestions}
    
    
    OUTPUTFORMAT:

    {
        "question": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "answer": "Paris"
    }
    
    Generate exactly one question, in the output format. No other text or explanation.
    `;

  const response = await ai.models.generateContent({
    model: model,
    contents: prompt,
  });

  return response.text;
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

export const generateQuiz = async (
  textContent,
  topic,
  previousQuestions,
  numQuestions
) => {
  const questions = [];
  for (let i = 0; i < numQuestions; i++) {
    const question = await generateQuizQuestion(textContent, topic, [
      ...previousQuestions,
      ...questions,
    ]);
    const parsedQuestion = await parseQuizQuestion(question);
    questions.push(parsedQuestion);
  }
  return questions;
};
