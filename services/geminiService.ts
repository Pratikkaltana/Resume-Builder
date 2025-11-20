import { GoogleGenAI, Type } from "@google/genai";
import { Experience, ResumeData } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
    throw new Error("API Key missing");
  }
  return new GoogleGenAI({ apiKey });
};

// Function to enhance a job description into professional bullet points
export const enhanceDescription = async (text: string): Promise<string> => {
  if (!text || text.length < 5) return text;

  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are an expert resume writer. Rewrite the following raw job description into professional, action-oriented resume bullet points. Keep it concise and impactful. Do not include preamble.
      
      Raw Description: "${text}"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            improvedDescription: {
              type: Type.STRING,
              description: "The rewritten description formatted as a markdown list (bullet points)."
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return text;
    
    const parsed = JSON.parse(jsonText);
    return parsed.improvedDescription || text;

  } catch (error) {
    console.error("Error enhancing description:", error);
    return text; // Return original on error
  }
};

// Function to generate a professional summary based on the entire resume
export const generateResumeSummary = async (resumeData: ResumeData): Promise<string> => {
  const ai = getAiClient();

  // Construct a context string from available data
  const context = `
    Name: ${resumeData.personalInfo.fullName}
    Target Role: ${resumeData.personalInfo.jobTitle}
    Experience: ${resumeData.experience.map(e => `${e.jobTitle} at ${e.company}`).join(', ')}
    Skills: ${resumeData.skills.map(s => s.name).join(', ')}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a professional, 3-4 sentence resume summary for the following candidate profile. It should be engaging and highlight their strengths suitable for the target role.

      Profile Data:
      ${context}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: "The professional resume summary."
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return "";
    
    const parsed = JSON.parse(jsonText);
    return parsed.summary || "";

  } catch (error) {
    console.error("Error generating summary:", error);
    return "";
  }
};

// Function to suggest skills based on job title
export const suggestSkills = async (jobTitle: string): Promise<string[]> => {
  if (!jobTitle) return [];
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `List 5 to 8 key technical and soft skills for a "${jobTitle}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            skills: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return [];
    const parsed = JSON.parse(jsonText);
    return parsed.skills || [];
  } catch (error) {
    console.error("Error suggesting skills:", error);
    return [];
  }
};
