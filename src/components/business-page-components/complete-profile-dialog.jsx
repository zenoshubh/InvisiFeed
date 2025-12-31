"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { useSession } from "next-auth/react";
import LoadingScreen from "@/components/common/loading-screen";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CompleteProfileDialog({ open, onOpenChange }) {

  const { data: session } = useSession();
  const business = session?.user;
  const [loading,setLoading] = useState(false);

  const handleNavigation = (route) => {
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setLoading(true);
    
  };
  const pathname = usePathname();
  
  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [pathname]);
  
  if(loading) return <LoadingScreen />;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0A] border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white text-center">
            Complete Your Profile First
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-gray-400 text-center">
            You need to complete your profile before creating invoices. This helps us provide better service and maintain accurate records.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full"
          >
            <Link href={`/user/${business?.username}/update-profile`} onClick={() => handleNavigation(`/user/${business?.username}/update-profile`)}>
            <Button
              className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium"
            >
              Complete Profile
            </Button>
            </Link>
          </motion.div>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full bg-transparent hover:bg-yellow-400/10 text-yellow-400 border border-yellow-400/20"
          >
            I'll do it later
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
