
'use server';
/**
 * @fileOverview Generates a 3-year personalized action plan for career goals.
 */

import { z } from 'zod';
import { callModelScopeAI } from '@/ai/utils';

const GeneratePersonalizedActionPlanInputSchema = z.object({
  careerGoal: z.string().min(2, 'Career goal must be at least 2 characters').describe('The user\'s desired career goal.'),
  userDetails: z
    .string()
    .min(10, 'User details must be at least 10 characters')
    .describe('Details about the user, including their current education level, skills, and interests.'),
  useAIFallback: z.boolean().optional().default(true).describe('Use AI as fallback if local generation fails')
});

export type GeneratePersonalizedActionPlanInput = z.infer<
  typeof GeneratePersonalizedActionPlanInputSchema
>;

const PlanTaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  completed: z.boolean(),
});

const PlanPhaseSchema = z.object({
  title: z.string(),
  duration: z.string(),
  tasks: z.array(PlanTaskSchema),
});

const GeneratePersonalizedActionPlanOutputSchema = z.object({
  careerTitle: z.string(),
  educationLevel: z.string(),
  timeline: z.string(),
  phases: z.array(PlanPhaseSchema),
  generatedAt: z.string().optional(),
  success: z.boolean().optional(),
});

export type GeneratePersonalizedActionPlanOutput = z.infer<
  typeof GeneratePersonalizedActionPlanOutputSchema
>;

// FIX 1: Enhanced education level prompts with more detail
const getEducationLevelPrompt = (educationLevel?: string): string => {
  const prompts: Record<string, string> = {
    high_school: `For HIGH SCHOOL student: Focus on foundational skills, college prep, and exploration. 
- Suggest relevant AP courses and subject selection
- Recommend extracurricular activities and clubs
- Highlight summer programs and internships for high schoolers
- Include college major considerations
- Timeline: 4-6 years to entry level (including college)`,
    
    undergrad: `For UNDERGRADUATE student: Focus on major courses, internships, skill-building, and networking.
- Recommend specific coursework within their major
- Suggest relevant certifications and online courses
- Include internship search strategies
- Highlight portfolio/project development
- Timeline: 2-4 years to entry level`,
    
    masters: `For MASTER'S student: Focus on specialization, research projects, professional networking, and industry connections.
- Recommend thesis or capstone project directions
- Suggest conference attendance and paper submissions
- Include advanced certification options
- Highlight networking strategies for specialized roles
- Timeline: 1-3 years to specialized role`,
    
    phd: `For PhD student: Focus on research contribution, publication strategy, academic networking, and career positioning.
- Recommend publication targets (journals/conferences)
- Suggest grant writing and funding opportunities
- Include teaching experience development
- Highlight academic job market preparation
- Timeline: Variable based on dissertation completion`,
    
    professional: `For WORKING PROFESSIONAL: Focus on upskilling, certifications, networking for senior roles, and transitioning skills.
- Identify skill gaps based on career goal
- Recommend industry-recognized certifications
- Suggest networking strategies for career pivots
- Include personal branding and LinkedIn optimization
- Timeline: 1-2 years to pivot or advance`
  };
  
  return prompts[educationLevel as keyof typeof prompts] || 'Provide general career guidance tailored to their background.';
};

