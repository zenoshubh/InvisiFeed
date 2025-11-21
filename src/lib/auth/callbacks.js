import { handleGoogleSignIn } from "@/actions/auth/google-auth";

export const authCallbacks = {
  async signIn({ user, account, profile }) {
    if (account?.provider === "google") {
      try {
        const result = await handleGoogleSignIn(user, profile);

        if (!result.success) {
          return result.redirectUrl || false;
        }

        // Update user object with database info
        Object.assign(user, result.user);
        return true;
      } catch (error) {
        console.error("Google Sign-In Error:", error);
        return "/sign-in?error=GoogleSignInError";
      }
    }

    return true;
  },

  async jwt({ token, user, account, trigger, session }) {
    // Initial sign in
    if (user && account) {
      return {
        ...token,
        id: user.id,
        provider: account.provider,
        username: user.username,
        businessName: user.businessName,
        isProfileCompleted: user.isProfileCompleted || "pending",
        phoneNumber: user.phoneNumber,
        address: user.address,
        gstinDetails: user.gstinDetails,
        plan: user.plan,
        proTrialUsed: user.proTrialUsed,
      };
    }

    // Handle session updates
    if (trigger === "update" && session?.user) {
      return {
        ...token,
        isProfileCompleted: session.user.isProfileCompleted,
        businessName: session.user.businessName,
        gstinDetails: session.user.gstinDetails,
        phoneNumber: session.user.phoneNumber,
        address: session.user.address,
        plan: session.user.plan,
        proTrialUsed: session.user.proTrialUsed,
      };
    }

    return token;
  },

  async session({ session, token }) {
    if (token) {
      session.user = {
        ...session.user,
        id: token.id,
        username: token.username,
        businessName: token.businessName,
        isProfileCompleted: token.isProfileCompleted,
        gstinDetails: token.gstinDetails,
        phoneNumber: token.phoneNumber,
        address: token.address,
        plan: token.plan,
        proTrialUsed: token.proTrialUsed,
      };
    }
    return session;
  },

  async redirect({ url, baseUrl }) {
    // Handle dynamic redirects efficiently
    if (url.includes("/user")) {
      return url.startsWith("/") ? `${baseUrl}${url}` : url;
    }

    if (url.startsWith("/")) return `${baseUrl}${url}`;
    if (new URL(url).origin === baseUrl) return url;
    return baseUrl;
  },
};
