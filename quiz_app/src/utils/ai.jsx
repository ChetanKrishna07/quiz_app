import OpenAI from "openai";

const apiKey =
  "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";

const ai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

const model = "gpt-4o-mini";

const extractTopics = async (textContent) => {
  const prompt = `
    You are a topic extraction assistant. Please analyze the following text and extract 5-8 key topics that would be suitable for creating quiz questions.
    
    Text content:
    ${textContent}
    
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

export const getTopicsFromText = async (textContent) => {
  const topicsResponse = await extractTopics(textContent);
  const topics = await parseTopics(topicsResponse);
  console.log("ai.jsx Topics: ", topics);
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
