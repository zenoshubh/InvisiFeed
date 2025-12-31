"use client";

import { motion } from "motion/react";

export default function CouponFormModal({
  isOpen,
  couponData,
  onClose,
  onCouponChange,
  onSave,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-md border border-yellow-400/20 shadow-2xl"
      >
        <h2 className="text-2xl font-bold mb-6 text-yellow-400">
          Create Coupon
        </h2>
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Coupon Code
            </label>
            <input
              type="text"
              value={couponData.couponCode}
              onChange={(e) =>
                onCouponChange({
                  ...couponData,
                  couponCode: e.target.value.toUpperCase(),
                })
              }
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
              placeholder="Enter coupon code"
            />
            <p className="text-xs text-gray-400 mt-2">
              This coupon code will go under slight modification for security
              purposes
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={couponData.description}
              onChange={(e) =>
                onCouponChange({
                  ...couponData,
                  description: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
              placeholder="Enter coupon description"
              rows="3"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expiry (in days)
            </label>
            <input
              type="number"
              value={couponData.expiryDays}
              onChange={(e) =>
                onCouponChange({
                  ...couponData,
                  expiryDays: e.target.value,
                })
              }
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/30 transition-all duration-300"
              min="1"
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-gray-300 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2.5 bg-yellow-400 text-gray-900 rounded-xl hover:bg-yellow-500 transition-all duration-300 cursor-pointer"
          >
            Save
          </button>
        </div>
      </motion.div>
    </div>
  );
}
