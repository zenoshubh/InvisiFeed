"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  PlusCircle,
  QrCode,
  Star,
  BarChart,
  Settings,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  ChevronDown,
  Upload,
  MessageSquare,
  LineChart,
  PieChart,
  Lightbulb,
  Award,
  Shield,
  ChevronLeft,
  X,
  Wand2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { BsEmojiAngryFill, BsEmojiSmileFill, BsEmojiNeutralFill, BsEmojiFrownFill, BsEmojiHeartEyesFill,BsEmojiSunglassesFill } from "react-icons/bs";


const steps = [
  {
    title: "Getting Started",
    icon: FileText,
    description: "Learn how to set up your InvisiFeed account and get started",
    content: [
      {
        title: "Create Your Account",
        description:
          "Sign up with your business email or Google account and set up your profile",
        details: [
          "Enter your credentials",
          "Verify your email",
          "Set up your profile",
        ],
      },
      {
        title: "Complete Your Profile",
        description: "Add your business details and customize your profile",
        details: [
          "Enter your business details",
          "Verify your GSTIN(if applicable)",
          "GSTIN Details make your invoice look more genuine",
          "Hands on guide to create your first invoice",
        ],
      },
      {
        title: "Choose the right plan",
        description: "Choose the right plan for your business",
        details: [
          "Free plan is available for new users",
          "Pro plan is available for businesses looking for advanced features",
          "You can see the features of each plan on the pricing page",
          "Choose the right plan for your business to get the most out of InvisiFeed",
        ],
      },
    ],
  },
  {
    title: "Invoice Management",
    icon: Upload,
    description: "Learn how to upload and create invoices",
    content: [
      {
        title: "Upload Existing Invoice",
        description: "Upload your PDF invoice to the platform",
        details: [
          "Upload your PDF file (upto 3 MB)",
          "Extract invoice details with AI",
          "Add coupon(if applicable)",
          "Your invoice will be merged with a page having link to feedback form , nothing will be changed in your original invoice",
          "You can download the smart invoice (with feedback form link) as PDF",
          "You can also share the invoice with a link or directly send it to your clients",
        ],
      },
      {
        title: "Create New Invoice",
        description: "Use our built-in invoice creator",
        details: [
          "Profile completion is mandatory to create an invoice",
          "Fill in client details",
          "Add line items and amounts",
          "Add coupon(if applicable)",
          "We will generate a new smart invoice with link to feedback form",
          "You can download the smart invoice (with feedback form link) as PDF",
          "You can also share the invoice with a link or directly send it to your clients",
        ],
      },
      {
        title: "View Invoices",
        description: "View all your past invoices",
        details: [
          "You can view details of all your invoices on the Show Invoices page",
          "Customer Name, Invoice Number, Invoice Date, Invoice Amount, Feedback Status",
          "We are working on features to let you download your past invoices as PDF",
        ],
      },
    ],
  },
  {
    title: "Feedback Collection",
    icon: MessageSquare,
    description: "Understand how feedback is collected from clients",
    content: [
      {
        title: "Delivery of Feedback Form",
        description:
          "Customer will receive a link to feedback form with their invoice",
        details: [
          "They can submit their feedback by clicking on the link in the invoice",
          "QR code is also provided in the invoice which can be scanned to submit feedback",
          "They can submit their feedback anonymously without providing their personal details",
          "Coupon(if applicable) will be popped up in the feedback form after submission of feedback",
        ],
      },
      {
        title: "Anonymous Feedback",
        description:
          "Customer can submit their feedback anonymously or non-anonymously",
        details: [
          "Both anonymous and non-anonymous feedback are collected",
          "If customer wants to submit their feedback anonymously, they can do so by clicking on the anonymous checkbox in the feedback form",
          "Customers do not need to enter their personal details to submit feedback",
          "For non-anonymous feedback, customer details are collected from the invoice details automatically",
        ],
      },
      {
        title: "Coupon System",
        description: "Using coupons to encourage feedback",
        details: [
          "Add discount coupons to your invoice",
          "Set coupon validity period",
          "Automatic coupon delivery",
          "Businesses can manage coupons created by them on our platform",
        ],
      },
    ],
  },
  {
    title: "Business Analytics",
    icon: LineChart,
    description: "Learn how to analyze and use the feedback data",
    content: [
      {
        title: "Dashboard Overview",
        description: "Understanding your business analytics dashboard",
        details: [
          "Feedback collection rate",
          "Overall Ratings of your business",
          "Positive and negative feedback ratio",
          "Response time metrics",
          "Rating trends over time",
          "Areas of improvement and strengths of your business",
        ],
      },
      {
        title: "Detailed Analytics",
        description: "Deep dive into feedback data",
        details: [
          "Rating breakdown by category",
          "Trend analysis over time",
          "AI-powered insights",
          "Feedback summary and analysis",
          "Quick actions to improve your business",
        ],
      },
      {
        title: "Sales Analytics",
        description: "Deep dive into sales data",
        details: [
          "Total sales made by your business",
          "Sales trends over time",
          "Sales summary and analysis (coming soon)",
          "Quick actions to improve your sales (coming soon)",
        ],
      },
    ],
  },
  {
    title: "Advanced Features",
    icon: Lightbulb,
    description: "Explore advanced features and optimizations",
    content: [
      {
        title: "AI Insights",
        description: "Leverage AI for better understanding",
        details: [
          "Automated sentiment analysis",
          "Key improvement areas",
          "Success pattern recognition (coming soon)",
        ],
      },
      {
        title: "Performance Tracking",
        description: "Monitor your progress and growth",
        details: [
          "Historical performance comparison",
          "Goal setting and tracking (coming soon)",
          "Custom reporting (coming soon)",
        ],
      },
      {
        title: "Upcoming Features",
        description: "We are working on these features",
        details: [
          "Customizable invoice template",
          "Customizable feedback form",
          "Notification system for new feedback",
          "AI powered sales prediction",
          "Public portfolio of your business",

        ],
      },
    ],
  },
];

