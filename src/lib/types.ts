export type EducationLevel = 'highSchool' | 'undergrad' | 'masters' | 'phd' | 'professional';

export interface Ikigai {
  passions: string;
  skills: string;
  values: string;
  interests:string;
  educationLevel?: EducationLevel;
}

export interface UserProfile {
  name: string;
  ikigai: Ikigai;
}

export interface Career {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  marketDemand: number;
  cluster: string;
}

export interface JournalEntry {
  id: string;
  date: string;
  content: string;
  feeling: string;
}

export interface PlanTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface PlanPhase {
  title: string;
  duration: string;
  tasks: PlanTask[];
}

export interface ActionPlan {
  careerTitle: string;
  educationLevel: string;
  timeline: string;
  phases: PlanPhase[];
}
