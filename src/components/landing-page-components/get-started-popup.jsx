"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const GetStartedPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [hasShown, setHasShown] = useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = useState(false);
  const [isSignInLoading, setIsSignInLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = useSession();
  const business = session?.user;

  // Reset hasShown when user returns to home page
  useEffect(() => {
    if (pathname === "/") {
      setHasShown(false);
      setIsRegisterLoading(false);
      setIsSignInLoading(false);
    }
  }, [pathname]);

  // Show popup after 5 seconds on home page
  useEffect(() => {
    let timeoutId;

    if (pathname === "/" && !hasShown && !business) {
      timeoutId = setTimeout(() => {
        setShowPopup(true);
        setHasShown(true);
      }, 5000);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [pathname, hasShown, business]);

  const handleRegister = () => {
    setIsRegisterLoading(true);
    router.push("/register");
  };

  const handleSignIn = () => {
    setIsSignInLoading(true);
    router.push("/sign-in");
  };

  // Don't render the popup if not on home page or if user is logged in
  if (pathname !== "/" || business) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPopup && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowPopup(false)}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm"
          >
            <div className="bg-[#0A0A0A] border border-yellow-400/20 rounded-xl shadow-lg shadow-yellow-500/10 p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
                  Get Started with InvisiFeed
                </h3>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-gray-400 mb-6">
                Join our community of businesses and start collecting authentic,
                anonymous feedback today.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleRegister}
                  disabled={isRegisterLoading}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer"
                >
                  {isRegisterLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading Register Page...
                    </>
                  ) : (
                    <>
                      Register Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleSignIn}
                  disabled={isSignInLoading}
                  variant="outline"
                  className="w-full border-yellow-400/20  hover:bg-gray-200 text-black cursor-pointer"
                >
                  {isSignInLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Loading Sign In Page...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GetStartedPopup;