// FIX 2: Career-specific plan templates for ALL 21 careers
const getCareerSpecificTasks = (careerLower: string, careerGoal: string): { 
  phase1Tasks: any[], 
  phase2Tasks: any[], 
  phase3Tasks: any[] 
} => {
  
  // Tech Careers
  if (careerLower.includes('software') || careerLower.includes('developer') || careerLower.includes('engineer')) {
    return {
      phase1Tasks: [
        { id: 'tech-1-1', text: `Master one programming language (Python, JavaScript, or Java) relevant to ${careerGoal}`, completed: false },
        { id: 'tech-1-2', text: 'Learn Git version control and create GitHub profile with at least 3 repositories', completed: false },
        { id: 'tech-1-3', text: 'Complete a data structures and algorithms course (LeetCode, Coursera, or similar)', completed: false },
        { id: 'tech-1-4', text: 'Build a simple portfolio project showcasing your skills', completed: false }
      ],
      phase2Tasks: [
        { id: 'tech-2-1', text: 'Learn a popular framework (React, Node.js, Spring, Django, etc.)', completed: false },
        { id: 'tech-2-2', text: 'Complete 2-3 substantial portfolio projects with documentation', completed: false },
        { id: 'tech-2-3', text: 'Contribute to open-source projects or start your own', completed: false },
        { id: 'tech-2-4', text: 'Practice coding interview problems daily (LeetCode, HackerRank)', completed: false }
      ],
      phase3Tasks: [
        { id: 'tech-3-1', text: 'Apply for internships or entry-level positions (aim for 10+ applications/month)', completed: false },
        { id: 'tech-3-2', text: 'Network with developers on LinkedIn, attend tech meetups', completed: false },
        { id: 'tech-3-3', text: 'Prepare for technical and behavioral interviews with mock interviews', completed: false },
        { id: 'tech-3-4', text: 'Secure a mentor in the software engineering field', completed: false }
      ]
    };
  }
  
  // Cloud Architecture
  else if (careerLower.includes('cloud')) {
    return {
      phase1Tasks: [
        { id: 'cloud-1-1', text: 'Learn networking fundamentals and operating systems (Linux)', completed: false },
        { id: 'cloud-1-2', text: 'Get AWS/Azure/GCP foundational certification (Cloud Practitioner)', completed: false },
        { id: 'cloud-1-3', text: 'Learn infrastructure as code (Terraform, CloudFormation)', completed: false },
        { id: 'cloud-1-4', text: 'Build a simple cloud-hosted project', completed: false }
      ],
      phase2Tasks: [
        { id: 'cloud-2-1', text: 'Earn associate-level cloud certification (AWS Solutions Architect)', completed: false },
        { id: 'cloud-2-2', text: 'Learn containerization (Docker) and orchestration (Kubernetes)', completed: false },
        { id: 'cloud-2-3', text: 'Implement CI/CD pipelines for cloud deployments', completed: false },
        { id: 'cloud-2-4', text: 'Work on multi-cloud or hybrid cloud projects', completed: false }
      ],
      phase3Tasks: [
        { id: 'cloud-3-1', text: 'Earn professional-level cloud certification', completed: false },
        { id: 'cloud-3-2', text: 'Apply for cloud architect or DevOps roles', completed: false },
        { id: 'cloud-3-3', text: 'Build a portfolio of cloud architecture case studies', completed: false },
        { id: 'cloud-3-4', text: 'Network with cloud professionals at AWS re:Invent or similar', completed: false }
      ]
    };
  }
  
  // Data Science
  else if (careerLower.includes('data') || careerLower.includes('analyst') || careerLower.includes('scientist')) {
    return {
      phase1Tasks: [
        { id: 'data-1-1', text: 'Learn Python for data analysis (Pandas, NumPy, Matplotlib)', completed: false },
        { id: 'data-1-2', text: 'Study statistics and probability fundamentals', completed: false },
        { id: 'data-1-3', text: 'Complete SQL database fundamentals course', completed: false },
        { id: 'data-1-4', text: 'Work with a simple dataset for analysis practice', completed: false }
      ],
      phase2Tasks: [
        { id: 'data-2-1', text: 'Learn data visualization (Tableau, PowerBI, or Seaborn/Plotly)', completed: false },
        { id: 'data-2-2', text: 'Study machine learning fundamentals (scikit-learn)', completed: false },
        { id: 'data-2-3', text: 'Complete a Kaggle competition or dataset analysis', completed: false },
        { id: 'data-2-4', text: 'Build a data analysis portfolio with 2-3 projects', completed: false }
      ],
      phase3Tasks: [
        { id: 'data-3-1', text: 'Apply for data internships or junior analyst roles', completed: false },
        { id: 'data-3-2', text: 'Network with data professionals on LinkedIn and at meetups', completed: false },
        { id: 'data-3-3', text: 'Prepare for case study and technical interviews', completed: false },
        { id: 'data-3-4', text: 'Consider certifications (Google Data Analytics, IBM Data Science)', completed: false }
      ]
    };
  }
  
  // Cybersecurity
  else if (careerLower.includes('cyber') || careerLower.includes('security') || careerLower.includes('ethical') || careerLower.includes('hacker')) {
    return {
      phase1Tasks: [
        { id: 'sec-1-1', text: 'Learn networking fundamentals and operating systems (Linux)', completed: false },
        { id: 'sec-1-2', text: 'Study cybersecurity basics and common attack vectors', completed: false },
        { id: 'sec-1-3', text: 'Get CompTIA Security+ certification', completed: false },
        { id: 'sec-1-4', text: 'Set up a home lab for security practice', completed: false }
      ],
      phase2Tasks: [
        { id: 'sec-2-1', text: 'Learn penetration testing tools (Metasploit, Burp Suite, Wireshark)', completed: false },
        { id: 'sec-2-2', text: 'Practice on platforms like HackTheBox, TryHackMe', completed: false },
        { id: 'sec-2-3', text: 'Earn Certified Ethical Hacker (CEH) certification', completed: false },
        { id: 'sec-2-4', text: 'Participate in CTF competitions', completed: false }
      ],
      phase3Tasks: [
        { id: 'sec-3-1', text: 'Earn advanced certification (OSCP, CISSP)', completed: false },
        { id: 'sec-3-2', text: 'Apply for security analyst or penetration tester roles', completed: false },
        { id: 'sec-3-3', text: 'Build a portfolio of security write-ups and findings', completed: false },
        { id: 'sec-3-4', text: 'Network at security conferences (DEF CON, Black Hat)', completed: false }
      ]
    };
  }
  
  // AI/ML
  else if (careerLower.includes('ai') || careerLower.includes('machine learning')) {
    return {
      phase1Tasks: [
        { id: 'ai-1-1', text: 'Master Python and essential libraries (NumPy, Pandas)', completed: false },
        { id: 'ai-1-2', text: 'Study linear algebra, calculus, and probability', completed: false },
        { id: 'ai-1-3', text: 'Complete introductory ML course (Andrew Ng\'s course)', completed: false },
        { id: 'ai-1-4', text: 'Build your first ML model on a simple dataset', completed: false }
      ],
      phase2Tasks: [
        { id: 'ai-2-1', text: 'Learn deep learning frameworks (TensorFlow, PyTorch)', completed: false },
        { id: 'ai-2-2', text: 'Study computer vision or NLP specialization', completed: false },
        { id: 'ai-2-3', text: 'Complete 2-3 ML projects with documentation', completed: false },
        { id: 'ai-2-4', text: 'Participate in Kaggle competitions', completed: false }
      ],
      phase3Tasks: [
        { id: 'ai-3-1', text: 'Read and implement research papers in your area of interest', completed: false },
        { id: 'ai-3-2', text: 'Apply for ML internships or research assistant positions', completed: false },
        { id: 'ai-3-3', text: 'Network at AI conferences (NeurIPS, ICML)', completed: false },
        { id: 'ai-3-4', text: 'Consider contributing to open-source ML projects', completed: false }
      ]
    };
  }
  
  // Science (Physics/Chemistry)
  else if (careerLower.includes('physicist') || careerLower.includes('chemist') || careerLower.includes('scientist')) {
    return {
      phase1Tasks: [
        { id: 'sci-1-1', text: 'Excel in core science and math courses', completed: false },
        { id: 'sci-1-2', text: 'Learn laboratory techniques and safety protocols', completed: false },
        { id: 'sci-1-3', text: 'Develop programming skills for scientific computing', completed: false },
        { id: 'sci-1-4', text: 'Read research papers in your field of interest', completed: false }
      ],
      phase2Tasks: [
        { id: 'sci-2-1', text: 'Join a professor\'s research lab as an undergraduate researcher', completed: false },
        { id: 'sci-2-2', text: 'Present at undergraduate research conferences', completed: false },
        { id: 'sci-2-3', text: 'Apply for summer research programs (REU, SURF)', completed: false },
        { id: 'sci-2-4', text: 'Co-author a paper if opportunity arises', completed: false }
      ],
      phase3Tasks: [
        { id: 'sci-3-1', text: 'Apply to graduate programs (PhD) in your field', completed: false },
        { id: 'sci-3-2', text: 'Network with researchers at conferences', completed: false },
        { id: 'sci-3-3', text: 'Prepare for GRE subject tests if required', completed: false },
        { id: 'sci-3-4', text: 'Secure strong letters of recommendation', completed: false }
      ]
    };
  }
  
  // Healthcare (Doctor, Nurse, Psychologist)
  else if (careerLower.includes('doctor') || careerLower.includes('nurse') || careerLower.includes('psychologist') || careerLower.includes('medical')) {
    return {
      phase1Tasks: [
        { id: 'health-1-1', text: 'Excel in science prerequisites (biology, chemistry, physics)', completed: false },
        { id: 'health-1-2', text: 'Volunteer at hospitals or clinics', completed: false },
        { id: 'health-1-3', text: 'Shadow healthcare professionals', completed: false },
        { id: 'health-1-4', text: 'Get CPR and First Aid certification', completed: false }
      ],
      phase2Tasks: [
        { id: 'health-2-1', text: 'Prepare for entrance exams (MCAT, GRE, etc.)', completed: false },
        { id: 'health-2-2', text: 'Gain clinical experience through internships', completed: false },
        { id: 'health-2-3', text: 'Research graduate/professional programs', completed: false },
        { id: 'health-2-4', text: 'Secure strong letters of recommendation', completed: false }
      ],
      phase3Tasks: [
        { id: 'health-3-1', text: 'Apply to medical/nursing/graduate programs', completed: false },
        { id: 'health-3-2', text: 'Prepare for interviews', completed: false },
        { id: 'health-3-3', text: 'Continue building relevant experience', completed: false },
        { id: 'health-3-4', text: 'Network with professionals in your desired specialty', completed: false }
      ]
    };
  }
  
  // Arts/Creative (Music Producer, Graphic Designer, Content Creator, TikTok)
  else if (careerLower.includes('music') || careerLower.includes('producer') || careerLower.includes('graphic') || 
           careerLower.includes('designer') || careerLower.includes('content') || careerLower.includes('tiktok')) {
    return {
      phase1Tasks: [
        { id: 'creative-1-1', text: `Learn essential tools for ${careerGoal} (Adobe Creative Suite, DAWs, editing software)`, completed: false },
        { id: 'creative-1-2', text: 'Build a portfolio of your best work', completed: false },
        { id: 'creative-1-3', text: 'Study successful creators in your field', completed: false },
        { id: 'creative-1-4', text: 'Start posting your work on relevant platforms', completed: false }
      ],
      phase2Tasks: [
        { id: 'creative-2-1', text: 'Collaborate with other creatives', completed: false },
        { id: 'creative-2-2', text: 'Take advanced courses to refine your skills', completed: false },
        { id: 'creative-2-3', text: 'Build an audience or following', completed: false },
        { id: 'creative-2-4', text: 'Seek freelance or contract opportunities', completed: false }
      ],
      phase3Tasks: [
        { id: 'creative-3-1', text: 'Monetize your skills through clients, commissions, or platforms', completed: false },
        { id: 'creative-3-2', text: 'Network at industry events or online communities', completed: false },
        { id: 'creative-3-3', text: 'Develop a personal brand', completed: false },
        { id: 'creative-3-4', text: 'Consider mentorship or teaching others', completed: false }
      ]
    };
  }
  
  // Business (Marketing Manager, Digital Marketing Specialist)
  else if (careerLower.includes('market') || careerLower.includes('business') || careerLower.includes('digital')) {
    return {
      phase1Tasks: [
        { id: 'biz-1-1', text: 'Learn marketing fundamentals and terminology', completed: false },
        { id: 'biz-1-2', text: 'Get certified in Google Analytics and Google Ads', completed: false },
        { id: 'biz-1-3', text: 'Study social media platforms and algorithms', completed: false },
        { id: 'biz-1-4', text: 'Start a blog or social media account to practice', completed: false }
      ],
      phase2Tasks: [
        { id: 'biz-2-1', text: 'Learn SEO/SEM and content marketing strategies', completed: false },
        { id: 'biz-2-2', text: 'Get HubSpot or other marketing certifications', completed: false },
        { id: 'biz-2-3', text: 'Work on real marketing projects (freelance or personal)', completed: false },
        { id: 'biz-2-4', text: 'Build a portfolio of campaigns and results', completed: false }
      ],
      phase3Tasks: [
        { id: 'biz-3-1', text: 'Apply for marketing internships or coordinator roles', completed: false },
        { id: 'biz-3-2', text: 'Network with marketing professionals on LinkedIn', completed: false },
        { id: 'biz-3-3', text: 'Stay updated on marketing trends and tools', completed: false },
        { id: 'biz-3-4', text: 'Consider specialization (social, email, content, etc.)', completed: false }
      ]
    };
  }
  
  // Law
  else if (careerLower.includes('law') || careerLower.includes('lawyer')) {
    return {
      phase1Tasks: [
        { id: 'law-1-1', text: 'Excel in reading, writing, and critical thinking courses', completed: false },
        { id: 'law-1-2', text: 'Join debate or mock trial team', completed: false },
        { id: 'law-1-3', text: 'Intern at law firms or courts', completed: false },
        { id: 'law-1-4', text: 'Research law school requirements', completed: false }
      ],
      phase2Tasks: [
        { id: 'law-2-1', text: 'Prepare for and take LSAT', completed: false },
        { id: 'law-2-2', text: 'Apply to law schools', completed: false },
        { id: 'law-2-3', text: 'Gain legal experience through internships', completed: false },
        { id: 'law-2-4', text: 'Network with legal professionals', completed: false }
      ],
      phase3Tasks: [
        { id: 'law-3-1', text: 'Excel in law school coursework', completed: false },
        { id: 'law-3-2', text: 'Join law review or moot court', completed: false },
        { id: 'law-3-3', text: 'Secure summer associate positions', completed: false },
        { id: 'law-3-4', text: 'Prepare for bar exam', completed: false }
      ]
    };
  }
  
  // E-sports
  else if (careerLower.includes('esports') || careerLower.includes('gaming') || careerLower.includes('coach')) {
    return {
      phase1Tasks: [
        { id: 'esports-1-1', text: 'Achieve high rank in competitive games', completed: false },
        { id: 'esports-1-2', text: 'Study game strategy and professional matches', completed: false },
        { id: 'esports-1-3', text: 'Join amateur teams or tournaments', completed: false },
        { id: 'esports-1-4', text: 'Learn team communication and leadership', completed: false }
      ],
      phase2Tasks: [
        { id: 'esports-2-1', text: 'Coach amateur teams to gain experience', completed: false },
        { id: 'esports-2-2', text: 'Study sports psychology and team management', completed: false },
        { id: 'esports-2-3', text: 'Network in esports communities', completed: false },
        { id: 'esports-2-4', text: 'Create content about your gaming expertise', completed: false }
      ],
      phase3Tasks: [
        { id: 'esports-3-1', text: 'Apply for coaching positions with semi-pro teams', completed: false },
        { id: 'esports-3-2', text: 'Attend esports events and conferences', completed: false },
        { id: 'esports-3-3', text: 'Build a reputation in the scene', completed: false },
        { id: 'esports-3-4', text: 'Consider related roles (analyst, commentator, manager)', completed: false }
      ]
    };
  }
  
  // Professor/Education
  else if (careerLower.includes('professor') || careerLower.includes('teacher')) {
    return {
      phase1Tasks: [
        { id: 'edu-1-1', text: 'Excel in your chosen subject area', completed: false },
        { id: 'edu-1-2', text: 'Gain tutoring or teaching assistant experience', completed: false },
        { id: 'edu-1-3', text: 'Research graduate school requirements', completed: false },
        { id: 'edu-1-4', text: 'Develop strong communication skills', completed: false }
      ],
      phase2Tasks: [
        { id: 'edu-2-1', text: 'Pursue graduate degree in your field', completed: false },
        { id: 'edu-2-2', text: 'Gain teaching experience as TA', completed: false },
        { id: 'edu-2-3', text: 'Start research and publishing', completed: false },
        { id: 'edu-2-4', text: 'Network with faculty and attend conferences', completed: false }
      ],
      phase3Tasks: [
        { id: 'edu-3-1', text: 'Complete dissertation/doctoral research', completed: false },
        { id: 'edu-3-2', text: 'Publish in academic journals', completed: false },
        { id: 'edu-3-3', text: 'Apply for faculty positions', completed: false },
        { id: 'edu-3-4', text: 'Prepare teaching portfolio', completed: false }
      ]
    };
  }
  
  // Blockchain
  else if (careerLower.includes('blockchain') || careerLower.includes('crypto') || careerLower.includes('web3')) {
    return {
      phase1Tasks: [
        { id: 'block-1-1', text: 'Learn blockchain fundamentals and cryptography basics', completed: false },
        { id: 'block-1-2', text: 'Master Solidity or other smart contract languages', completed: false },
        { id: 'block-1-3', text: 'Build a simple dApp on testnet', completed: false },
        { id: 'block-1-4', text: 'Join Web3 communities and DAOs', completed: false }
      ],
      phase2Tasks: [
        { id: 'block-2-1', text: 'Learn Web3.js or Ethers.js for prototype frontend integration', completed: false },
        { id: 'block-2-2', text: 'Build more complex DeFi or NFT projects', completed: false },
        { id: 'block-2-3', text: 'Participate in hackathons', completed: false },
        { id: 'block-2-4', text: 'Get smart contract auditing experience', completed: false }
      ],
      phase3Tasks: [
        { id: 'block-3-1', text: 'Apply for blockchain developer roles', completed: false },
        { id: 'block-3-2', text: 'Contribute to open-source Web3 projects', completed: false },
        { id: 'block-3-3', text: 'Network at crypto conferences', completed: false },
        { id: 'block-3-4', text: 'Build a portfolio of deployed contracts', completed: false }
      ]
    };
  }
  
  // Architecture
  else if (careerLower.includes('architect') && !careerLower.includes('cloud') && !careerLower.includes('software')) {
    return {
      phase1Tasks: [
        { id: 'arch-1-1', text: 'Take art, physics, and math courses', completed: false },
        { id: 'arch-1-2', text: 'Learn design software (AutoCAD, SketchUp, Revit)', completed: false },
        { id: 'arch-1-3', text: 'Build a portfolio of design work', completed: false },
        { id: 'arch-1-4', text: 'Research architecture programs', completed: false }
      ],
      phase2Tasks: [
        { id: 'arch-2-1', text: 'Pursue accredited architecture degree (B.Arch or M.Arch)', completed: false },
        { id: 'arch-2-2', text: 'Complete architecture internships', completed: false },
        { id: 'arch-2-3', text: 'Study building codes and construction methods', completed: false },
        { id: 'arch-2-4', text: 'Develop a strong design portfolio', completed: false }
      ],
      phase3Tasks: [
        { id: 'arch-3-1', text: 'Complete Architectural Experience Program (AXP)', completed: false },
        { id: 'arch-3-2', text: 'Prepare for Architect Registration Examination (ARE)', completed: false },
        { id: 'arch-3-3', text: 'Network with architectural firms', completed: false },
        { id: 'arch-3-4', text: 'Consider specialization (sustainable, urban, interior)', completed: false }
      ]
    };
  }
  
  // Default for all other careers
  else {
    return {
      phase1Tasks: [
        { id: 'gen-1-1', text: `Research ${careerGoal} career requirements and qualifications`, completed: false },
        { id: 'gen-1-2', text: 'Identify 3-5 core skills needed and assess your current level', completed: false },
        { id: 'gen-1-3', text: `Take an introductory course about ${careerGoal}`, completed: false },
        { id: 'gen-1-4', text: 'Connect with 2 professionals in the field for informational interviews', completed: false }
      ],
      phase2Tasks: [
        { id: 'gen-2-1', text: `Develop a portfolio or project demonstrating ${careerGoal} skills`, completed: false },
        { id: 'gen-2-2', text: 'Complete intermediate-level training or certification', completed: false },
        { id: 'gen-2-3', text: 'Attend industry events, webinars, or conferences', completed: false },
        { id: 'gen-2-4', text: 'Start documenting your learning journey (blog, GitHub, portfolio)', completed: false }
      ],
      phase3Tasks: [
        { id: 'gen-3-1', text: 'Apply for relevant positions, internships, or freelance work', completed: false },
        { id: 'gen-3-2', text: 'Prepare comprehensive interview materials and practice sessions', completed: false },
        { id: 'gen-3-3', text: 'Optimize your resume, LinkedIn, and professional profiles', completed: false },
        { id: 'gen-3-4', text: 'Secure mentorship or coaching in your target field', completed: false }
      ]
    };
  }
};

