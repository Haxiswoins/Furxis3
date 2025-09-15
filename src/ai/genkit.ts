
'use server';
/**
 * @fileOverview Genkit AI configuration.
 *
 * IMPORTANT FOR DEPLOYMENT IN MAINLAND CHINA:
 * This file configures the application to use Google's Gemini AI models via the @genkit-ai/googleai plugin.
 * Google's APIs (including generativelanguage.googleapis.com) are generally inaccessible from mainland China
 * without a proxy or a similar network solution.
 *
 * Currently, no active feature in the application calls these AI functions, so it will not cause runtime
 * errors. However, if you plan to build AI-powered features in the future, you must ensure that your
 * server environment has the ability to connect to Google's services.
 *
 * This file is pre-configured to facilitate future AI integrations.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [
    googleAI({
      // The API key is usually picked up from the GOOGLE_API_KEY or GOOGLE_GENAI_API_KEY environment variables.
    }),
  ],
});
