import { providers } from "@/lib/auth/providers";
import { authCallbacks } from "@/lib/auth/callbacks";
import { authConfig } from "@/lib/auth/config";

export const authOptions = {
  providers,
  callbacks: authCallbacks,
  ...authConfig,
};