const extractEducationLevelFromDetails = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  if (details.includes('high school') || details.includes('highschool')) return 'high_school';
  if (details.includes('undergraduate') || details.includes('bachelor') || details.includes('college')) return 'undergrad';
  if (details.includes('master') || details.includes('graduate')) return 'masters';
  if (details.includes('phd') || details.includes('doctorate')) return 'phd';
  if (details.includes('professional') || details.includes('working') || details.includes('employed')) return 'professional';
  return 'not_specified';
};

const generatePersonalizedActionPlanFromModel = async (
  careerGoal: string,
  userDetails: string
): Promise<GeneratePersonalizedActionPlanOutput> => {
  const extractedLevel = extractEducationLevelFromDetails(userDetails);
  
  const prompt = `Create a comprehensive, actionable 3-year plan for becoming a '${careerGoal}'.
  
User Profile: "${userDetails}"
Education Level: "${extractedLevel}"

**REQUIREMENTS:**
1. Tailor ALL content to ${extractedLevel} level
2. Include 3 phases with clear, motivational titles
3. Each phase must have 3-4 specific, actionable tasks
4. Tasks should be measurable and realistic
5. Use emojis and engaging language

**EDUCATION-LEVEL SPECIFIC GUIDANCE:**
${getEducationLevelPrompt(extractedLevel)}

**FORMAT (STRICT JSON - NO OTHER TEXT):**
{
  "careerTitle": "${careerGoal}",
  "educationLevel": "${extractedLevel}",
  "timeline": "3-Year Journey to ${careerGoal}",
  "phases": [
    {
      "title": "Phase 1: [Catchy Title with Emoji]",
      "duration": "Months 1-12",
      "tasks": [
        { "id": "task-1-1", "text": "Specific actionable task 1", "completed": false },
        { "id": "task-1-2", "text": "Specific actionable task 2", "completed": false },
        { "id": "task-1-3", "text": "Specific actionable task 3", "completed": false }
      ]
    },
    {
      "title": "Phase 2: [Catchy Title with Emoji]",
      "duration": "Year 2",
      "tasks": [
        { "id": "task-2-1", "text": "Specific actionable task 1", "completed": false },
        { "id": "task-2-2", "text": "Specific actionable task 2", "completed": false },
        { "id": "task-2-3", "text": "Specific actionable task 3", "completed": false }
      ]
    },
    {
      "title": "Phase 3: [Catchy Title with Emoji]",
      "duration": "Year 3",
      "tasks": [
        { "id": "task-3-1", "text": "Specific actionable task 1", "completed": false },
        { "id": "task-3-2", "text": "Specific actionable task 2", "completed": false },
        { "id": "task-3-3", "text": "Specific actionable task 3", "completed": false }
      ]
    }
  ]
}`;

  const response = await callModelScopeAI(prompt, 'qwen-max');

  if (response.startsWith('ERROR:')) {
    throw new Error(response);
  }

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.phases && parsed.phases.length >= 3) {
        return GeneratePersonalizedActionPlanOutputSchema.parse(parsed);
      } else {
        throw new Error('AI returned invalid plan structure');
      }
    } catch (e) {
      console.warn('Failed to parse AI response:', e);
      throw new Error('Invalid AI response format');
    }
  }

  throw new Error("Failed to parse AI response for action plan.");
};

