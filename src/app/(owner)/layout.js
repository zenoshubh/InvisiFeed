import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";
import { Suspense } from "react";
import LoadingScreen from "@/components/loading-screen";

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
