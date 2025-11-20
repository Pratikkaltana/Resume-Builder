import { GoogleGenAI, Type } from "@google/genai";
import { Experience, ResumeData, Education, Skill } from "../types";

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

// Function to process voice commands and return structured updates
export const processVoiceCommand = async (transcript: string): Promise<{
  intent: 'update_personal' | 'add_experience' | 'add_education' | 'add_skill' | 'unknown';
  data: any;
}> => {
  const ai = getAiClient();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a Resume Assistant. Analyze the user's voice command and extract structured data to update a resume. 
      
      Command: "${transcript}"
      
      Determine the intent:
      1. 'update_personal' if they mention name, email, phone, city, job title, or summary.
      2. 'add_experience' if they mention a job, company, work history.
      3. 'add_education' if they mention school, degree, university, grade.
      4. 'add_skill' if they mention skills or technologies.
      
      Return JSON matching the intent.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            intent: {
              type: Type.STRING,
              enum: ['update_personal', 'add_experience', 'add_education', 'add_skill', 'unknown']
            },
            data: {
              type: Type.OBJECT,
              description: "The extracted data fields. For personal info, use keys: fullName, email, phone, city, jobTitle, summary, link. For experience: company, jobTitle, startDate, endDate, city, description. For education: school, degree, startDate, endDate, grade, city. For skill: name, level (Beginner/Intermediate/Advanced/Expert).",
              properties: {
                fullName: { type: Type.STRING },
                email: { type: Type.STRING },
                phone: { type: Type.STRING },
                city: { type: Type.STRING },
                link: { type: Type.STRING },
                jobTitle: { type: Type.STRING },
                summary: { type: Type.STRING },
                company: { type: Type.STRING },
                school: { type: Type.STRING },
                degree: { type: Type.STRING },
                startDate: { type: Type.STRING },
                endDate: { type: Type.STRING },
                description: { type: Type.STRING },
                grade: { type: Type.STRING },
                name: { type: Type.STRING },
                level: { type: Type.STRING },
              }
            }
          }
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { intent: 'unknown', data: {} };
    return JSON.parse(jsonText);

  } catch (error) {
    console.error("Error processing voice command:", error);
    return { intent: 'unknown', data: {} };
  }
};