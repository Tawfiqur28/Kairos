// src/ai/flows/generate-personalized-action-plan.ts
'use server';
/**
 * @fileOverview Generates a 3-year personalized action plan for career goals.
 *
 * - generatePersonalizedActionPlan - A function that generates the personalized action plan.
 * - GeneratePersonalizedActionPlanInput - The input type for the generatePersonalizedActionPlan function.
 * - GeneratePersonalizedActionPlanOutput - The return type for the generatePersonalizedActionPlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
  return generatePersonalizedActionPlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePersonalizedActionPlanPrompt',
  input: {schema: GeneratePersonalizedActionPlanInputSchema},
  output: {schema: GeneratePersonalizedActionPlanOutputSchema},
  prompt: `You are a career coach who specializes in creating personalized action plans.

  Based on the user's career goal and details, create a detailed 3-year action plan with specific, actionable steps.

  Present the plan as a timeline or checklist.

  Career Goal: {{{careerGoal}}}
  User Details: {{{userDetails}}}`,
});

const generatePersonalizedActionPlanFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedActionPlanFlow',
    inputSchema: GeneratePersonalizedActionPlanInputSchema,
    outputSchema: GeneratePersonalizedActionPlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
