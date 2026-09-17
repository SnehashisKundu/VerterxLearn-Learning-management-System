import { env } from "../../config/env";

type TutorAskInput = {
  lecture_id: string;
  question: string;
  watched_seconds: number;
};

type TutorQuizInput = {
  lecture_id: string;
  watched_seconds: number;
  question_count: number;
  language: string;
};

type TutorSummaryInput = {
  lecture_id: string;
  watched_seconds: number;
};

const callAIService = async (
  endpoint: string,
  body: unknown,
) => {
  const response = await fetch(
    `${env.aiServiceUrl}/api/tutor/${endpoint}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail || "AI service request failed",
    );
  }

  return data;
};

export const askTutor = async (
  data: TutorAskInput,
) => {
  return callAIService("ask", data);
};

export const generateTutorQuiz = async (
  data: TutorQuizInput,
) => {
  return callAIService("quiz", data);
};

export const generateTutorSummary = async (
  data: TutorSummaryInput,
) => {
  return callAIService("summary", data);
};