"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Plus, Minus, Save, X, Trash } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import GSTINVerificationDialog from "./gstin-verification-dialog";
import Link from "next/link";
import { createInvoiceSchema as formSchema } from "@/schemas/invoice/create-invoice";

export default function CreateInvoiceForm({
  onSave,
  onCancel,
  open,
  onOpenChange,
  saving,
}) {
  const { data: session } = useSession();
  const business = session?.user;
  const [showVerifyGstinDialog, setShowVerifyGstinDialog] = useState(false);
  const [charCount, setCharCount] = useState(129);
  const maxLength = 200;
  const [notesCharCount, setNotesCharCount] = useState(147);

  const handleChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setCharCount(value.length);
    }
  };

  const handleNotesChange = (e) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setNotesCharCount(value.length);
    }
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: business?.businessName || "",
      businessEmail: business?.email || "",
      businessPhone: business?.phoneNumber || "",
      businessAddress: business?.address
        ? `${business.address.localAddress || ""}, ${business.address.city || ""}, ${
            business.address.state || ""
          }, ${business.address.country || ""}, ${
            business.address.pincode || ""
          }`.trim()
        : "",
      gstin: business?.gstinDetails?.gstinNumber || "Unregistered",
      gstinHolderName: business?.gstinDetails?.gstinHolderName || "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      invoiceNumber: "",
      invoiceDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      paymentTerms: "Net 7",
      items: [
        {
          description: "",
          quantity: 1,
          rate: 0,
          amount: 0,
          discount: 0,
          tax: 0,
        },
      ],
      bankDetails: "",
      paymentMethod: "Bank Transfer",
      paymentInstructions:
        "Thanks for using our service! Please complete your payment by the due date to avoid interruptions. Questions? We’re here to help.",
      notes:
        "We've included a feedback form link in this invoice. Fill it out for a chance to win some exciting coupons! We'd really love to hear your thoughts.",
      includeFeedbackForm: false,
      addCoupon: false,
      coupon: {
        code: "",
        description: "",
        expiryDays: "30",
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const [subtotal, setSubtotal] = useState(0);
  const [taxTotal, setTaxTotal] = useState(0);
  const [discountTotal, setDiscountTotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  const calculateTotals = (items) => {
    let sub = 0;
    let tax = 0;
    let discount = 0;

    items.forEach((item) => {
      const itemAmount = item.quantity * item.rate;
      const itemDiscount = (itemAmount * item.discount) / 100;
      const itemAfterDiscount = itemAmount - itemDiscount;
      const itemTax = (itemAfterDiscount * item.tax) / 100;

      sub += itemAmount;
      discount += itemDiscount;
      tax += itemTax;
    });

    setSubtotal(sub);
    setTaxTotal(tax);
    setDiscountTotal(discount);
    setGrandTotal(sub - discount + tax);
  };

  const onSubmit = (data) => {
    if (!data.businessName || !data.customerName) {
      toast.error("Please fill in all required fields");
      return;
    }
    onSave(data);
  };
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"; // Disable background scroll
    } else {
      document.body.style.overflow = ""; // Enable background scroll
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup on unmount
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed custom-popup inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:mt-0"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0A0A0A] absolute bottom-24 md:bottom-12 top-12  rounded-sm sm:max-w-2xl md:w-full w-[95vw] max-h-[80vh]  overflow-y-auto max-w-xl md:max-w-4xl mx-auto sm:mx-4 border border-yellow-400/20 md:mb-0"
            >
              <button
                onClick={onCancel}
                className="absolute right-2 top-2 p-2 rounded-full hover:bg-yellow-400/10 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5 text-yellow-400" />
              </button>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mb-3 ">
                  {/* Business Details */}
                  <Card className="bg-[#0A0A0A]  border-none w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        Business Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Business Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  readOnly={true}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="businessEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Business Email *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  readOnly={true}
                                  type="email"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="businessPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Business Phone
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  readOnly={true}
                                  type="tel"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {business?.gstinDetails?.gstinVerificationStatus ===
                        true ? (
                          <FormField
                            control={form.control}
                            name="gstin"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-gray-300">
                                  GSTIN / Tax ID
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    readOnly={true}
                                    className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ) : (
                          <div className="flex gap-1   flex-col">
                            <span className="text-gray-300 text-sm font-semibold ">
                              GSTIN / Tax ID
                            </span>
                            <Button
                              type="button"
                              onClick={() => setShowVerifyGstinDialog(true)}
                              className="bg-transparent text-gray-300 justify-start border border-yellow-400/20 hover:bg-yellow-400/10 "
                            >
                              Verify GSTIN
                            </Button>
                          </div>
                        )}

                        {business?.gstinDetails?.gstinVerificationStatus ===
                          true && (
                          <FormField
                            control={form.control}
                            name="gstinHolderName"
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel className="text-gray-300">
                                  GSTIN Holder Name
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    readOnly={true}
                                    className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                        <FormField
                          control={form.control}
                          name="businessAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-300">
                                Business Address *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  readOnly={true}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Customer Details */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        Customer Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Customer Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Customer Email *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="email"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Customer Phone
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="tel"
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customerAddress"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-300">
                                Customer Address *
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Invoice Meta Details */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        Invoice Details
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="invoiceNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Invoice Number *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="invoiceDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Invoice Date *
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type="date"
                                    className="bg-[#0A0A0A] text-white border-yellow-400/20 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="dueDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Due Date
                              </FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    {...field}
                                    type="date"
                                    className="bg-[#0A0A0A] text-white border-yellow-400/20 pr-10 [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                                  />
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-5 w-5 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="paymentTerms"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Payment Terms
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-[#0A0A0A] border-yellow-400/20 text-white">
                                    <SelectValue placeholder="Select payment terms" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Net 7">Net 7</SelectItem>
                                  <SelectItem value="Net 15">Net 15</SelectItem>
                                  <SelectItem value="Net 30">Net 30</SelectItem>
                                  <SelectItem value="Due on receipt">
                                    Due on receipt
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Services/Items */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-yellow-400">
                          Services/Items
                        </h3>
                        <Button
                          type="button"
                          onClick={() =>
                            append({
                              description: "",
                              quantity: 1,
                              rate: 0,
                              amount: 0,
                              discount: 0,
                              tax: 0,
                            })
                          }
                          className="bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-4">
                        {fields.map((field, index) => (
                          <Card
                            key={field.id}
                            className="bg-[#0A0A0A] border-yellow-400/20"
                          >
                            <CardContent className="pt-6">
                              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.description`}
                                  render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                      <FormLabel className="text-gray-300">
                                        Description *
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.quantity`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-300">
                                        Quantity *
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min="1"
                                          className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                          onChange={(e) => {
                                            field.onChange(
                                              Number(e.target.value)
                                            );
                                            calculateTotals(
                                              form.getValues("items")
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.rate`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-300">
                                        Rate *
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min="0"
                                          className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                          onChange={(e) => {
                                            field.onChange(
                                              Number(e.target.value)
                                            );
                                            calculateTotals(
                                              form.getValues("items")
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.discount`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-300">
                                        Discount (%)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min="0"
                                          max="100"
                                          className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                          onChange={(e) => {
                                            field.onChange(
                                              Number(e.target.value)
                                            );
                                            calculateTotals(
                                              form.getValues("items")
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name={`items.${index}.tax`}
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="text-gray-300">
                                        Tax (%)
                                      </FormLabel>
                                      <FormControl>
                                        <Input
                                          {...field}
                                          type="number"
                                          min="0"
                                          max="100"
                                          className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                          onChange={(e) => {
                                            field.onChange(
                                              Number(e.target.value)
                                            );
                                            calculateTotals(
                                              form.getValues("items")
                                            );
                                          }}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex items-end">
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => remove(index)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <Trash className="w-5 h-5" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Info */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        Payment Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="bankDetails"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-300">
                                Bank Account Details / UPI ID
                              </FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="paymentMethod"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-gray-300">
                                Payment Method
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="bg-[#0A0A0A] border-yellow-400/20 text-white">
                                    <SelectValue placeholder="Select payment method" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Bank Transfer">
                                    Bank Transfer
                                  </SelectItem>
                                  <SelectItem value="UPI">UPI</SelectItem>
                                  <SelectItem value="PayPal">PayPal</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="paymentInstructions"
                          render={({ field }) => (
                            <FormItem className="md:col-span-2">
                              <FormLabel className="text-gray-300">
                                Payment Instructions
                              </FormLabel>
                              <FormControl>
                                <Textarea
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(e); // Keep the original form's onChange
                                    handleChange(e); // Track character count
                                  }}
                                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                  maxLength={maxLength} // This limits the input to 200 characters
                                />
                              </FormControl>
                              <div className="text-sm text-gray-400 mt-1">
                                {charCount}/{maxLength}
                              </div>{" "}
                              {/* Character count display */}
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notes */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        Additional Notes
                      </h3>
                      <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Textarea
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e); // Keep the original form's onChange
                                  handleNotesChange(e); // Track character count
                                }}
                                maxLength={maxLength}
                                className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                placeholder="Add any additional notes for your client..."
                              />
                            </FormControl>
                            <div className="text-sm text-gray-400 mt-1">
                              {notesCharCount}/{maxLength}
                            </div>{" "}
                            {/* Character count display */}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Add-ons */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-yellow-400 mb-4">
                        Add-ons
                      </h3>
                      <div className="flex flex-col gap-4">
                        {(business?.plan?.planName === "pro" ||
                          business?.plan?.planName === "pro-trial" ||
                          business?.plan?.planEndDate > new Date()) && (
                          <>
                            <FormField
                              control={form.control}
                              name="addCoupon"
                              render={({ field }) => (
                                <FormItem className="flex items-center gap-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                      className="border-yellow-400/20 data-[state=checked]:bg-yellow-400 data-[state=checked]:text-gray-900"
                                    />
                                  </FormControl>
                                  <FormLabel className="text-gray-300">
                                    Add Coupon for Customer
                                  </FormLabel>
                                </FormItem>
                              )}
                            />
                            {form.watch("addCoupon") && (
                              <Card className="bg-[#0A0A0A] border-yellow-400/20">
                                <CardContent className="pt-6">
                                  <div className="flex flex-col gap-4">
                                    <FormField
                                      control={form.control}
                                      name="coupon.code"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-gray-300">
                                            Coupon Code
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                              onChange={(e) =>
                                                field.onChange(
                                                  e.target.value.toUpperCase()
                                                )
                                              }
                                              placeholder="Enter coupon code"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                          <p className="text-xs text-gray-400 mt-1">
                                            This coupon code will go under
                                            slight modification for security
                                            purposes
                                          </p>
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="coupon.description"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-gray-300">
                                            Description
                                          </FormLabel>
                                          <FormControl>
                                            <Textarea
                                              {...field}
                                              className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                              placeholder="Enter coupon description"
                                              rows="3"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                    <FormField
                                      control={form.control}
                                      name="coupon.expiryDays"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className="text-gray-300">
                                            Expiry (in days)
                                          </FormLabel>
                                          <FormControl>
                                            <Input
                                              {...field}
                                              type="number"
                                              min="1"
                                              className="bg-[#0A0A0A] text-white border-yellow-400/20"
                                            />
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </>
                        )}

                        {business?.plan?.planName === "free" &&
                          business?.plan?.planEndDate < new Date() && (
                            <Link
                              className="text-gray-100 cursor-pointer hover:text-yellow-500 text-sm"
                              href="/pricing"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Upgrade to Pro for coupon feature.
                            </Link>
                          )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Totals */}
                  <Card className="bg-[#0A0A0A] border-none w-full">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-gray-300">
                          <span>Subtotal:</span>
                          <span>{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Discount:</span>
                          <span>-{discountTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span>Tax:</span>
                          <span>{taxTotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-yellow-400">
                          <span>Grand Total:</span>
                          <span>{grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-4 ">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={onCancel}
                      className="text-gray-300 cursor-pointer "
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className={`bg-yellow-400 text-gray-900 hover:bg-yellow-500 ${
                        saving ? "cursor-not-allowed" : "cursor-pointer"
                      } mr-4`}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {saving ? "Saving..." : "Save Invoice"}
                    </Button>
                  </div>
                </form>
              </Form>

              <GSTINVerificationDialog
                open={showVerifyGstinDialog}
                onOpenChange={setShowVerifyGstinDialog}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
