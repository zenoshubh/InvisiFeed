"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Search, Star } from "lucide-react";
import LoadingScreen from "@/components/common/loading-screen";
import Link from "next/link";

export default function ShowInvoicesPage({ params }) {
  const { data: session } = useSession();
  const business = session?.user;

  const pathname = usePathname();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("newest");
  const [feedbackFilter, setFeedbackFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { getInvoices } = await import("@/fetchers/invoices");
      const result = await getInvoices({
        page: currentPage,
        limit: 10,
        sortBy,
        feedbackFilter,
        search: searchQuery,
      });
      if (result.success) {
        setInvoices(result.data.invoices);
        setTotalPages(result.data.totalPages);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentPage, sortBy, feedbackFilter, searchQuery]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleFeedbackClick = (feedback) => {
    setSelectedFeedback(feedback);
    setShowFeedbackDialog(true);
  };

  const renderFeedbackCell = (invoice) => {
    if (!invoice.isFeedbackSubmitted) {
      return <span className="text-gray-400">Not Submitted</span>;
    }

    if (invoice.feedback && invoice.feedback.isAnonymous) {
      return <span className="text-gray-400">Submitted Anonymously</span>;
    }

    if (invoice.feedback) {
      return (
        <span
          onClick={() => handleFeedbackClick(invoice.feedback)}
          className="text-yellow-400 hover:text-yellow-300 cursor-pointer"
        >
          View Feedback
        </span>
      );
    }

    return <span className="text-gray-400">No Feedback</span>;
  };

  const handleNavigation = (route) => {
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setLoading(true);
  };

  useEffect(() => {
    return () => {
      setLoading(false);
    };
  }, [pathname]);

  if (
    business?.plan?.planName === "free" ||
    business?.plan?.planEndDate < new Date()
  ) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="text-xl font-semibold text-yellow-400">
              Upgrade to Pro to View Invoices
            </span>
          </div>
          <Link href="/pricing" onClick={() => handleNavigation("/pricing")}>
            <button className="bg-yellow-400 text-[#0A0A0A] py-2 px-6 font-semibold rounded-full shadow-md hover:bg-yellow-600 focus:ring-2 focus:ring-yellow-300 transition duration-300 ease-in-out cursor-pointer">
              Subscribe to Pro
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] py-6 sm:py-12 px-3 sm:px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full bg-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/20">
          <CardHeader className="border-b border-yellow-400/20">
            <CardTitle className="text-xl sm:text-3xl text-center font-bold text-yellow-400">
              Invoices
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {/* Filters and Search */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search by invoice number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#0A0A0A] text-white border-yellow-400/20"
                  icon={<Search className="w-4 h-4 text-gray-400" />}
                />
              </div>
              <div className="flex gap-4">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px] bg-[#0A0A0A] text-white border-yellow-400/20">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={feedbackFilter}
                  onValueChange={setFeedbackFilter}
                >
                  <SelectTrigger className="w-[180px] bg-[#0A0A0A] text-white border-yellow-400/20">
                    <SelectValue placeholder="Filter by feedback" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Invoices</SelectItem>
                    <SelectItem value="submitted">With Feedback</SelectItem>
                    <SelectItem value="not-submitted">No Feedback</SelectItem>
                    <SelectItem value="anonymous">
                      Anonymous Feedback
                    </SelectItem>
                    <SelectItem value="non-anonymous">
                      Non-anonymous Feedback
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Table */}
            <div className="rounded-md border border-yellow-400/20">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-[#0A0A0A]/50">
                    <TableHead className="text-yellow-400">
                      Invoice Number
                    </TableHead>
                    <TableHead className="text-yellow-400">
                      Customer Name
                    </TableHead>
                    <TableHead className="text-yellow-400">
                      Customer Email
                    </TableHead>
                    <TableHead className="text-yellow-400">Amount</TableHead>
                    <TableHead className="text-yellow-400">Feedback</TableHead>
                    <TableHead className="text-yellow-400">
                      Created At
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-400"
                      >
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : invoices.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-400"
                      >
                        No invoices found
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow
                        key={invoice._id}
                        className="hover:bg-[#0A0A0A]/50"
                      >
                        <TableCell className="text-gray-200">
                          {invoice.invoiceId}
                        </TableCell>
                        <TableCell className="text-gray-200">
                          {invoice.customerDetails.customerName || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-200">
                          {invoice.customerDetails.customerEmail || "N/A"}
                        </TableCell>
                        <TableCell className="text-gray-200">
                          {invoice.customerDetails.amount
                            ? `₹${invoice.customerDetails.amount.toFixed(2)}`
                            : "N/A"}
                        </TableCell>
                        <TableCell>{renderFeedbackCell(invoice)}</TableCell>
                        <TableCell className="text-gray-200">
                          {format(
                            new Date(invoice.createdAt),
                            "MMM dd, yyyy hh:mm a"
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className=" bg-[#0A0A0A] border-yellow-400/20 text-yellow-500 hover:bg-yellow-500/30 rounded-full transition-all duration-100 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-gray-200">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="bg-[#0A0A0A] border-yellow-400/20 text-yellow-500 hover:bg-yellow-500/30 rounded-full transition-all duration-100 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="bg-[#0A0A0A] border-yellow-400/20 max-h-[90vh] overflow-y-auto custom-popup">
          <DialogHeader>
            <DialogTitle className="text-yellow-400">
              Customer Feedback
            </DialogTitle>
          </DialogHeader>
          {selectedFeedback && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Satisfaction</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-200">
                      {selectedFeedback.satisfactionRating}/5
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Communication</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-200">
                      {selectedFeedback.communicationRating}/5
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Quality of Service</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-200">
                      {selectedFeedback.qualityOfServiceRating}/5
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Value for Money</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-200">
                      {selectedFeedback.valueForMoneyRating}/5
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Recommendation</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-200">
                      {selectedFeedback.recommendRating}/5
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <p className="text-gray-400">Overall Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-gray-200">
                      {selectedFeedback.overAllRating}/5
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-400">Feedback</p>
                <p className="text-gray-200">
                  {selectedFeedback.feedbackContent || "No feedback provided"}
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-gray-400">Suggestions</p>
                <p className="text-gray-200">
                  {selectedFeedback.suggestionContent ||
                    "No suggestions provided"}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}
