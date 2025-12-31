"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { verifyGSTIN, saveGSTIN } from "@/actions/gstin";

export default function GSTINVerificationDialog({ open, onOpenChange }) {
  const [gstinNumber, setGstinNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { data: session, update } = useSession();

  const handleVerify = async () => {
    if (!gstinNumber) {
      toast.error("Please enter GSTIN number");
      return;
    }
    setIsLoading(true);
    try {
      const result = await verifyGSTIN(gstinNumber);

      if (!result.success || !result.valid) {
        setVerificationResult({ valid: false, message: result.message });
      } else {
        setVerificationResult({
          valid: true,
          tradeName: result.tradeName,
          taxpayerInfo: result.taxpayerInfo,
        });
      }
    } catch (error) {
      toast.error("Error verifying GSTIN");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!verificationResult?.valid) return;
    setIsLoading(true);
    try {
      const result = await saveGSTIN(
        gstinNumber,
        verificationResult.taxpayerInfo
      );
      if (result.success) {
        toast.success("GSTIN verified successfully");
        await update({
          ...session,
          user: {
            ...session.user,
            gstinDetails: result.gstinDetails,
          },
        });
        onOpenChange(false);
      } else {
        toast.error(result.message || "Failed to verify GSTIN");
      }
    } catch (error) {
      toast.error("Error confirming GSTIN");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] bg-[#0A0A0A] border border-yellow-400/10">
        <DialogHeader>
          <DialogTitle className="text-white">Verify GSTIN</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Input
              placeholder="Enter GSTIN Number"
              value={gstinNumber}
              onChange={(e) => setGstinNumber(e.target.value)}
              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400"
            />
          </div>
          <div className="p-3 rounded-md bg-red-500/10 text-red-400 text-xs">
            <p>
              Disclaimer: Please ensure you are entering the correct GSTIN.
              Providing false information is at your own risk and may be
              illegal. Read our{" "}
              <Link
                href="/terms-of-service"
                className="underline text-red-300 hover:text-red-400"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="underline text-red-300 hover:text-red-400"
                target="_blank"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {verificationResult && (
            <div
              className={`p-3 rounded-md ${
                verificationResult.valid
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {verificationResult.valid ? (
                <div>
                  <p className="font-medium">
                    Trade Name: {verificationResult.tradeName}
                  </p>
                  <p className="text-sm mt-1">GSTIN is valid</p>
                </div>
              ) : (
                <p>{verificationResult.message}</p>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className=" text-black hover:bg-gray-300 cursor-pointer"
            >
              Cancel
            </Button>
            {!verificationResult?.valid ? (
              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
