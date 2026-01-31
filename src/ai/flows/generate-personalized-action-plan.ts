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
  actionPlan: z.string().describe('A detailed 3-year action plan.'),
});
export type GeneratePersonalizedActionPlanOutput = z.infer<
  typeof GeneratePersonalizedActionPlanOutputSchema
>;

export async function generatePersonalizedActionPlan(
  input: GeneratePersonalizedActionPlanInput
): Promise<GeneratePersonalizedActionPlanOutput> {
  const planText = await generatePersonalizedActionPlanFromModel(input.careerGoal, input.userDetails);
  return { actionPlan: planText };
}
