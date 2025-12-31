"use client";

import React, { useEffect } from "react";
import { Loader2 } from "lucide-react";

export default function LoadingScreen() {
  useEffect(() => {
    // Disable scrolling while loading
    document.body.style.overflow = "hidden";

    // Cleanup to re-enable scrolling after loading
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-[#0A0A0A] flex items-center justify-center z-50">
      <div className="flex items-center gap-2 text-yellow-400">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span>Loading...</span>
      </div>
    </div>
  );
}
