import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { Suspense } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export const metadata = {
  title: "Dashboard - InvisiFeed",
};

export default function OwnerLayout({ children }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <div className="min-h-screen bg-[#0A0A0A]">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <MobileNav />
      </div>
    </Suspense>
  );
}
