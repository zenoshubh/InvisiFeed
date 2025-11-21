import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import MobileNav from "@/components/mobile-nav";

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
