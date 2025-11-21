import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";

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
