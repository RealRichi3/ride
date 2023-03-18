import * as z from 'zod';

const passwordSchema = z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(100, 'Password cannot be longer than 100 characters')
    .regex(/[A-Za-z0-9!@#$%^&*()_+=\-[\]{};':"\\|,.<>/?]+/, {
        message: 'Password must contain at least one special character',
    })
    .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
    .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
    .regex(/[0-9]/, { message: 'Password must contain at least one digit' });

export const userSignup = z.object({
    email: z.string().email(),
    firstname: z.string(),
    lastname: z.string(),
    password: passwordSchema,
    role: z.enum(['EndUser', 'Admin', 'SuperAdmin']),
});

export const resendVerificationEmail = z.object({
    email: z.string().email(),
});

export const verifyUserEmail = z.object({
    verification_code: z.number(),
});

export const EmailType = z.string().email();

export type PasswordType = z.infer<typeof passwordSchema>;
