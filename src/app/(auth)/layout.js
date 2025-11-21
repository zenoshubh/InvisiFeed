import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata = {
  title: "Authentication - InvisiFeed",
};

export default function AuthLayout({ children }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <main className="min-h-screen bg-[#0A0A0A]">{children}</main>
    </Suspense>
  );
}
