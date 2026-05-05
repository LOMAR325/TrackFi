import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(4, "Password must contain at least 4 characters"),
});

export const transactionSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().trim().min(1, "Category is required"),
  date: z.string().trim().min(1, "Date is required"),
  description: z.string().trim().min(1, "Note is required").default("New transaction"),
  type: z.enum(["income", "expense"]),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required"),
});

export const goalSchema = z.object({
  current: z.coerce.number().min(0, "Current amount cannot be negative"),
  name: z.string().trim().min(1, "Goal name is required"),
  target: z.coerce.number().positive("Target amount must be greater than 0"),
});

export const contributionSchema = z.object({
  amount: z.coerce.number().positive("Contribution must be greater than 0"),
});

export const settingsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  name: z.string().trim().min(1, "Name is required"),
  theme: z.enum(["light", "dark"]),
});

export const passwordSchema = z.object({
  password: z.string().min(4, "Password must contain at least 4 characters"),
});

export function getValidationMessage(error: z.ZodError) {
  return error.issues[0]?.message ?? "Please check the form fields";
}
