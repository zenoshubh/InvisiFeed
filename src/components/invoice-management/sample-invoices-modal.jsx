"use client";

import { motion } from "motion/react";
import { X, Eye, FileUp } from "lucide-react";

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

export default function SampleInvoicesModal({
  isOpen,
  onClose,
  onSelect,
  onResetData,
  loading,
}) {
  if (!isOpen) return null;

  const handleViewInvoice = (event, invoice) => {
    event.stopPropagation();
    window.open(invoice.url, "_blank");
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm p-4 overflow-">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1A1A1A] p-6 rounded-2xl w-full max-w-sm border border-yellow-400/20 shadow-2xl overflow-hidden"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-yellow-400">
            Select Sample Invoice
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-yellow-400/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-yellow-400" />
          </button>
        </div>

        {/* Caution Message */}
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-red-400 text-xs">
            <strong>Caution:</strong> Sample invoices are for testing purposes
            only.
          </p>
          {onResetData && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose();
                setTimeout(() => {
                  onResetData();
                }, 100);
              }}
              className="text-red-400 hover:text-red-300 text-xs mt-1 inline-block underline"
            >
              Reset data for genuine data analysis
            </a>
          )}
        </div>

        <div className="space-y-2 max-h-[300px]">
          {sampleInvoices.map((invoice) => (
            <button
              key={invoice.id}
              onClick={() => onSelect(invoice)}
              className="w-full px-4 py-3 bg-[#0A0A0A] border border-yellow-400/20 rounded-xl text-white hover:bg-[#0A0A0A]/80 hover:border-yellow-400/40 transition-all duration-300 flex items-center justify-between cursor-pointer"
              disabled={loading}
            >
              <span className="text-sm">{invoice.name}</span>
              {loading ? (
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <div className="flex items-center space-x-4">
                  <Eye
                    className="h-4 w-4 text-yellow-400"
                    onClick={(event) => handleViewInvoice(event, invoice)}
                  />
                  <FileUp className="h-4 w-4 text-yellow-400" />
                </div>
              )}
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
