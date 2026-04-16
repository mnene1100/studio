'use server';
/**
 * @fileOverview An AI agent that summarizes chat history.
 *
 * - summarizeChatHistory - A function that handles the chat history summarization process.
 * - SummarizeChatHistoryInput - The input type for the summarizeChatHistory function.
 * - SummarizeChatHistoryOutput - The return type for the summarizeChatHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatMessageSchema = z.object({
  sender: z.string().describe('The name or ID of the sender.'),
  message: z.string().describe('The content of the message.'),
  timestamp: z.string().optional().describe('Optional timestamp of the message.'),
});

const SummarizeChatHistoryInputSchema = z.object({
  chatHistory: z.array(ChatMessageSchema).describe('An array of chat messages in chronological order.'),
  contactName: z.string().describe('The name of the contact with whom the chat history is being summarized.'),
});
export type SummarizeChatHistoryInput = z.infer<typeof SummarizeChatHistoryInputSchema>;

const SummarizeChatHistoryOutputSchema = z.object({
  summary: z.string().describe('A concise summary of key topics and action items from the chat history.'),
});
export type SummarizeChatHistoryOutput = z.infer<typeof SummarizeChatHistoryOutputSchema>;

export async function summarizeChatHistory(input: SummarizeChatHistoryInput): Promise<SummarizeChatHistoryOutput> {
  return summarizeChatHistoryFlow(input);
}

const summarizeChatHistoryPrompt = ai.definePrompt({
  name: 'summarizeChatHistoryPrompt',
  input: {schema: SummarizeChatHistoryInputSchema},
  output: {schema: SummarizeChatHistoryOutputSchema},
  prompt: `You are an AI conversation assistant. Analyze the following chat history with '{{{contactName}}}' and provide a concise summary of key topics and any identified action items.

Chat History:
{{#each chatHistory}}
{{{this.sender}}}: {{{this.message}}}
{{/each}}

Focus on extracting the most important details and potential next steps. The summary should be easy to read and understand quickly.`,
});

const summarizeChatHistoryFlow = ai.defineFlow(
  {
    name: 'summarizeChatHistoryFlow',
    inputSchema: SummarizeChatHistoryInputSchema,
    outputSchema: SummarizeChatHistoryOutputSchema,
  },
  async (input) => {
    const {output} = await summarizeChatHistoryPrompt(input);
    return output!;
  }
);
