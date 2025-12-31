import { PDFDocument } from "pdf-lib";

export async function mergePdfs(invoicePdfBuffer, qrPdfBuffer) {
    try {
      // Validate invoice PDF buffer
      if (!invoicePdfBuffer || invoicePdfBuffer.length === 0) {
        throw new Error("Invoice PDF buffer is empty");
      }

      // Validate QR PDF buffer
      if (!qrPdfBuffer || qrPdfBuffer.length === 0) {
        throw new Error("QR PDF buffer is empty");
      }

      const invoicePdf = await PDFDocument.load(invoicePdfBuffer);
      const qrPdf = await PDFDocument.load(qrPdfBuffer);
  
      const mergedPdf = await PDFDocument.create();
      const [invoicePage] = await mergedPdf.copyPages(invoicePdf, [0]);
      const [qrPage] = await mergedPdf.copyPages(qrPdf, [0]);
  
      mergedPdf.addPage(invoicePage);
      mergedPdf.addPage(qrPage);
  
      return await mergedPdf.save();
    } catch (error) {
      console.error("Error merging PDFs:", error);
      throw error;
    }
  }