// Helper function to extract education level from user details
const extractEducationLevel = (userDetails: string): string => {
  const details = userDetails.toLowerCase();
  
  if (details.includes('phd') || details.includes('doctorate')) return 'PhD';
  if (details.includes('master') || details.includes('graduate')) return 'Master\'s';
  if (details.includes('bachelor') || details.includes('undergrad') || details.includes('college')) return 'Undergraduate';
  if (details.includes('associate') || details.includes('diploma')) return 'Associate Degree';
  if (details.includes('high school') || details.includes('secondary')) return 'High School';
  if (details.includes('professional') || details.includes('working') || details.includes('employed')) return 'Professional';
  if (details.includes('student')) return 'Student';
  
  return 'Not Specified';
};

// Helper function to extract skills/interests from user details
const extractSkillsAndInterests = (userDetails: string): string[] => {
  const details = userDetails.toLowerCase();
  const skills: string[] = [];
  
  // Technical skills
  if (details.includes('programming') || details.includes('code') || details.includes('developer')) skills.push('Programming');
  if (details.includes('data') || details.includes('analysis') || details.includes('analytics')) skills.push('Data Analysis');
  if (details.includes('design') || details.includes('ui') || details.includes('ux')) skills.push('Design');
  if (details.includes('math') || details.includes('calculus') || details.includes('statistics')) skills.push('Mathematics');
  if (details.includes('science') || details.includes('physics') || details.includes('chemistry')) skills.push('Science');
  if (details.includes('business') || details.includes('marketing') || details.includes('finance')) skills.push('Business');
  if (details.includes('music') || details.includes('art') || details.includes('creative')) skills.push('Creative Arts');
  if (details.includes('writing') || details.includes('communication') || details.includes('content')) skills.push('Communication');
  if (details.includes('health') || details.includes('medical') || details.includes('nurse')) skills.push('Healthcare');
  if (details.includes('law') || details.includes('legal')) skills.push('Law');
  if (details.includes('sports') || details.includes('gaming')) skills.push('Sports/Gaming');
  
  return skills.length > 0 ? skills : ['General Skills'];
};

