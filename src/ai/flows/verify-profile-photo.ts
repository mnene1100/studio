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
  profilePhotoDataUri: z.string().describe("The user's existing profile picture as a data URI."),
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
  prompt: `You are an expert identity verification assistant. 
Compare the person in these two photos. 

Photo 1 (Profile Picture): {{media url=profilePhotoDataUri}}
Photo 2 (Live Capture): {{media url=livePhotoDataUri}}

Determine if they represent the same individual. Focus on facial features, bone structure, and distinctive marks. 
Ignore differences in lighting, background, clothing, or minor aging.

If both photos clearly show the same person, set isMatch to true.
If the photos show different people, or if one photo is not a clear human face, set isMatch to false.`,
});

const verifyProfilePhotoFlow = ai.defineFlow(
  {
    name: 'verifyProfilePhotoFlow',
    inputSchema: VerifyProfileInputSchema,
    outputSchema: VerifyProfileOutputSchema,
  },
  async (input) => {
    const {output} = await verifyProfilePhotoPrompt(input);
    return output!;
  }
);
