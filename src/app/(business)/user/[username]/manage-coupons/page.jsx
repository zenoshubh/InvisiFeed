"use client";

import { useState, useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { MdDelete } from "react-icons/md";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { getCoupons } from "@/fetchers/coupons";
import { deleteCoupon } from "@/actions/coupon";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import LoadingScreen from "@/components/common/loading-screen";
import Link from "next/link";

export default function ManageCoupons() {
  const { data: session } = useSession();
  const business = session?.user;
  const pathname = usePathname();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCoupon, setExpandedCoupon] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleting, setDeleting] = useState(false);
  const couponsPerPage = 10;

  useEffect(() => {
    if (business?.username) {
      fetchCoupons();
    }
  }, [business?.username]);

  const fetchCoupons = async () => {
    try {
      const result = await getCoupons();
      if (result?.success) {
        setCoupons(result.data.coupons);
        return;
      } else {
        toast.error(result.message || "Failed to fetch coupons");
      }
    } catch (error) {
      toast.error("Failed to fetch coupons");
      console.error("Error fetching coupons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    try {
      setDeleting(true);
      const result = await deleteCoupon(coupon.invoiceId);
      if (result?.success) {
        toast.success(result.message || "Coupon marked as used successfully");
        setCoupons(coupons.filter((c) => c.invoiceId !== coupon.invoiceId));
        setShowDeleteDialog(false);
      } else {
        toast.error(result.message || "Failed to delete coupon");
      }
    } catch (error) {
      toast.error("Failed to delete coupon");
      console.error("Error deleting coupon:", error);
    } finally {
      setDeleting(false);
    }
  };

  // Filter coupons based on search query
  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) =>
      coupon.couponCode.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [coupons, searchQuery]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCoupons.length / couponsPerPage);
  const startIndex = (currentPage - 1) * couponsPerPage;
  const paginatedCoupons = filteredCoupons.slice(
    startIndex,
    startIndex + couponsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
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

  if (loading) {
    return <LoadingScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center gap-2 text-yellow-400">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-yellow-400"></div>
          <span>Loading coupons...</span>
        </div>
      </div>
    );
  }

  if (
    business?.plan?.planName === "free" ||
    business?.plan?.planEndDate < new Date()
  ) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
        <div className="text-center flex flex-col gap-6">
          <div className="flex flex-col items-center gap-4">
            <span className="text-xl font-semibold text-yellow-400">
              Upgrade to Pro to manage coupons
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
    <div className="min-h-screen bg-[#0A0A0A] pt-16 sm:pt-10 md:pt-12 px-3 sm:px-4 md:px-6">
      <div className="w-full max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl text-center sm:text-3xl font-bold bg-gradient-to-r from-yellow-500 to-yellow-400 bg-clip-text text-transparent">
            Manage Coupons
          </h1>
          <p className="text-sm text-center sm:text-base text-gray-400 mt-1.5 sm:mt-2">
            View and manage all your active coupons
          </p>
        </motion.div>

        <Card className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border-yellow-400/10 hover:border-yellow-400/20 transition-colors group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-yellow-400">Coupon List</CardTitle>
                <div className="relative w-40 sm:w-48 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search coupon code..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1); // Reset to first page on search
                    }}
                    className="pl-10 bg-[#0A0A0A] border-yellow-400/20 text-gray-300 placeholder:text-gray-500 focus:border-yellow-400/40"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredCoupons.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No coupons found</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:gap-4">
                    {paginatedCoupons.map((coupon) => (
                      <div
                        key={coupon.invoiceId}
                        className="bg-gradient-to-br from-[#0A0A0A]/80 to-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/10 rounded-lg overflow-hidden hover:border-yellow-400/20 transition-colors group relative"
                      >
                        <div
                          className="p-4 cursor-pointer flex items-center justify-between"
                          onClick={() =>
                            setExpandedCoupon(
                              expandedCoupon === coupon.invoiceId
                                ? null
                                : coupon.invoiceId
                            )
                          }
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-yellow-400/10 text-yellow-400 px-3 py-1 rounded-full text-xs font-medium border border-yellow-400/20 md:text-sm">
                              {coupon.couponCode}
                            </div>
                            <span className="text-gray-300 text-xs md:text-lg">
                              Invoice: {coupon.invoiceId}
                            </span>
                          </div>
                          <div className="flex items-center gap-4">
                            {coupon.isUsed ? (
                              <span className="text-green-400 text-sm font-medium">
                                Used
                              </span>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCouponToDelete(coupon);
                                  setShowDeleteDialog(true);
                                }}
                                className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              >
                                <MdDelete className="w-5 h-5" />
                              </button>
                            )}
                            {expandedCoupon === coupon.invoiceId ? (
                              <IoIosArrowUp className="w-5 h-5 text-yellow-400" />
                            ) : (
                              <IoIosArrowDown className="w-5 h-5 text-yellow-400" />
                            )}
                          </div>
                        </div>

                        <AnimatePresence>
                          {expandedCoupon === coupon.invoiceId && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="border-t border-yellow-400/10"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 px-5 py-2">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-400">
                                    Description
                                  </h3>
                                  <p className="mt-1 text-gray-300">
                                    {coupon.description}
                                  </p>
                                </div>
                                <div>
                                  <h3 className="text-sm font-medium text-gray-400">
                                    Expiry Date
                                  </h3>
                                  <p className="mt-1 text-gray-300">
                                    {new Date(
                                      coupon.expiryDate
                                    ).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="mt-6 flex items-center justify-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Previous
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                              currentPage === page
                                ? "bg-yellow-400/20 text-yellow-400 border border-yellow-400/30"
                                : "text-gray-300 hover:text-yellow-400"
                            }`}
                          >
                            {page}
                          </button>
                        )
                      )}
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded-md text-sm font-medium text-gray-300 hover:text-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0A0A0A]/80 border border-yellow-400/10 rounded-lg p-3 sm:p-4 relative group">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">
              Confirm Delete
            </h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to mark this coupon as used? This action
              cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCoupon(couponToDelete)}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
