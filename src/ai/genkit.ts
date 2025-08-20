
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

// This file is currently not being used by any active feature
// but is kept for potential future AI integrations.
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.0-flash',
});
