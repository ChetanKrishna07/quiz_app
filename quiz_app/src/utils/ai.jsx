import OpenAI from "openai";

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

const ai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const model = "gpt-4o-mini";

const extractTopics = async (textContent, currentTopics = []) => {
  const prompt = `
    You are a topic extraction assistant. Please analyze the following text and extract 5-8 key topics that would be suitable for creating quiz questions.
    
    Text content:
    ${textContent}
    
    If the following topics are relevant, include them in the output exactly as they are without any modification along with any new topics you find:
    ${
      currentTopics && currentTopics.length > 0
        ? currentTopics.join(", ")
        : "None"
    }

    OUTPUTFORMAT:
    {
        "topics": ["Topic 1", "Topic 2", "Topic 3", "Topic 4", "Topic 5"]
    }
    
    Extract relevant topics that cover the main concepts, theories, facts, or important points from the text. Return exactly in the JSON format shown above. No other text or explanation.
    `;

  const response = await ai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  console.log("ai.jsx: ", response.choices[0].message.content);

  return response.choices[0].message.content;
};

const parseTopics = async (topicsResponse) => {
  try {
    let parsed = topicsResponse.trim();
    parsed = parsed.replace(/^```json\n/, "");
    parsed = parsed.replace(/\n```$/, "");
    parsed = parsed.replace(/^```/g, "");
    parsed = parsed.replace(/\n```/g, "");
    parsed = JSON.parse(parsed);
    console.log("ai.jsx Parsed topics: ", parsed);
    return parsed.topics || [];
  } catch (error) {
    console.error("Error parsing topics:", error);
    return [];
  }
};

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
        "answer": "Paris",
        "topic": "${topic}"
    }
    
    Generate exactly one question, in the output format. Make sure to include the topic field. No other text or explanation.
    `;

  const response = await ai.chat.completions.create({
    model: model,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  return response.choices[0].message.content;
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
    console.log("ai.jsx Parsed: ", parsed);
    return parsed;
  } catch (error) {
    console.error("Error parsing quiz question:", error);
    return null;
  }
};

export const getTopicsFromText = async (textContent, currentTopics = []) => {
  const topicsResponse = await extractTopics(textContent, currentTopics);
  const topics = await parseTopics(topicsResponse);
  console.log("ai.jsx Topics: ", topics);
  return topics;
};

// export const generateQuiz = async (
//   textContent,
//   topics,
//   previousQuestions,
//   numQuestions
// ) => {
//   // Replace this with mock questions for testing
//   const mockQuestions = [];
//   const topicsToUse = topics.length > 0 ? topics : ["general"];

//   for (let i = 0; i < numQuestions; i++) {
//     mockQuestions.push({
//       question: `Mock question ${i + 1} on topic ${
//         topicsToUse[i % topicsToUse.length]
//       }`,
//       options: ["Option A", "Option B", "Option C", "Option D"],
//       answer: "Option A",
//       topic: topicsToUse[i % topicsToUse.length],
//     });
//   }

//   return mockQuestions;
// };

export const generateQuiz = async (
  textContent,
  topics,
  previousQuestions,
  numQuestions
) => {
  const questions = [];
  const topicsToUse = topics.length > 0 ? topics : ["general"];

  for (let i = 0; i < numQuestions; i++) {
    const topic = topicsToUse[i % topicsToUse.length]; // Cycle through topics
    const question = await generateQuizQuestion(textContent, topic, [
      ...previousQuestions,
      ...questions,
    ]);
    const parsedQuestion = await parseQuizQuestion(question);
    if (parsedQuestion) {
      // Ensure the topic is included in the question object
      parsedQuestion.topic = topic;
      questions.push(parsedQuestion);
    }
  }
  return questions;
};
