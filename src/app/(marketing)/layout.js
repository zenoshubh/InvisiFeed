import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export const metadata = {
  title: "InvisiFeed - Marketing",
};

export default function MarketingLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <Navbar />
      <main>{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
