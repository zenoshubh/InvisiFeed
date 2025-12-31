import React from "react";

import HeroSection from "@/components/landing-page-components/hero-section";
import HowItWorksSection from "@/components/landing-page-components/how-it-works-section";
import FeaturesSection from "@/components/landing-page-components/features-section";
import DashboardShowcaseSection from "@/components/landing-page-components/dashboard-showcase-section";
import BenefitsSection from "@/components/landing-page-components/benefits-section";
import SampleInvoiceSection from "@/components/landing-page-components/sample-invoice-section";
import ReviewInvisifeed from "@/components/landing-page-components/review-invisifeed";
import SecuritySection from "@/components/landing-page-components/security-section";

import FAQSection from "@/components/landing-page-components/faq-section";
import CTASection from "@/components/landing-page-components/cta-section";
import GetStartedPopup from "@/components/landing-page-components/get-started-popup";
import ScrollToTop from "@/components/common/scroll-to-top";
import PricingSectionClient from "@/components/landing-page-components/pricing-section-client";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import MobileNav from "@/components/layout/mobile-nav";

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
