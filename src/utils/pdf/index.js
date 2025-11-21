import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToStream,
  Link,
} from "@react-pdf/renderer";
import QRCode from "qrcode";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontSize: 9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10,
    borderBottom: "1px solid #eaeaea",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 30,
    height: 30,
    backgroundColor: "#4f46e5",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  companyInfo: {
    flexDirection: "column",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 2,
  },
  companyAddress: {
    fontSize: 8,
    color: "#6b7280",
  },
  invoiceTitle: {
    alignItems: "flex-end",
  },
  invoiceHeading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4f46e5",
    marginBottom: 2,
  },
  invoiceNumber: {
    fontSize: 10,
    fontWeight: "medium",
    color: "#1a1a1a",
  },
  invoiceDate: {
    fontSize: 8,
    color: "#6b7280",
    marginTop: 2,
  },
  body: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  infoSection: {
    width: "50%",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 8,
    fontWeight: "semibold",
    color: "#6b7280",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionTitleBold: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoText: {
    fontSize: 8,
    marginBottom: 5,
    color: "#4b5563",
  },
  infoTextBold: {
    fontSize: 10,
    fontWeight: "semibold",
    color: "#1a1a1a",
  },
  table: {
    width: "100%",
    marginBottom: 10,
    borderCollapse: "collapse",
  },
  tableHeader: {
    backgroundColor: "#f9fafb",
    padding: "8 10",
    fontSize: 8,
    fontWeight: "semibold",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableCell: {
    padding: "8 10",
    fontSize: 8,
    color: "#4b5563",
  },
  tableCellBold: {
    fontWeight: "medium",
    color: "#1a1a1a",
  },
  tableCellRight: {
    textAlign: "right",
  },
  summary: {
    width: "100%",
    alignItems: "flex-end",
    marginBottom: 10,
  },
  summaryTable: {
    borderTop: "1px solid #eaeaea",

    width: 200,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "6 8",
    borderBottom: "0.5px solid #eaeaea",
  },
  summaryRowLast: {
    backgroundColor: "#f9fafb",
    fontWeight: "bold",
    fontSize: 10,
    color: "#4f46e5",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    paddingTop: 10,
    borderTop: "1px solid #eaeaea",
  },
  paymentMethod: {
    width: 300,
  },
  feedbackSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
    padding: 15,
    borderRadius: 6,
    border: "1px solid #eaeaea",
    marginTop: 15,
    marginBottom: 15,
  },
  feedbackText: {
    fontSize: 11,
    color: "#4b5563",
    lineHeight: 1.5,
    marginRight: 110,
  },
  qrCode: {
    width: 80,
    height: 80,
  },
  thankYou: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 10,
    fontWeight: "semibold",
    color: "#1a1a1a",
  },
  signature: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: "#d1d5db",
    marginBottom: 4,
  },
  signatureText: {
    fontSize: 8,
    color: "#6b7280",
  },
  createdWith: {
    textAlign: "center",
    marginTop: 10,
    fontSize: 8,
    color: "#6b7280",
    fontStyle: "italic",
  },
  createdWithSpan: {
    color: "#4f46e5",
    fontWeight: "semibold",
  },
  PScontainer: {
    flexDirection: "row",
  },
  paymentDetailHeading: {
    marginBottom: 4,
  },
});

