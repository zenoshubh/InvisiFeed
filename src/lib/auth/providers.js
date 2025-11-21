import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { signInUser } from "@/actions/auth/signin";
import { handleGoogleSignIn } from "@/actions/auth/google-auth";

export const credentialsProvider = CredentialsProvider({
  id: "credentials",
  name: "Credentials",
  credentials: {
    identifier: { label: "Email/Username", type: "text" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    if (!credentials?.identifier || !credentials?.password) {
      throw new Error("Email and password required");
    }

    try {
      const result = await signInUser(
        credentials.identifier,
        credentials.password
      );

      if (!result.success) {
        throw new Error(result.message);
      }

      return result.data?.user || result.user;
    } catch (error) {
      throw new Error(error.message);
    }
  },
});

export const googleProvider = GoogleProvider({
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
});

export const providers = [googleProvider, credentialsProvider];
