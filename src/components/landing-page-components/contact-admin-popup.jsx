"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export default function ContactAdminPopup({ open, onOpenChange }) {


  const handleSubmit = () => {
    window.open("mailto:invisifeed@gmail.com", "_blank");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] bg-[#0A0A0A] border hover:border-yellow-400 border-yellow-400/10">
        <DialogHeader>
          <DialogTitle className="text-white">Stay in touch</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              Contact our admin for any updates or queries regarding paid plans.
            </p>
          </div>

          <Button className="bg-yellow-400 text-black hover:bg-yellow-500 cursor-pointer " onClick={handleSubmit}>Contact Admin</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
