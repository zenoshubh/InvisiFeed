"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  uploadInvoice,
  sendInvoiceEmail,
  createInvoice,
} from "@/actions/invoice";
import InvoiceUploadSection from "./invoice-upload-section";
import InvoiceDisplaySection from "./invoice-display-section";
import CreateInvoiceModal from "./create-invoice-modal";
import CouponFormModal from "./coupon-form-modal";
import SampleInvoicesModal from "./sample-invoices-modal";
import ConfirmModal from "@/components/modals/confirm-modal";
import CompleteProfileDialog from "@/components/owner-page-components/complete-profile-dialog";
import { SubscriptionPopup } from "@/components/modals/subscription-popup";

export default function InvoiceManagementContainer({ initialData }) {
  const {
    dailyUploadCount: initialCount,
    dailyLimit: initialLimit,
    owner,
  } = initialData;

  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState("");
  const [feedbackUrl, setFeedbackUrl] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [dailyUploadCount, setDailyUploadCount] = useState(initialCount);
  const [dailyLimit] = useState(initialLimit);
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [extractedCustomerEmail, setExtractedCustomerEmail] = useState("");
  const [customerAmount, setCustomerAmount] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [showCouponForm, setShowCouponForm] = useState(false);
  const [showSampleInvoices, setShowSampleInvoices] = useState(false);
  const [showCreateInvoice, setShowCreateInvoice] = useState(false);
  const [showCompleteProfileDialog, setShowCompleteProfileDialog] =
    useState(false);
  const [isSubscriptionPopupOpen, setIsSubscriptionPopupOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Coupon data
  const [couponData, setCouponData] = useState({
    couponCode: "",
    description: "",
    expiryDays: "30",
  });
  const [couponSaved, setCouponSaved] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];

    if (selectedFile && selectedFile.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit. Please select a smaller file.");
      return;
    }

    setFile(selectedFile);
    setEmailSent(false);
    setCustomerEmail("");
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a PDF file.");
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error("File size exceeds 3MB limit. Please select a smaller file.");
      return;
    }

    if (dailyUploadCount >= dailyLimit) {
      toast.error(`Daily upload limit (${dailyLimit}) reached`);
      setIsSubscriptionPopupOpen(true);
      return;
    }

    if (owner?.isProfileCompleted !== "completed") {
      setShowCompleteProfileDialog(true);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      if (couponSaved && couponData.couponCode) {
        formData.append("couponData", JSON.stringify(couponData));
      }

      const result = await uploadInvoice(formData);

      if (result.success) {
        toast.success(result.message);
        setInvoiceNumber(result.data.invoiceNumber);
        setPdfUrl(result.data.pdfUrl);
        setFeedbackUrl(result.data.feedbackUrl);
        setCustomerName(result.data.customerName);
        setExtractedCustomerEmail(result.data.customerEmail);
        setCustomerEmail(result.data.customerEmail || "");
        setCustomerAmount(result.data.customerAmount);
        setDailyUploadCount(result.data.dailyUploadCount);
        setEmailSent(false);
        setCouponSaved(false);
        setCouponData({
          couponCode: "",
          description: "",
          expiryDays: "30",
        });
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(result.message);
        if (result.message.includes("Daily upload limit")) {
          setIsSubscriptionPopupOpen(true);
        }
      }
    } catch (error) {
      toast.error("Failed to upload invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!customerEmail) {
      toast.error("Please enter customer email");
      return;
    }

    setSendingEmail(true);

    try {
      const result = await sendInvoiceEmail({
        customerEmail,
        invoiceNumber,
        pdfUrl,
        companyName: owner?.companyName || "Your Company",
        feedbackUrl,
      });

      if (result.success) {
        toast.success(result.message);
        setEmailSent(true);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to send email");
    } finally {
      setSendingEmail(false);
    }
  };

  const handleCreateInvoice = async (invoiceData) => {
    setLoading(true);

    try {
      const result = await createInvoice({
        ...invoiceData,
        couponData: couponSaved ? couponData : null,
      });

      if (result.success) {
        toast.success(result.message);
        setInvoiceNumber(result.data.invoiceNumber);
        setPdfUrl(result.data.pdfUrl);
        setFeedbackUrl(result.data.feedbackUrl);
        setCustomerName(result.data.customerName);
        setExtractedCustomerEmail(result.data.customerEmail);
        setCustomerEmail(result.data.customerEmail);
        setCustomerAmount(result.data.customerAmount);
        setShowCreateInvoice(false);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = async () => {
    setLoading(true);

    try {
      const { resetData } = await import("@/actions/data-management");
      const result = await resetData();

      if (result.success) {
        toast.success(result.message);
        setPdfUrl("");
        setFeedbackUrl("");
        setInvoiceNumber("");
        setCustomerEmail("");
        setEmailSent(false);
        setFile(null);
        setCouponData({
          couponCode: "",
          description: "",
          expiryDays: "30",
        });
        setCouponSaved(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to reset data");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  const handleCouponSave = () => {
    if (
      !couponData.couponCode ||
      !couponData.description ||
      !couponData.expiryDays
    ) {
      toast.error("Please fill all coupon fields");
      return;
    }
    setCouponSaved(true);
    setShowCouponForm(false);
    toast.success("Coupon saved successfully");
  };

  const handleShowCreateInvoice = () => {
    if (owner?.isProfileCompleted !== "completed") {
      setShowCompleteProfileDialog(true);
      return;
    }
    setShowCreateInvoice(true);
  };

  const handleRefreshComponent = () => {
    setFile(null);
    setPdfUrl("");
    setInvoiceNumber("");
    setCustomerEmail("");
    setCustomerName("");
    setExtractedCustomerEmail("");
    setCustomerAmount("");
    setEmailSent(false);
    setCouponSaved(false);
    setCouponData({
      couponCode: "",
      description: "",
      expiryDays: "30",
    });
    setShowCreateInvoice(false);
    setShowCouponForm(false);
    setShowSampleInvoices(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSampleInvoiceSelect = async (sampleInvoice) => {
    setLoading(true);
    setShowSampleInvoices(false);

    try {
      const response = await fetch(sampleInvoice.url);
      const blob = await response.blob();
      const file = new File([blob], `${sampleInvoice.name}.pdf`, {
        type: "application/pdf",
      });

      const formData = new FormData();
      formData.append("file", file);

      if (couponSaved && couponData.couponCode) {
        formData.append("couponData", JSON.stringify(couponData));
      }

      const result = await uploadInvoice(formData);

      if (result.success) {
        toast.success(result.message);
        setInvoiceNumber(result.data.invoiceNumber);
        setPdfUrl(result.data.pdfUrl);
        setFeedbackUrl(result.data.feedbackUrl);
        setCustomerName(result.data.customerName);
        setExtractedCustomerEmail(result.data.customerEmail);
        setCustomerEmail(result.data.customerEmail || "");
        setCustomerAmount(result.data.customerAmount);
        setDailyUploadCount(result.data.dailyUploadCount);
        setEmailSent(false);
        setCouponSaved(false);
        setCouponData({
          couponCode: "",
          description: "",
          expiryDays: "30",
        });
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to process sample invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#111111] to-[#0A0A0A] px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-7xl mx-auto">
        <InvoiceUploadSection
          file={file}
          fileInputRef={fileInputRef}
          loading={loading}
          dailyUploadCount={dailyUploadCount}
          dailyLimit={dailyLimit}
          couponSaved={couponSaved}
          couponData={couponData}
          owner={owner}
          showCreateInvoice={showCreateInvoice}
          onFileChange={handleFileChange}
          onUpload={handleUpload}
          onShowSampleInvoices={() => setShowSampleInvoices(true)}
          onShowCreateInvoice={handleShowCreateInvoice}
          onShowCouponForm={() => setShowCouponForm(true)}
          onDeleteCoupon={() => {
            setConfirmAction(() => () => {
              setCouponSaved(false);
              setCouponData({
                couponCode: "",
                description: "",
                expiryDays: "30",
              });
              toast.success("Coupon deleted");
              setShowConfirmModal(false);
            });
            setShowConfirmModal(true);
          }}
          onRefresh={handleRefreshComponent}
          onResetData={() => {
            setConfirmAction(() => handleResetData);
            setShowConfirmModal(true);
          }}
          onShowSubscriptionPopup={() => setIsSubscriptionPopupOpen(true)}
        />

        {(pdfUrl || feedbackUrl) && (
          <InvoiceDisplaySection
            pdfUrl={pdfUrl}
            feedbackUrl={feedbackUrl}
            invoiceNumber={invoiceNumber}
            customerEmail={customerEmail}
            customerName={customerName}
            extractedCustomerEmail={extractedCustomerEmail}
            customerAmount={customerAmount}
            emailSent={emailSent}
            sendingEmail={sendingEmail}
            owner={owner}
            onCustomerEmailChange={setCustomerEmail}
            onSendEmail={handleSendEmail}
            onReset={() => {
              setConfirmAction(() => handleResetData);
              setShowConfirmModal(true);
            }}
          />
        )}

        {/* Modals */}
        <CouponFormModal
          isOpen={showCouponForm}
          couponData={couponData}
          onClose={() => setShowCouponForm(false)}
          onCouponChange={setCouponData}
          onSave={handleCouponSave}
        />

        <SampleInvoicesModal
          isOpen={showSampleInvoices}
          onClose={() => setShowSampleInvoices(false)}
          onSelect={handleSampleInvoiceSelect}
          onResetData={() => {
            setConfirmAction(() => handleResetData);
            setShowConfirmModal(true);
          }}
          loading={loading}
        />

        <CreateInvoiceModal
          isOpen={showCreateInvoice}
          onClose={() => setShowCreateInvoice(false)}
          onSubmit={handleCreateInvoice}
          loading={loading}
        />

        <CompleteProfileDialog
          open={showCompleteProfileDialog}
          onOpenChange={setShowCompleteProfileDialog}
        />

        <SubscriptionPopup
          isOpen={isSubscriptionPopupOpen}
          onClose={() => setIsSubscriptionPopupOpen(false)}
        />

        <ConfirmModal
          isOpen={showConfirmModal}
          message="Are you sure you want to proceed? This action cannot be undone."
          onConfirm={() => {
            if (confirmAction) confirmAction();
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      </div>
    </div>
  );
}
