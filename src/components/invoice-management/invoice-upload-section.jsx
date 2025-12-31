"use client";

import { motion } from "motion/react";
import { Plus, X, Upload, FileText, Trash, RefreshCw } from "lucide-react";
import Link from "next/link";

const sampleInvoices = [
  {
    id: 1,
    name: "Invoice 1",
    url: "https://res.cloudinary.com/dqma4eudc/image/upload/v1746254651/SampleInvoice1_cotx54.pdf",
  },
  {
    id: 2,
    name: "Invoice 2",
    url: "https://res.cloudinary.com/dqma4eudc/image/upload/v1746254652/SampleInvoice2_hjpeay.pdf",
  },
  {
    id: 3,
    name: "Invoice 3",
    url: "https://res.cloudinary.com/dqma4eudc/image/upload/v1746254651/SampleInvoice3_lipycq.pdf",
  },
  {
    id: 4,
    name: "Invoice 4",
    url: "https://res.cloudinary.com/dqma4eudc/image/upload/v1746254651/SampleInvoice4_wrzovq.pdf",
  },
  {
    id: 5,
    name: "Invoice 5",
    url: "https://res.cloudinary.com/dqma4eudc/image/upload/v1746254651/SampleInvoice5_tlgyuw.pdf",
  },
];

export default function InvoiceUploadSection({
  file,
  fileInputRef,
  loading,
  dailyUploadCount,
  dailyLimit,
  couponSaved,
  couponData,
  business,
  showCreateInvoice,
  onFileChange,
  onUpload,
  onShowSampleInvoices,
  onShowCreateInvoice,
  onShowCouponForm,
  onDeleteCoupon,
  onRefresh,
  onResetData,
  onShowSubscriptionPopup,
}) {
  const handleUploadInvoiceFreePlanClick = (e) => {
    if (
      business?.plan?.planName === "free" ||
      business?.plan?.planEndDate < new Date()
    ) {
      e.preventDefault();
      if (onShowSubscriptionPopup) {
        onShowSubscriptionPopup();
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl shadow-2xl rounded-2xl border border-yellow-400/20 p-8 group relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-yellow-400/5 rounded-full blur-3xl" />

      {onRefresh && (
        <button
          className="absolute top-2 sm:top-4 right-2 sm:right-4 rounded-full p-2 hover:bg-yellow-400/40 transition-colors cursor-pointer duration-300"
          onClick={onRefresh}
        >
          <RefreshCw className="h-5 w-5 text-yellow-400 cursor-pointer" />
        </button>
      )}

      <div className="relative z-10 w-full">
        <h1 className="text-3xl font-bold mb-2 text-center bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
          Invoice Management
        </h1>
        <p className="text-gray-400 text-sm mb-8 text-center">
          Create a new invoice or upload an existing one
        </p>

        {/* Daily Upload Limit Info */}
        <div className="mb-6 text-center">
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-gray-400">
                Loading upload status...
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A0A0A]/50 rounded-full border border-yellow-400/20">
              <p className="text-sm text-gray-300">
                Daily Uploads:{" "}
                <span className="font-medium text-yellow-400">
                  {dailyUploadCount}
                </span>
                /
                <span className="font-medium text-yellow-400">
                  {dailyLimit}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mb-8">
          {file ? null : dailyUploadCount >= dailyLimit ? (
            <div className="text-center">
              <p className="text-yellow-400 text-lg font-medium mb-2">
                Daily Limit Reached
              </p>
              <p className="text-gray-400 text-sm">
                You have reached your daily upload limit. Please try again
                later.
              </p>
              {(business?.plan?.planName === "free" ||
                business?.plan?.planEndDate < new Date()) && (
                <Link href="/pricing">
                  <button className="text-yellow-400 text-sm mt-3 cursor-pointer p-3 rounded-full border border-yellow-400/20 bg-gradient-to-br hover:from-yellow-400/20 hover:to-yellow-400/10">
                    Please upgrade your plan to upload more invoices.
                  </button>
                </Link>
              )}
            </div>
          ) : !showCreateInvoice ? (
            <button
              onClick={onShowCreateInvoice}
              className="flex items-center gap-2 px-6 py-3 max-w-md w-full cursor-pointer bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 justify-center"
            >
              <Plus className="h-5 w-5" />
              <span>Create Invoice</span>
            </button>
          ) : (
            <button
              onClick={() => onShowCreateInvoice(false)}
              className="flex items-center cursor-pointer gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
            >
              <X className="h-5 w-5" />
              <span>Cancel</span>
            </button>
          )}
        </div>

        {/* File Input Section */}
        {!showCreateInvoice && dailyUploadCount < dailyLimit && (
          <div className="mb-8 flex flex-col items-center w-full gap-4">
            {/* Display File Name */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center max-w-md justify-between text-gray-300 mb-4 bg-[#0A0A0A]/50 p-3 rounded-lg border border-yellow-400/10"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-yellow-400" />
                  <span className="text-sm">
                    Selected:{" "}
                    <span className="font-medium text-yellow-400">
                      {file.name}
                    </span>
                  </span>
                  <button title="Remove File">
                    <Trash
                      size={17}
                      className="text-white hover:text-gray-400 ml-auto cursor-pointer transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (fileInputRef.current) {
                          fileInputRef.current.value = null;
                        }
                        if (onRefresh) onRefresh();
                      }}
                    />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Hidden File Input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf"
              onChange={onFileChange}
              className="hidden"
              id="file-upload"
              disabled={loading}
            />

            {/* Custom Button */}
            <label
              htmlFor="file-upload"
              onClick={handleUploadInvoiceFreePlanClick}
              className={`w-full max-w-md flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl cursor-pointer transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Upload className="h-5 w-5" />
              <span>Upload Invoice</span>
            </label>

            {/* Create Coupon Button */}
            {file &&
              !couponSaved &&
              (business?.plan?.planName !== "free" ||
                (business?.plan?.planEndDate &&
                  new Date(business?.plan?.planEndDate) > new Date())) && (
                <button
                  onClick={onShowCouponForm}
                  className="w-full max-w-md flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Create Coupon</span>
                </button>
              )}

            {couponSaved && (
              <div className="w-full max-w-md flex flex-col items-center gap-2">
                <button
                  onClick={onShowCouponForm}
                  className="w-full flex items-center justify-between px-6 py-2 bg-gradient-to-r from-white to-gray-200 hover:from-white hover:to-gray-400 text-black font-medium rounded-xl transition-all duration-300 shadow-lg cursor-pointer"
                >
                  <div className="flex items-center justify-center gap-2 flex-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                    </svg>
                    <span>Edit Coupon</span>
                  </div>
                  <Trash
                    size={35}
                    className="text-gray-500 hover:text-gray-900 rounded-full p-2 hover:bg-gray-200 cursor-pointer transition-all duration-200"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCoupon();
                    }}
                  />
                </button>
              </div>
            )}

            {/* Generate Invoice Button */}
            {file && (
              <div className="w-full max-w-md mx-auto">
                <motion.button
                  onClick={onUpload}
                  disabled={loading || !file || dailyUploadCount >= dailyLimit}
                  className="w-full px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none cursor-pointer"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Generate Smart Invoice"
                  )}
                </motion.button>
              </div>
            )}

            <p
              onClick={onShowSampleInvoices}
              className="text-gray-100 text-sm mt-4 text-center cursor-pointer hover:text-yellow-400 transition-colors"
            >
              Try out our sample invoices to get started
            </p>
            {onResetData && (
              <p
                onClick={onResetData}
                className="text-gray-400 hover:text-yellow-400 text-xs mt-1 text-center cursor-pointer transition-colors"
              >
                [Reset data if you have sample invoices uploaded]
              </p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
