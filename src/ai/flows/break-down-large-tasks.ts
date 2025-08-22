'use server';
/**
 * @fileOverview AI flow to break down large tasks into smaller, manageable sub-tasks.
 *
 * - breakDownTask - Function to break down a large task into sub-tasks.
 * - BreakDownTaskInput - Input type for the breakDownTask function.
 * - BreakDownTaskOutput - Return type for the breakDownTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const BreakDownTaskInputSchema = z.object({
  task: z.string().describe('The large task to break down.'),
  previousCompletions: z.string().optional().describe('The user\'s previous task completions, useful for learning user habits.'),
});
export type BreakDownTaskInput = z.infer<typeof BreakDownTaskInputSchema>;

const BreakDownTaskOutputSchema = z.object({
  subTasks: z.array(z.string()).describe('An array of sub-tasks for the given task.'),
});
export type BreakDownTaskOutput = z.infer<typeof BreakDownTaskOutputSchema>;

export async function breakDownTask(input: BreakDownTaskInput): Promise<BreakDownTaskOutput> {
  return breakDownTaskFlow(input);
}

const prompt = ai.definePrompt({
  name: 'breakDownTaskPrompt',
  input: {schema: BreakDownTaskInputSchema},
  output: {schema: BreakDownTaskOutputSchema},
  prompt: `You are a task management assistant. Your goal is to break down large tasks into smaller, more manageable sub-tasks.

Task: {{{task}}}

{% if previousCompletions %}
Based on the user's previous task completions:
{{previousCompletions}}
Consider breaking down the task in a similar way.
{% endif %}

Break down the task into an array of sub-tasks:
`,
});

const breakDownTaskFlow = ai.defineFlow(
  {
    name: 'breakDownTaskFlow',
    inputSchema: BreakDownTaskInputSchema,
    outputSchema: BreakDownTaskOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
