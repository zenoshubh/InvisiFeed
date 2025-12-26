import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";
import { Suspense } from "react";
import LoadingScreen from "@/components/common/loading-screen";

export const metadata = {
  title: "Dashboard - InvisiFeed",
};

export default function BusinessLayout({ children }) {
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
