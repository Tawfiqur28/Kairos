'use server';
/**
 * @fileOverview Generates a 3-year personalized action plan for career goals.
 *
 * - generatePersonalizedActionPlan - A function that generates the personalized action plan.
 * - GeneratePersonalizedActionPlanInput - The input type for the generatePersonalizedActionPlan function.
 * - GeneratePersonalizedActionPlanOutput - The return type for the generatePersonalizedActionPlan function.
 */

import { z } from 'zod';
import { generatePersonalizedActionPlan as generatePersonalizedActionPlanFromModel } from '@/ai/genkit';

const GeneratePersonalizedActionPlanInputSchema = z.object({
  careerGoal: z.string().describe('The user\u0027s desired career goal.'),
  userDetails: z
    .string()
    .describe(
      'Details about the user, including their current education level, skills, and interests.'
    ),
});
export type GeneratePersonalizedActionPlanInput = z.infer<
  typeof GeneratePersonalizedActionPlanInputSchema
>;

const GeneratePersonalizedActionPlanOutputSchema = z.object({
  missionName: z.string().describe('The gamified mission name for the action plan.'),
  threeYearPlan: z.string().describe('The gamified 3-year action plan in HTML format.'),
  monthlyUpdates: z.array(z.string()).describe('A list of monthly field intelligence updates.'),
  spicyTips: z.array(z.string()).describe('A list of industry insider tips.'),
});
export type GeneratePersonalizedActionPlanOutput = z.infer<
  typeof GeneratePersonalizedActionPlanOutputSchema
>;

export async function generatePersonalizedActionPlan(
  input: GeneratePersonalizedActionPlanInput
): Promise<GeneratePersonalizedActionPlanOutput> {
  const plan = await generatePersonalizedActionPlanFromModel(input.careerGoal, input.userDetails);
  // The model function now returns the full object which matches our output schema
  return plan;
}
