"use client";
import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  Phone,
  MapPin,
  Github,
  Coffee,
} from "lucide-react";
import SocialMediaPopup from "./social-media-popup";
import LoadingScreen from "./loading-screen"; // Import the loading screen
import { usePathname } from "next/navigation";
import Link from "next/link";

function Footer() {
  const [isSocialMediaPopupOpen, setIsSocialMediaPopupOpen] = useState(false);
  const [selectedSocialMedia, setSelectedSocialMedia] = useState(null);
  const [loading, setLoading] = useState(false); // State to track loading
  const [currentPath, setCurrentPath] = useState(""); // Track current path
  const socialLinks = [
    {
      name: "github",
      icon: Github,
      onClick: () => {
        setSelectedSocialMedia("github");
        setIsSocialMediaPopupOpen(true);
      },
    },
    {
      name: "twitter",
      icon: Twitter,
      onClick: () => {
        setSelectedSocialMedia("twitter");
        setIsSocialMediaPopupOpen(true);
      },
    },
    {
      name: "linkedin",
      icon: Linkedin,
      onClick: () => {
        setSelectedSocialMedia("linkedin");
        setIsSocialMediaPopupOpen(true);
      },
    },
    {
      name : "bmc",
      icon: Coffee,
      onClick: () => {
        setSelectedSocialMedia("bmc");
        setIsSocialMediaPopupOpen(true);
      },
    }
  ];

  const pathname = usePathname();

  const handleNavigation = (route) => {
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setLoading(true);
  
  };
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <footer className="bg-[#0A0A0A] text-gray-300" id="contact">
        {/* Main Footer Content */}
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <Link
                href="/"
                onClick={() => handleNavigation("/")}
                className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent cursor-pointer"
              >
                InvisiFeed
              </Link>
              <p className="text-gray-400 text-sm leading-relaxed">
                Connecting people with invisible threads of care and connection.
                Empowering businesses with honest, anonymous feedback.
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-yellow-400">
                Quick Links
              </h4>
              <ul className="space-y-3">
                {[
                  { label: "Home", route: "/" },
                  { label: "Purpose", route: "/purpose" },
                  { label: "Guide", route: "/guide" },
                  { label: "Privacy Policy", route: "/privacy-policy" },
                  { label: "Terms of Service", route: "/terms-of-service" },
                ].map((link) => (
                  <Link
                    href={link.route}
                    key={link.label}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2 group cursor-pointer"
                    onClick={() => handleNavigation(link.route)}
                  >
                    <span className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-yellow-400">
                Contact Us
              </h4>
              <ul className="space-y-3">
                <li
                  className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-colors cursor-pointer"
                  onClick={() =>
                    (window.location.href = "mailto:invisifeed@gmail.com")
                  }
                >
                  <Mail className="h-4 w-4" />
                  <span>invisifeed@gmail.com</span>
                </li>
                <li className="flex items-center space-x-3 text-gray-400 hover:text-yellow-400 transition-colors">
                  <MapPin className="h-4 w-4" />
                  <span>India</span>
                </li>
              </ul>
            </motion.div>

            {/* Social Media */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-yellow-400">
                Follow Us
              </h4>
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.div
                    key={social.name}
                    whileHover={{ scale: 1.1 }}
                    className="p-2 bg-[#0A0A0A]/50 backdrop-blur-sm rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-[#0A0A0A]/70 transition-all duration-200 border border-yellow-400/10 cursor-pointer"
                    onClick={social.onClick}
                  >
                    <social.icon className="h-5 w-5" />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pb-15 md:pb-0 border-t border-yellow-400/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-500">
                © 2025 InvisiFeed. All rights reserved.
              </p>
              <div className="hidden md:flex space-x-6">
                {["/terms-of-service", "/privacy-policy"].map(
                  (route) => (
                    <Link
                      href={route}
                      key={route}
                      className="text-sm text-gray-500 hover:text-yellow-400 transition-colors cursor-pointer"
                      onClick={() => handleNavigation(route)}
                    >
                      {route === "/terms-of-service"
                        ? "Terms of Service"
                        : "Privacy Policy"}
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* LinkedIn Popup */}
        <SocialMediaPopup
          isOpen={isSocialMediaPopupOpen}
          onClose={() => setIsSocialMediaPopupOpen(false)}
          initialSocialMedia={selectedSocialMedia}
        />
      </footer>
    </>
  );
}

export default Footer;
