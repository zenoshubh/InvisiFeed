"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "motion/react";
import UserNav from "../user-nav";

export default function NavbarClient({ children }) {
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
    <div>
      {/* Client-only logic (dropdowns, mobile nav, etc.) */}
      {children}
    </div>
  );
}