const emojiOptions = [
  { value: 1, emoji: <BsEmojiAngryFill />, label: "Very Dissatisfied" },
  { value: 2, emoji: <BsEmojiFrownFill />, label: "Dissatisfied" },
  { value: 3, emoji: <BsEmojiNeutralFill />, label: "Neutral" },
  { value: 4, emoji: <BsEmojiSmileFill />, label: "Satisfied" },
  { value: 5, emoji: <BsEmojiHeartEyesFill />, label: "Very Satisfied" },
];

const FeedbackFormPreview = () => {
  const [formData, setFormData] = useState({
    satisfactionRating: 3,
    communicationRating: 3,
    qualityOfServiceRating: 3,
    valueForMoneyRating: 3,
    recommendRating: 3,
    overAllRating: 3,
    feedbackContent: "",
    suggestionContent: "",
  });

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Rating Fields */}
      {[
        { key: "satisfactionRating", label: "Overall Satisfaction" },
        { key: "communicationRating", label: "Communication" },
        { key: "qualityOfServiceRating", label: "Quality of Service" },
        { key: "valueForMoneyRating", label: "Value for Money" },
        { key: "recommendRating", label: "Likelihood to Recommend" },
        { key: "overAllRating", label: "Overall Rating" },
      ].map(({ key, label }) => (
        <motion.div
          key={key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Label className="block mb-2 text-base font-medium text-gray-200">
            {label}
          </Label>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {emojiOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(key, option.value)}
                className={`text-2xl text-white sm:text-3xl p-2 flex-shrink-0 ${
                  formData[key] === option.value
                    ? "text-yellow-400"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                {option.emoji}
              </button>
            ))}
          </div>
          <span className="text-xs text-yellow-400/80 mt-1 block">
            {emojiOptions.find((e) => e.value === formData[key])?.label}
          </span>
        </motion.div>
      ))}

      {/* Additional Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative"
      >
        <Label className="block mb-2 text-base font-medium text-gray-200">
          Additional Feedback
        </Label>
        <Textarea
          placeholder="Share your thoughts here..."
          value={formData.feedbackContent}
          onChange={(e) => handleChange("feedbackContent", e.target.value)}
          className="min-h-[100px] bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-yellow-400/80">AI Usage: 0/3</span>
          <Button
            type="button"
            className="p-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
            variant="ghost"
            title="Generate Feedback using AI"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Suggestions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
        className="relative"
      >
        <Label className="block mb-2 text-base font-medium text-gray-200">
          Any Suggestions?
        </Label>
        <Textarea
          placeholder="Let us know how we can improve..."
          value={formData.suggestionContent}
          onChange={(e) => handleChange("suggestionContent", e.target.value)}
          className="min-h-[100px] bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-yellow-400/80">AI Usage: 0/3</span>
          <Button
            type="button"
            className="p-1.5 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
            variant="ghost"
            title="Generate Suggestion using AI"
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Submit Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
      >
        <Button
          type="button"
          className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/30"
        >
          Submit Feedback
        </Button>
      </motion.div>
    </div>
  );
};

const GuideSection = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showSmartInvoice, setShowSmartInvoice] = useState(false);
  const [showQRPDF, setShowQRPDF] = useState(false);
  const currentStep = steps[activeStep];
  const IconComponent = currentStep.icon;

  return (
    <section className="py-24 bg-[#0A0A0A] relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#0A0A0A] via-[#0A0A0A] to-[#000000] opacity-50" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-yellow-600"
          >
            Complete Guide to InvisiFeed
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-3xl mx-auto"
          >
            Everything you need to know about using InvisiFeed, from basic setup
            to advanced features.
          </motion.p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center  mb-12">
          <div className="flex items-center max-w-[80vw]  space-x-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.title}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`flex items-center cursor-pointer ${
                    index === activeStep ? "text-yellow-500" : "text-gray-400"
                  }`}
                  onClick={() => setActiveStep(index)}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index === activeStep ? "bg-yellow-500/20" : "bg-gray-700"
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <span className="ml-2 font-medium hidden md:inline">
                    {step.title}
                  </span>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-700" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content Section */}

        <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center w-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl mx-auto shadow-2xl rounded-2xl border border-yellow-400/20 p-4 sm:p-6 lg:p-8 group relative overflow-hidden"
          >
            <Card className="w-full bg-transparent border-none">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-2xl text-white">
                      {currentStep.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base text-gray-400">
                      {currentStep.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {currentStep.content.map((item, index) => (
                    <AccordionItem key={item.title} value={`item-${index}`}>
                      <AccordionTrigger className="text-white hover:text-yellow-500">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm sm:text-base">
                            {item.title}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-gray-400 mb-4 text-sm sm:text-base">
                          {item.description}
                        </p>
                        <ul className="space-y-2">
                          {item.details.map((detail, detailIndex) => (
                            <li
                              key={detailIndex}
                              className="flex items-start space-x-2 text-gray-300"
                            >
                              <ChevronRight className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                              <span className="text-xs sm:text-sm">
                                {detail}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-6 w-full px-2 sm:px-6">
              <button
                className="p-2 sm:p-3 border border-yellow-500 rounded-full text-yellow-500 hover:bg-yellow-500/10 transition disabled:opacity-50"
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                className="p-2 sm:p-3 border border-yellow-500 rounded-full text-yellow-500 hover:bg-yellow-500/10 transition disabled:opacity-50"
                onClick={() =>
                  setActiveStep(Math.min(steps.length - 1, activeStep + 1))
                }
                disabled={activeStep === steps.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* Quick Tips Sidebar */}
        <div className="flex flex-col gap-8 px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First Column - Existing Tips */}
            <Card className="flex flex-col w-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl mx-auto shadow-2xl rounded-2xl border border-yellow-400/20 p-4 sm:p-6 lg:p-8 group relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">Quick Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-white font-medium">Privacy First</p>
                      <p className="text-gray-400 text-sm">
                        All feedback is collected anonymously to ensure honest
                        responses
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Award className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-white font-medium">Best Practices</p>
                      <p className="text-gray-400 text-sm">
                        Add coupons to increase feedback response rates
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <PieChart className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <p className="text-white font-medium">Data Insights</p>
                      <p className="text-gray-400 text-sm">
                        Use AI insights to identify areas for improvement
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Second Column - Preview Options */}
            <Card className="flex flex-col w-full bg-gradient-to-br from-[#0A0A0A]/90 to-[#0A0A0A]/70 backdrop-blur-md text-white max-w-7xl mx-auto shadow-2xl rounded-2xl border border-yellow-400/20 p-4 sm:p-6 lg:p-8 group relative overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl text-white">
                  Preview Examples
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  <li className="flex items-start space-x-2">
                    <MessageSquare className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <button
                        onClick={() => setShowFeedbackForm(true)}
                        className="text-white font-medium hover:text-yellow-500 transition-colors cursor-pointer"
                      >
                        Show Feedback Form
                      </button>
                      <p className="text-gray-400 text-sm">
                        Preview the feedback form your customers will see
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <FileText className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <button
                        onClick={() => setShowSmartInvoice(true)}
                        className="text-white font-medium hover:text-yellow-500 transition-colors cursor-pointer"
                      >
                        Show Smart Invoice
                      </button>
                      <p className="text-gray-400 text-sm">
                        See how your invoices will look with feedback
                        integration
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start space-x-2">
                    <QrCode className="w-5 h-5 text-yellow-500 mt-1" />
                    <div>
                      <button
                        onClick={() => setShowQRPDF(true)}
                        className="text-white font-medium hover:text-yellow-500 transition-colors cursor-pointer"
                      >
                        Show Invoice + QR PDF
                      </button>
                      <p className="text-gray-400 text-sm">
                        Preview the PDF with QR code for feedback
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview Dialogs */}
      <Dialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <DialogContent className="custom-popup max-h-[80vh] overflow-auto max-w-2xl bg-[#0A0A0A] border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              Feedback Form Preview
            </DialogTitle>
          </DialogHeader>

          <FeedbackFormPreview />
        </DialogContent>
      </Dialog>

      <Dialog open={showSmartInvoice} onOpenChange={setShowSmartInvoice}>
        <DialogContent className="custom-popup max-w-4xl bg-[#0A0A0A] border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              Smart Invoice Preview
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[80vh] overflow-auto">
            <img
              src="/SmartInvoice_Sample.png"
              alt="Sample Smart Invoice"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showQRPDF} onOpenChange={setShowQRPDF}>
        <DialogContent className="custom-popup max-w-4xl bg-[#0A0A0A] border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              Invoice + QR PDF Preview
            </DialogTitle>
          </DialogHeader>
          <div className="relative w-full h-[80vh] overflow-auto">
            <img
              src="/UploadedInvFirstPage.png"
              alt="Sample QR PDF"
              className="w-full h-auto object-contain rounded-t-lg shadow-lg"
            />
            <img
              src="/UploadedInvSecPage.png"
              alt="Sample QR PDF"
              className="w-full h-auto object-contain rounded-b-lg shadow-lg"
            />
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GuideSection;