// Create PDF document
const InvoiceDocument = ({
  invoiceData,
  invoiceNumber,
  qrImage,
  feedbackUrl,
  subtotal,
  discountTotal,
  taxTotal,
  grandTotal,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", options);
  };
  // Filter out empty fields
  const filteredInvoiceData = {
    ...invoiceData,
    businessName: invoiceData.businessName.trim() || undefined,
    businessAddress: invoiceData.businessAddress.trim() || undefined,
    businessPhone: invoiceData.businessPhone.trim() || undefined,
    businessEmail: invoiceData.businessEmail.trim() || undefined,
    gstin: invoiceData.gstin.trim() || undefined,
    gstinHolderName: invoiceData.gstinHolderName.trim() || undefined,
    customerName: invoiceData.customerName.trim() || undefined,
    customerAddress: invoiceData.customerAddress.trim() || undefined,
    customerPhone: invoiceData.customerPhone.trim() || undefined,
    customerEmail: invoiceData.customerEmail.trim() || undefined,
    invoiceDate: invoiceData.invoiceDate.trim() || undefined,
    dueDate: invoiceData.dueDate ? formatDate(invoiceData.dueDate) : undefined,
    paymentTerms: invoiceData.paymentTerms.trim() || undefined,
    bankDetails: invoiceData.bankDetails.trim() || undefined,
    paymentMethod: invoiceData.paymentMethod.trim() || undefined,
    paymentInstructions: invoiceData.paymentInstructions.trim() || undefined,
    notes: invoiceData.notes.trim() || undefined,
    addCoupon: invoiceData.addCoupon || false,
    coupon: invoiceData.coupon || undefined,
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoSection}>
            <View style={styles.logo}>
              <Text
                style={{ color: "white", fontSize: 12, fontWeight: "bold" }}
              >
                {filteredInvoiceData.businessName?.[0] || "C"}
              </Text>
            </View>
            <View style={styles.companyInfo}>
              <Text style={styles.companyName}>
                {filteredInvoiceData.businessName || "Company Name"}
              </Text>

              {filteredInvoiceData.gstin !== "Unregistered" && (
                <Text style={styles.companyAddress}>
                  GSTIN: {filteredInvoiceData.gstin}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.invoiceHeading}>INVOICE</Text>
            <Text style={styles.invoiceNumber}>#{invoiceNumber.trim()}</Text>
            <Text style={styles.invoiceDate}>Issued on: {currentDate}</Text>
            <Text style={styles.invoiceDate}>
              Due Date: {filteredInvoiceData.dueDate}
            </Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.body}>
          {/* From Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>From</Text>
            {filteredInvoiceData.businessName && (
              <Text style={[styles.infoText, styles.infoTextBold]}>
                {filteredInvoiceData.businessName}
              </Text>
            )}
            {filteredInvoiceData.businessAddress && (
              <Text style={styles.infoText}>
                {filteredInvoiceData.businessAddress}
              </Text>
            )}
            {filteredInvoiceData.businessPhone && (
              <Text style={styles.infoText}>
                {filteredInvoiceData.businessPhone}
              </Text>
            )}
            {filteredInvoiceData.businessEmail && (
              <Text style={styles.infoText}>
                {filteredInvoiceData.businessEmail}
              </Text>
            )}
            {filteredInvoiceData.gstinHolderName && (
              <Text style={styles.infoText}>
                GSTIN Holder Name: {filteredInvoiceData.gstinHolderName}
              </Text>
            )}
          </View>

          {/* To Section */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>To</Text>
            {filteredInvoiceData.customerName && (
              <Text style={[styles.infoText, styles.infoTextBold]}>
                {filteredInvoiceData.customerName}
              </Text>
            )}
            {filteredInvoiceData.customerAddress && (
              <Text style={styles.infoText}>
                {filteredInvoiceData.customerAddress}
              </Text>
            )}
            {filteredInvoiceData.customerPhone && (
              <Text style={styles.infoText}>
                {filteredInvoiceData.customerPhone}
              </Text>
            )}
            {filteredInvoiceData.customerEmail && (
              <Text style={styles.infoText}>
                {filteredInvoiceData.customerEmail}
              </Text>
            )}
          </View>

          {/* Items Table */}
          <View style={styles.table}>
            <View
              style={{
                flexDirection: "row",
                borderBottom: "1px solid #eaeaea",
              }}
            >
              <Text style={[styles.tableHeader, { width: "25%" }]}>
                Description
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { width: "15%", textAlign: "center" },
                ]}
              >
                Quantity
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                Rate
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                Discount
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                Tax
              </Text>
              <Text
                style={[
                  styles.tableHeader,
                  { width: "15%", textAlign: "right" },
                ]}
              >
                Total
              </Text>
            </View>

            {filteredInvoiceData.items.map((item, index) => {
              const itemAmount = item.quantity * item.rate; // Quantity x Rate
              const itemDiscount = (itemAmount * item.discount) / 100; // Discount Amount
              const itemAfterDiscount = itemAmount - itemDiscount; // Amount after Discount
              const itemTax = (itemAfterDiscount * item.tax) / 100; // Tax Amount
              const itemTotal = itemAfterDiscount + itemTax; // Final Total

              return (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    borderBottom: "1px solid #eaeaea",
                  }}
                >
                  <Text style={[styles.tableCell, { width: "25%" }]}>
                    {item.description.trim()}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "15%", textAlign: "center" },
                    ]}
                  >
                    {item.quantity}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "15%", textAlign: "right" },
                    ]}
                  >
                    {item.rate}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "15%", textAlign: "right" },
                    ]}
                  >
                    {item.discount}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "15%", textAlign: "right" },
                    ]}
                  >
                    {item.tax}
                  </Text>
                  <Text
                    style={[
                      styles.tableCell,
                      { width: "15%", textAlign: "right" },
                    ]}
                  >
                    {itemTotal.toFixed(2)}
                  </Text>
                </View>
              );
            })}
          </View>

          {/*Payment+Summary*/}
          <View style={styles.PScontainer}>
            {/* Payment Details */}
            <View style={styles.paymentMethod}>
              <Text style={[styles.infoTextBold , styles.paymentDetailHeading]}>Payment Details</Text>
              {filteredInvoiceData.paymentMethod && (
                <Text style={[styles.infoText]}>
                  Method: {filteredInvoiceData.paymentMethod}
                </Text>
              )}
              {filteredInvoiceData.paymentTerms && (
                <Text style={styles.infoText}>
                  Terms: {filteredInvoiceData.paymentTerms}
                </Text>
              )}
              {filteredInvoiceData.bankDetails && (
                <Text style={styles.infoText}>
                  Bank/UPI Details: {filteredInvoiceData.bankDetails}
                </Text>
              )}
              {filteredInvoiceData.paymentInstructions && (
                <Text style={[styles.infoText, { marginTop: 5 }]}>
                  {filteredInvoiceData.paymentInstructions}
                </Text>
              )}
            </View>

            {/* Summary */}
            <View style={styles.summary}>
              <View style={styles.summaryTable}>
                <View style={styles.summaryRow}>
                  <Text>Subtotal (INR)</Text>
                  <Text>{(subtotal.toFixed(2))}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Discount (INR)</Text>
                  <Text>{(discountTotal.toFixed(2))}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text>Tax (INR)</Text>
                  <Text>{(taxTotal.toFixed(2))}</Text>
                </View>
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text>Total (INR)</Text>
                  <Text>{(grandTotal.toFixed(2))}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Notes */}
        {filteredInvoiceData.notes && (
          <View
            style={{
              marginTop: 5,
              marginBottom: 10,
              padding: 10,
              backgroundColor: "#f9fafb",
              borderRadius: 4,
            }}
          >
            <Text style={[styles.sectionTitle, { color: "#4b5563" }]}>
              Additional Notes
            </Text>
            <Text style={[styles.infoText, { lineHeight: 1.4 }]}>
              {filteredInvoiceData.notes}
            </Text>
          </View>
        )}

        {/* Signature */}
        <View style={styles.signature}>
          <View style={styles.signatureLine} />
          <Text style={styles.signatureText}>
            {filteredInvoiceData.businessName || "Signature"}
          </Text>
        </View>

        {/* Fixed Footer */}

        <View style={{ position: "absolute", bottom: 20, right: 20, left: 20 }}>
          {/* Feedback Section */}
          <View style={styles.feedbackSection}>
            <View style={{ flex: 1 }}>
              <View style={styles.feedbackText}>
                <Text>
                  Scan this QR code to provide feedback on our service.
                </Text>
                <Text>Your feedback stays anonymous!</Text>
                <Text>
                  Complete the feedback form for a chance to win a special
                  discount coupon for your next service.
                </Text>
                <Link src={feedbackUrl}>Click Here</Link>
              </View>
            </View>
            <Image src={qrImage} style={styles.qrCode} />
          </View>

          {/* Disclaimer */}
          <View
        style={{
          marginTop: 10,
          backgroundColor: "#f9fafb",
          padding: 8,
          borderRadius: 4,
             border: "1px solid #eaeaea",
          
        }}
      >
        <Text
          style={{
            color: "#4b5563",
            fontSize: 7,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Disclaimer: This tool is meant strictly for generating valid business invoices. Any misuse, such as fake invoicing or GST fraud, is punishable under the GST Act, 2017 and Bharatiya Nyaya Sanhita (BNS), 2023 (Sections 316 & 333). The user is solely responsible for the accuracy of GSTIN or any missing information; as per Rule 46 of the CGST Rules, furnishing correct invoice details is the supplier's responsibility. We are not liable for any incorrect, fake, or missing GSTIN entered by users.
        </Text>
      </View>

          {/* Created with */}
          <Text style={styles.createdWith}>
            Created with <Text style={styles.createdWithSpan}>InvisiFeed</Text>
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export const generateInvoicePdf = async (
  invoiceData,
  invoiceNumber,
  feedbackUrl,
  subtotal,
  discountTotal,
  taxTotal,
  grandTotal
) => {
  try {
    // Generate QR code
    const qrImage = await QRCode.toDataURL(feedbackUrl, { width: 300 });

    // Create PDF document
    const doc = InvoiceDocument({
      invoiceData,
      invoiceNumber,
      qrImage,
      feedbackUrl,
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
    });

    // Render to stream
    const stream = await renderToStream(doc);

    // Convert stream to buffer
    const chunks = [];
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    return buffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw error;
  }
};

