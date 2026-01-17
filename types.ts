
export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  tags: string[];
  link?: string;
  source?: string;
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
}

export interface InterviewQuestion {
  question: string;
  intent: string;
  tips: string;
}

export enum AppView {
  Home = 'home',
  Search = 'search',
  Resume = 'resume',
  Interview = 'interview',
  LiveMock = 'live-mock'
}
