import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
import LoadingScreen from "@/components/common/loading-screen";
import Link from "next/link";

export const SubscriptionPopup = ({ isOpen, onClose }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleNavigation = (route) => {
    if (route === pathname) {
      onClose()
      return; // Same route, no loading screen
    }
    setLoading(true);
    onClose();
    
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
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center "
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#0A0A0A] border-yellow-400/40 border rounded-lg p-6 max-w-md w-full mx-4 relative text-yellow-400  bg-gradient-to-br   hover:from-yellow-400/10 transition-all"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-yellow-400 hover:text-yellow-300"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center flex flex-col gap-6">
              <div className="flex justify-center">
                <Lock className="h-12 w-12 text-yellow-400" />
              </div>

              <h3 className="text-xl font-semibold">Upgrade to Pro</h3>

              <p className="text-yellow-300 text-sm">
                Unlock premium features and take your experience to the next level!
              </p>

              <div className="pt-4">
                <Link href="/pricing" onClick={() => handleNavigation("/pricing")}>
                <Button
                  className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-full shadow-md hover:bg-yellow-500/80 focus:ring-2 focus:ring-yellow-300 transition duration-300 cursor-pointer"
                  
                >
                  View Pricing Plans
                </Button>
                </Link>
                
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
