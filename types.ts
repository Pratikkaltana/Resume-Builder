
export interface Education {
  id: string;
  school: string;
  degree: string;
  startDate: string;
  endDate: string;
  city: string;
  description: string;
  grade: string; // Added field for CGPA/Percentage
}

export interface Experience {
  id: string;
  company: string;
  jobTitle: string;
  startDate: string;
  endDate: string;
  city: string;
  description: string; // This can be rich text or bullet points, handled as string for simplicity
}

export interface Skill {
  id: string;
  name: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
}

export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  city: string;
  link: string; // Portfolio/LinkedIn
  jobTitle: string; // Target job title
  summary: string;
}

export interface ResumeData {
  personalInfo: PersonalInfo;
  education: Education[];
  experience: Experience[];
  skills: Skill[];
  themeColor: string;
}

export const INITIAL_RESUME_STATE: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    city: '',
    link: '',
    jobTitle: '',
    summary: ''
  },
  education: [],
  experience: [],
  skills: [],
  themeColor: '#2563eb'
};
