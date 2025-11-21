"use client";

import CreateInvoiceForm from "../owner-page-components/CreateInvoiceForm";

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
