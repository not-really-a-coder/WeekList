'use server';

/**
 * @fileOverview This file contains the Genkit flow for suggesting tasks based on user history.
 *
 * - suggestTasks - A function that suggests tasks based on past completed tasks and current incomplete tasks.
 * - SuggestTasksInput - The input type for the suggestTasks function.
 * - SuggestTasksOutput - The return type for the suggestTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTasksInputSchema = z.object({
  completedTasks: z
    .array(z.string())
    .describe('A list of tasks the user has completed in the past.'),
  incompleteTasks: z
    .array(z.string())
    .describe('A list of tasks the user has not yet completed.'),
});
export type SuggestTasksInput = z.infer<typeof SuggestTasksInputSchema>;

const SuggestTasksOutputSchema = z.object({
  suggestedTasks: z
    .array(z.string())
    .describe('A list of tasks suggested by the AI.'),
});
export type SuggestTasksOutput = z.infer<typeof SuggestTasksOutputSchema>;

export async function suggestTasks(input: SuggestTasksInput): Promise<SuggestTasksOutput> {
  return suggestTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTasksPrompt',
  input: {schema: SuggestTasksInputSchema},
  output: {schema: SuggestTasksOutputSchema},
  prompt: `You are a personal task management assistant. Based on the user's completed tasks and incomplete tasks, suggest new tasks for the user to do this week.

Completed Tasks:
{{#each completedTasks}}- {{this}}\n{{/each}}

Incomplete Tasks:
{{#each incompleteTasks}}- {{this}}\n{{/each}}

Suggested Tasks:`, // No newline at the end
});

const suggestTasksFlow = ai.defineFlow(
  {
    name: 'suggestTasksFlow',
    inputSchema: SuggestTasksInputSchema,
    outputSchema: SuggestTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
