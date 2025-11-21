"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import UserNav from "./user-nav";

function Navbar() {
  const { data: session, status } = useSession();
  const owner = session?.user;
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleNavigation = (route) => {
    if (route === pathname) return;
    router.push(route);
  };

  return (
    <nav className="p-4 md:p-6 bg-[#0A0A0A] text-white shadow-lg border-b border-yellow-400/10">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo/Brand Name */}
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <span className="text-2xl font-bold text-yellow-400 cursor-pointer">
            InvisiFeed
          </span>
        </Link>

        {/* Navigation Links - Desktop */}
        <div className="hidden md:flex space-x-6 absolute left-1/2 -translate-x-1/2">
          {pathname === "/" ||
          pathname === "/pricing" ||
          pathname === "/purpose" ||
          pathname === "/guide" ||
          pathname === "/privacy-policy" ||
          pathname === "/terms-of-service" ? (
            <>
              <Link
                href="/"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Home
              </Link>
              <Link
                href="/purpose"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Purpose
              </Link>
              <Link
                href="/guide"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Guide
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Pricing
              </Link>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Contact
              </motion.div>
            </>
          ) : owner ? (
            <>
              <Link
                href={`/user/${owner?.username}/generate`}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Generate
              </Link>
              <Link
                href={`/user/${owner?.username}/dashboard`}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Dashboard
              </Link>
              <Link
                href={`/user/${owner?.username}/feedbacks`}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Feedbacks
              </Link>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Contact
              </motion.div>
            </>
          ) : (
            // Default navigation for unauthenticated users
            <>
              <Link
                href="/"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Home
              </Link>
              <Link
                href="/purpose"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Purpose
              </Link>
              <Link
                href="/guide"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Guide
              </Link>
              <Link
                href="/pricing"
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Pricing
              </Link>
              <motion.div
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
              >
                Contact
              </motion.div>
            </>
          )}
        </div>

        {/* UserNav for both mobile and desktop */}
        <UserNav isMobile={isMobile} />
      </div>
    </nav>
  );
}

export default Navbar;
