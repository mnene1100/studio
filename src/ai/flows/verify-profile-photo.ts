
'use server';
/**
 * @fileOverview An AI agent that compares a profile picture with a live capture for verification.
 *
 * - verifyProfilePhoto - A function that handles the comparison process.
 * - VerifyProfileInput - The input type for the verification.
 * - VerifyProfileOutput - The return type for the verification.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyProfileInputSchema = z.object({
  profilePhotoDataUri: z.string().describe("The user's existing profile picture URL or data URI."),
  livePhotoDataUri: z.string().describe("The live photo captured for verification as a data URI."),
});
export type VerifyProfileInput = z.infer<typeof VerifyProfileInputSchema>;

const VerifyProfileOutputSchema = z.object({
  isMatch: z.boolean().describe('Whether the person in both photos is the same.'),
  confidence: z.number().describe('Confidence score from 0 to 1.'),
  reasoning: z.string().describe('Brief explanation of the comparison result.'),
});
export type VerifyProfileOutput = z.infer<typeof VerifyProfileOutputSchema>;

export async function verifyProfilePhoto(input: VerifyProfileInput): Promise<VerifyProfileOutput> {
  return verifyProfilePhotoFlow(input);
}

const verifyProfilePhotoPrompt = ai.definePrompt({
  name: 'verifyProfilePhotoPrompt',
  input: {schema: VerifyProfileInputSchema},
  output: {schema: VerifyProfileOutputSchema},
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are an expert identity verification assistant. 
Compare the person in these two photos and determine if they are the same individual.

Photo 1 (Profile Picture): {{media url=profilePhotoDataUri}}
Photo 2 (Live Capture): {{media url=livePhotoDataUri}}

Instructions:
1. Analyze facial structure, features (eyes, nose, mouth), and distinctive marks.
2. Ignore differences in lighting, background, clothing, or horizontal flipping.
3. If both photos clearly show the same person, set isMatch to true.
4. If they are different people, or one image is not a clear human face, set isMatch to false.
5. Provide a brief explanation for your decision in the reasoning field.`,
});

const verifyProfilePhotoFlow = ai.defineFlow(
  {
    name: 'verifyProfilePhotoFlow',
    inputSchema: VerifyProfileInputSchema,
    outputSchema: VerifyProfileOutputSchema,
  },
  async (input) => {
    try {
      // Explicitly using the model reference to avoid v1beta 404s
      const {output} = await verifyProfilePhotoPrompt(input);
      if (!output) throw new Error('AI failed to produce a response');
      return output;
    } catch (error: any) {
      console.error('Verification Flow Error:', error);
      
      // If still getting 404, the API might be rejecting the model name format
      // Return a safe failure object that the UI can display nicely
      return {
        isMatch: false,
        confidence: 0,
        reasoning: `The AI service reported an error: ${error.message || 'Model connection failed.'}. Please check your API key and region settings.`
      };
    }
  }
);