// Local plan generation function (to avoid dependency on external service)
const generateLocalActionPlan = (
  careerGoal: string,
  userDetails: string,
  educationLevel: string,
  skills: string[]
): GeneratePersonalizedActionPlanOutput => {
  // Base timeline based on education level
  let timeline = '3-Year Career Development Plan';
  let phaseTitle1 = 'Phase 1: Foundation & Exploration';
  let phaseTitle2 = 'Phase 2: Skill Development & Building';
  let phaseTitle3 = 'Phase 3: Career Entry & Advancement';
  let phaseDuration1 = 'Months 1-6';
  let phaseDuration2 = 'Months 7-18';
  let phaseDuration3 = 'Months 19-36';
  
  if (educationLevel === 'High School') {
    timeline = '4-Year University & Career Preparation Plan';
    phaseTitle1 = 'Phase 1: 🎓 High School Foundation';
    phaseTitle2 = 'Phase 2: 📚 University Years 1-2';
    phaseTitle3 = 'Phase 3: 🚀 University Years 3-4';
    phaseDuration1 = 'Grade 11/12';
    phaseDuration2 = 'Freshman/Sophomore Years';
    phaseDuration3 = 'Junior/Senior Years';
  } else if (educationLevel === 'Undergraduate') {
    timeline = '3-Year Undergraduate to Career Transition';
    phaseTitle1 = 'Phase 1: 📖 Core Coursework & Exploration';
    phaseTitle2 = 'Phase 2: 💼 Internships & Skill Building';
    phaseTitle3 = 'Phase 3: 🎯 Job Search & Career Launch';
    phaseDuration1 = 'Remaining Undergraduate';
    phaseDuration2 = 'Junior Year & Summer';
    phaseDuration3 = 'Senior Year & Post-Graduation';
  } else if (educationLevel === 'Master\'s') {
    timeline = '2-Year Master\'s to Specialization';
    phaseTitle1 = 'Phase 1: 🔬 Specialization & Research';
    phaseTitle2 = 'Phase 2: 🤝 Networking & Industry Connections';
    phaseTitle3 = 'Phase 3: 💼 Career Placement';
    phaseDuration1 = 'Year 1';
    phaseDuration2 = 'Summer & Year 2';
    phaseDuration3 = 'Graduation & Beyond';
  } else if (educationLevel === 'PhD') {
    timeline = 'PhD to Research Career';
    phaseTitle1 = 'Phase 1: 📝 Dissertation Research';
    phaseTitle2 = 'Phase 2: 📄 Publication & Conferences';
    phaseTitle3 = 'Phase 3: 🏛️ Job Market Preparation';
    phaseDuration1 = 'Years 1-2';
    phaseDuration2 = 'Years 3-4';
    phaseDuration3 = 'Years 5+';
  } else if (educationLevel === 'Professional') {
    timeline = '2-Year Career Advancement Plan';
    phaseTitle1 = 'Phase 1: 📊 Skill Gap Analysis';
    phaseTitle2 = 'Phase 2: 📈 Upskilling & Certifications';
    phaseTitle3 = 'Phase 3: 🚀 Career Transition/Advancement';
    phaseDuration1 = 'Next 6 Months';
    phaseDuration2 = 'Months 7-18';
    phaseDuration3 = 'Months 19-24';
  }
  
  // Get career-specific tasks
  const careerLower = careerGoal.toLowerCase();
  const careerTasks = getCareerSpecificTasks(careerLower, careerGoal);
  
  return {
    careerTitle: careerGoal,
    educationLevel,
    timeline: `${timeline} for ${careerGoal}`,
    phases: [
      {
        title: phaseTitle1,
        duration: phaseDuration1,
        tasks: careerTasks.phase1Tasks
      },
      {
        title: phaseTitle2,
        duration: phaseDuration2,
        tasks: careerTasks.phase2Tasks
      },
      {
        title: phaseTitle3,
        duration: phaseDuration3,
        tasks: careerTasks.phase3Tasks
      }
    ],
    generatedAt: new Date().toISOString(),
    success: true
  };
};

