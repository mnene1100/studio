'use server';
/**
 * @fileOverview An AI conversation assistant that suggests relevant conversation starters based on chat history.
 *
 * - aiSuggestedConversationStarters - A function that handles the generation of conversation starters.
 * - ChatHistoryInput - The input type for the aiSuggestedConversationStarters function.
 * - ConversationStartersOutput - The return type for the aiSuggestedConversationStarters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatHistoryInputSchema = z.object({
  chatHistory: z.array(
    z.object({
      sender: z.string().describe('The name of the sender of the message.'),
      message: z.string().describe('The content of the message.'),
    })
  ).describe('A list of past chat messages between the user and a contact.'),
});
export type ChatHistoryInput = z.infer<typeof ChatHistoryInputSchema>;

const ConversationStartersOutputSchema = z.object({
  suggestions: z.array(z.string().describe('A relevant conversation starter.')).describe('A list of suggested conversation starters.'),
});
export type ConversationStartersOutput = z.infer<typeof ConversationStartersOutputSchema>;

export async function aiSuggestedConversationStarters(input: ChatHistoryInput): Promise<ConversationStartersOutput> {
  return suggestConversationStartersFlow(input);
}

const suggestConversationStartersPrompt = ai.definePrompt({
  name: 'suggestConversationStartersPrompt',
  input: {schema: ChatHistoryInputSchema},
  output: {schema: ConversationStartersOutputSchema},
  prompt: `You are an AI conversation assistant. Your goal is to help the user initiate new and engaging conversations with their contacts.

Analyze the provided chat history to suggest relevant, interesting, and engaging conversation starters. The suggestions should feel natural and be based on topics or events previously discussed.

Provide 3-5 distinct conversation starters.

Chat History:
{{#each chatHistory}}
  {{{sender}}}: {{{message}}}
{{/each}}

Conversation Starters:`,
});

const suggestConversationStartersFlow = ai.defineFlow(
  {
    name: 'suggestConversationStartersFlow',
    inputSchema: ChatHistoryInputSchema,
    outputSchema: ConversationStartersOutputSchema,
  },
  async input => {
    const {output} = await suggestConversationStartersPrompt(input);
    return output!;
  }
);
