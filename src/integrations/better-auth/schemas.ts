import { z } from "zod";

const signIn = z.object({
	email: z.email("Please enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUp = z.object({
	name: z.string().trim().min(1, "Name is required."),
	email: z.email("Please enter a valid email address."),
	password: z.string().min(8, "Password must be at least 8 characters."),
});

export const authSchema = {
	signIn,
	signUp,
};
