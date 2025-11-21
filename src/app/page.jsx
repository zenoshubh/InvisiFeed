import React from "react";

import HeroSection from "@/components/landing-page-components/HeroSection";
import HowItWorksSection from "@/components/landing-page-components/HowItWorksSection";
import FeaturesSection from "@/components/landing-page-components/FeaturesSection";
import DashboardShowcaseSection from "@/components/landing-page-components/DashboardShowcaseSection";
import BenefitsSection from "@/components/landing-page-components/BenefitsSection";
import SampleInvoiceSection from "@/components/landing-page-components/SampleInvoiceSection";
import ReviewInvisifeed from "@/components/landing-page-components/ReviewInvisifeed";
import SecuritySection from "@/components/landing-page-components/SecuritySection";

import FAQSection from "@/components/landing-page-components/FAQSection";
import CTASection from "@/components/landing-page-components/CTASection";
import GetStartedPopup from "@/components/landing-page-components/GetStartedPopup";
import ScrollToTop from "@/components/ScrollToTop";
import PricingSectionClient from "@/components/landing-page-components/PricingSectionClient";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";

export default function Home() {
  return (
    <>
      <main className="min-h-screen bg-[#0A0A0A] text-white overflow-x-hidden">
        <Navbar />
        <div className="relative">
          {/* Background gradient for the entire page */}
          <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50 z-[-1]" />

          {/* Content sections */}
          <div className="relative">
            <HeroSection />
            <HowItWorksSection />
            <FeaturesSection />
            <DashboardShowcaseSection />
            <BenefitsSection />
            <SampleInvoiceSection />
            <SecuritySection />
            <PricingSectionClient />
            <FAQSection />
            <CTASection />
            <ReviewInvisifeed />
          </div>
        </div>
        <GetStartedPopup />
        <ScrollToTop />
      </main>
      <Footer />
      <MobileNav />
    </>
  );
}
