"use client";

import CreateInvoiceForm from "../business-page-components/create-invoice-form";

export default function CreateInvoiceModal({
  isOpen,
  onClose,
  onSubmit,
  loading,
}) {
  if (!isOpen) return null;

  return (
    <CreateInvoiceForm
      open={isOpen}
      onOpenChange={onClose}
      onSave={onSubmit}
      onCancel={onClose}
      saving={loading}
    />
  );
}
