"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { motion } from "motion/react";
import { Loader2 } from "lucide-react";
import MobileLogo from "@/components/layout/mobile-logo";
import LoadingScreen from "@/components/common/loading-screen";
import Link from "next/link";
import { verifyUserAccount } from "@/actions/auth/registration";
import { useActionState } from "react";
import LeftSection from "@/components/auth/left-section";

const VerifyAccount = () => {
  const router = useRouter();
  const params = useParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);
  const [homeLoading, setHomeLoading] = useState(false);
  const pathname = usePathname();

  // Add useTransition hook
  const [isPendingTransition, startTransition] = useTransition();

  // Server Action Hook
  const verifyAction = async (prevState, formData) => {
    const code = otp.join("");

    if (code.length !== 6) {
      return { success: false, message: "Please enter a valid 6-digit code" };
    }

    const result = await verifyUserAccount(params.username, code);

    if (result.success) {
      toast.success(result.message);
      router.push("/sign-in");
    } else {
      toast.error(result.message);
    }

    return result;
  };

  const [state, formAction, isPending] = useActionState(verifyAction, null);

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Prevent multiple digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance to next input
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((digit, index) => {
        if (index < 6) newOtp[index] = digit;
      });
      setOtp(newOtp);
    }
  };

  // ✅ Updated submit handler with startTransition
  const onSubmit = (e) => {
    e.preventDefault();

    if (otp.join("").length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    const formData = new FormData();
    formData.append("code", otp.join(""));

    // ✅ Wrap formAction call in startTransition
    startTransition(() => {
      formAction(formData);
    });
  };

  const handleNavigation = (route) => {
    if (route === pathname) {
      return;
    }
    setHomeLoading(true);
  };

  useEffect(() => {
    return () => {
      setHomeLoading(false);
    };
  }, [pathname]);

  if (homeLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section with Gradient */}
      <LeftSection />

      {/* Right Section with Form */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-6 bg-[#0A0A0A]">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <MobileLogo />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md space-y-4"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Verify Your Account
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                Enter the verification code sent to your email
              </p>
              <p className="text-[10px] text-gray-400">
                [Kindly check your spam folder if you don't see it in your
                inbox]
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    className="w-12 h-12 text-center text-xl font-bold bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-2 border-yellow-400/10 focus:border-yellow-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20"
                    autoFocus={index === 0}
                  />
                ))}
              </div>
              <Button
                type="submit"
                disabled={
                  isPending || isPendingTransition || otp.join("").length !== 6
                }
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending || isPendingTransition ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Please wait
                  </>
                ) : (
                  "Verify Account"
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default VerifyAccount;