export async function generatePersonalizedActionPlan(
  input: GeneratePersonalizedActionPlanInput
): Promise<GeneratePersonalizedActionPlanOutput> {
  try {
    // Validate input
    const validatedInput = GeneratePersonalizedActionPlanInputSchema.parse(input);
    
    // Extract education level and skills locally
    const educationLevel = extractEducationLevel(validatedInput.userDetails);
    const skills = extractSkillsAndInterests(validatedInput.userDetails);
    
    let plan: GeneratePersonalizedActionPlanOutput;
    
    // Try AI generation first if enabled
    if (validatedInput.useAIFallback) {
      try {
        console.log('Attempting AI plan generation...');
        const aiPlan = await generatePersonalizedActionPlanFromModel(
          validatedInput.careerGoal, 
          validatedInput.userDetails
        );
        
        // Validate AI plan structure
        if (aiPlan && aiPlan.phases && aiPlan.phases.length >= 2) {
          plan = {
            ...aiPlan,
            educationLevel: aiPlan.educationLevel || educationLevel,
            generatedAt: new Date().toISOString(),
            success: true
          };
          console.log('✅ AI plan generation successful');
        } else {
          throw new Error('AI plan structure invalid');
        }
      } catch (aiError) {
        console.warn('⚠️ AI plan generation failed, using local generation:', aiError);
        // Fall back to local generation
        plan = generateLocalActionPlan(
          validatedInput.careerGoal,
          validatedInput.userDetails,
          educationLevel,
          skills
        );
      }
    } else {
      // Use local generation directly
      plan = generateLocalActionPlan(
        validatedInput.careerGoal,
        validatedInput.userDetails,
        educationLevel,
        skills
      );
    }
    
    // Ensure all tasks have unique IDs and are properly formatted
    plan.phases.forEach((phase, phaseIndex) => {
      phase.tasks.forEach((task, taskIndex) => {
        // Generate consistent IDs if missing or invalid
        if (!task.id || task.id.includes('undefined') || task.id.includes('null')) {
          task.id = `phase-${phaseIndex + 1}-task-${taskIndex + 1}-${Date.now().toString().slice(-4)}`;
        }
        // Ensure completed is boolean
        task.completed = task.completed === true;
      });
    });
    
    // Validate and return the final plan
    return GeneratePersonalizedActionPlanOutputSchema.parse({
      ...plan,
      success: true
    });
    
  } catch (error) {
    console.error('❌ Error generating personalized action plan:', error);
    
    // Emergency fallback - always returns a valid plan
    const emergencyPlan: GeneratePersonalizedActionPlanOutput = {
      careerTitle: input.careerGoal || 'Your Career Goal',
      educationLevel: 'Not Specified',
      timeline: 'Career Development Journey',
      phases: [
        {
          title: '🚀 Getting Started',
          duration: 'Immediate (First 3 Months)',
          tasks: [
            { id: `emergency-1-${Date.now()}`, text: `Research ${input.careerGoal || 'your chosen career'} requirements, salary, and job market`, completed: false },
            { id: `emergency-2-${Date.now()}`, text: 'Identify 3 core skills needed and find resources to learn them', completed: false },
            { id: `emergency-3-${Date.now()}`, text: 'Connect with 2 professionals in the field on LinkedIn', completed: false }
          ]
        },
        {
          title: '📚 Building Skills',
          duration: 'Next 3-9 Months',
          tasks: [
            { id: `emergency-4-${Date.now()}`, text: 'Complete an online course or certification in your target field', completed: false },
            { id: `emergency-5-${Date.now()}`, text: 'Build a project to practice your new skills', completed: false },
            { id: `emergency-6-${Date.now()}`, text: 'Update your resume and LinkedIn profile', completed: false }
          ]
        },
        {
          title: '💼 Career Launch',
          duration: '9-18 Months',
          tasks: [
            { id: `emergency-7-${Date.now()}`, text: 'Apply for relevant positions or freelance opportunities', completed: false },
            { id: `emergency-8-${Date.now()}`, text: 'Prepare for interviews and practice your pitch', completed: false },
            { id: `emergency-9-${Date.now()}`, text: 'Network at industry events or online communities', completed: false }
          ]
        }
      ],
      generatedAt: new Date().toISOString(),
      success: false
    };
    
    return GeneratePersonalizedActionPlanOutputSchema.parse(emergencyPlan);
  }
}
