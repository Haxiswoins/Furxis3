
'use server';
/**
 * @fileOverview An email sending utility.
 *
 * - sendEmail - A function that handles sending emails.
 * - EmailPayload - The input type for the sendEmail function.
 */

import { z } from 'zod';
import { Resend } from 'resend';

const EmailPayloadSchema = z.object({
  to: z.string().email().describe('The recipient email address.'),
  from: z.string().email().describe('The sender email address. Must be a verified domain on Resend.'),
  subject: z.string().describe('The subject of the email.'),
  html: z.string().describe('The HTML content of the email.'),
});
export type EmailPayload = z.infer<typeof EmailPayloadSchema>;


export async function sendEmail(payload: EmailPayload): Promise<void> {
    // Validate payload with Zod
    const validatedPayload = EmailPayloadSchema.parse(payload);
    
    // Ensure the API key is available
    if (!process.env.RESEND_API_KEY) {
        console.error("Resend API Key is not configured. Cannot send email.");
        // Throw an error to make the calling function aware of the failure.
        throw new Error("Resend API Key is not configured.");
    }
    
    const resend = new Resend(process.env.RESEND_API_KEY);

    try {
      await resend.emails.send({
        from: validatedPayload.from,
        to: validatedPayload.to,
        subject: validatedPayload.subject,
        html: validatedPayload.html,
      });
      console.log(`Email sent successfully to ${validatedPayload.to}`);
    } catch (error) {
      console.error("Failed to send email:", error);
      // Re-throw the error to allow the caller to handle it
      throw error;
    }
}
