import { z } from 'zod';
import { VALIDATION_RULES } from './constants';

// Inquiry form validation schema
export const inquiryFormSchema = z.object({
  name: z
    .string()
    .min(VALIDATION_RULES.NAME.MIN, `Name must be at least ${VALIDATION_RULES.NAME.MIN} characters`)
    .max(VALIDATION_RULES.NAME.MAX, `Name must be at most ${VALIDATION_RULES.NAME.MAX} characters`),
  email: z
    .string()
    .email('Please enter a valid email address'),
  subject: z
    .string()
    .max(VALIDATION_RULES.SUBJECT.MAX, `Subject must be at most ${VALIDATION_RULES.SUBJECT.MAX} characters`)
    .optional(),
  message: z
    .string()
    .min(VALIDATION_RULES.MESSAGE.MIN, `Message must be at least ${VALIDATION_RULES.MESSAGE.MIN} characters`)
    .max(VALIDATION_RULES.MESSAGE.MAX, `Message must be at most ${VALIDATION_RULES.MESSAGE.MAX} characters`),
  inquiryCategoryId: z.number().optional(), // UI-friendly field
});

export type InquiryFormValues = z.infer<typeof inquiryFormSchema>;

// Reply form validation schema
export const replyFormSchema = z.object({
  reply: z.string().min(1, 'Reply cannot be empty'),
});

export type ReplyFormValues = z.infer<typeof replyFormSchema>;
