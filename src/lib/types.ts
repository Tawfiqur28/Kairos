export interface Ikigai {
  passions: string;
  skills: string;
  values: string;
  interests:string;
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

export interface ActionPlan {
  careerGoal: string;
  plan: string;
}
