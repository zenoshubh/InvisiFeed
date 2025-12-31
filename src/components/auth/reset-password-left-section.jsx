import React from "react";

export default function ResetPasswordLeftSection({ step }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
      <div className="max-w-md flex flex-col gap-4">
        <h1 className="text-4xl font-extrabold tracking-tight">InvisiFeed</h1>
        <p className="text-lg text-gray-200">
          {step === 1
            ? "Forgot your password? We'll help you reset it"
            : step === 2
            ? "Check your email for the reset link"
            : "Set your new password"}
        </p>
        <div className="flex flex-col gap-3 mt-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p>Secure password reset process</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p>Time-limited reset link</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p>Strong password requirements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
