export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: parseInt(process.env.SESSION_MAX_AGE || "2592000"), // 30 days
    updateAge: parseInt(process.env.SESSION_UPDATE_AGE || "86400"), // 24 hours
  },

  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Performance optimizations
  experimental: {
    enableWebAuthn: false, // Disable if not using
  },

  // Security configurations
  cookies: {
    sessionToken: {
      name:
        process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
