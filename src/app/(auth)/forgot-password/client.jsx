"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import * as z from "zod";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import MobileLogo from "@/components/MobileLogo";
import ResetPasswordLeftSection from "@/components/auth/ResetPasswordLeftSection";
import {
  sendPasswordResetEmail,
  resetUserPassword,
} from "@/actions/auth/password-management";
// Validation schemas for each step
const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number and one special character"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Check for reset token in URL
  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setStep(3);
    }
  }, [searchParams]);

  // Email form setup
  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: "",
    },
  });

  // Password form setup
  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle email submission
  const onEmailSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await sendPasswordResetEmail(data.email);
      if (response?.success) {
        setStep(2);
        toast.success("Reset link sent to your email");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle password reset
  const onPasswordSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const token = searchParams.get("token");
      const response = await resetUserPassword(token, data.password);
      if (response?.success) {
        toast.success("Password reset successfully");
        router.push("/sign-in");
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Section with Gradient */}
      <ResetPasswordLeftSection step={step} />

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
            {/* Step Indicator */}
            <div className="flex justify-center space-x-4 mb-8">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                1
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                2
              </div>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 3
                    ? "bg-yellow-400 text-gray-900"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                3
              </div>
            </div>

            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {step === 1
                  ? "Forgot Password"
                  : step === 2
                  ? "Check Your Email"
                  : "Reset Password"}
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                {step === 1
                  ? "Enter your email to receive a reset link"
                  : step === 2
                  ? "We've sent a reset link to your email"
                  : "Enter your new password"}
              </p>
            </div>

            {/* Step 1: Email Form */}
            {step === 1 && (
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onEmailSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="email"
                    control={emailForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="Enter your email"
                            {...field}
                            className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            {/* Step 2: Email Sent Confirmation */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 text-yellow-400 text-sm">
                  <p>
                    We've sent a password reset link to your email address. The
                    link will expire in 1 hour.
                  </p>
                </div>
                <Button
                  onClick={() => setStep(1)}
                  className="w-full bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 hover:bg-[#0A0A0A]/70 h-9"
                >
                  Back to Email
                </Button>
              </div>
            )}

            {/* Step 3: New Password Form */}
            {step === 3 && (
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    name="password"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="New password"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    name="confirmPassword"
                    control={passwordForm.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              {...field}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Resetting...
                      </>
                    ) : (
                      "Reset Password"
                    )}
                  </Button>
                </form>
              </Form>
            )}

            <div className="text-center mt-4">
              <p className="text-gray-400 text-sm">
                Remember your password?{" "}
                <button
                  onClick={() => {
                    setIsNavigatingToSignIn(true);
                    router.push("/sign-in");
                  }}
                  disabled={isNavigatingToSignIn}
                  className={`font-medium cursor-pointer text-yellow-400 hover:text-yellow-300 transition-colors`}
                >
                  {isNavigatingToSignIn ? "Loading..." : "Sign In"}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
