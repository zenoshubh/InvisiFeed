import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { signOut, useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { usePathname } from "next/navigation";
import {
  Loader2,
  UserCircle2,
  User,
  Ticket,
  LogOut,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import GSTINVerificationDialog from "@/components/business-page-components/gstin-verification-dialog";
import LoadingScreen from "@/components/common/loading-screen";
import { MdMoney } from "react-icons/md";
import { SubscriptionPopup } from "@/components/modals/subscription-popup";
import { Lock } from "lucide-react";
import Link from "next/link";

function UserNav({ isMobile = false }) {
  const { data: session, status } = useSession();
  const business = session?.user;
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isNavigatingToSignIn, setIsNavigatingToSignIn] = useState(false);
  const [isSubscriptionPopupOpen, setIsSubscriptionPopupOpen] = useState(false);

  const [isGSTINDialogOpen, setIsGSTINDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Added state for controlling dropdown
  const [loading, setLoading] = useState(false);

  const handleNavigation = (route) => {
    if (route === pathname) {
      // Same route, no loading screen
      return;
    }
    setLoading(true);
  };

  const onManageProfile = () => {
    handleNavigation(`/user/${business?.username}/update-profile`);
  };

  const onManageInvoice = () => {
    handleNavigation(`/user/${business?.username}/show-invoices`);
  };

  const onManageCoupons = () => {
    handleNavigation(`/user/${business?.username}/manage-coupons`);
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setLoading(true); // Start loading state
    setIsDropdownOpen(false); // Close dropdown
    await signOut({ redirect: true, callbackUrl: "/sign-in" });
  };

  // const handleGetStarted = () => {
  //   setIsNavigatingToSignIn(true);

  //   setIsDropdownOpen(false); // Close dropdown

  // };

  const handleUsernameClick = () => {
    setIsDropdownOpen(false); // Close dropdown
    handleNavigation(`/user/${business?.username}/generate`);
  };

  const pathname = usePathname();

  useEffect(() => {
    return () => {
      setIsSubscriptionPopupOpen(false);
      setLoading(false);
    };
  }, [pathname]);

  if (loading) {
    return <LoadingScreen />;
  }

  // Show "Get Started" even if status is "loading"
  if (!business) {
    return (
      <Link href="/sign-in">
        <Button
          className={`${
            isMobile ? "" : "hidden md:flex"
          } bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px]`}
        >
          Get Started
        </Button>
      </Link>
    );
  }

  return (
    <>
      <div className="flex items-center space-x-4">
        <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
          <DropdownMenuTrigger asChild>
            <button className="focus:outline-none">
              <Avatar className="cursor-pointer border-2 border-yellow-400 hover:border-yellow-300 transition-colors ring-2 ring-transparent hover:ring-yellow-400/20">
                <AvatarFallback className="bg-[#0A0A0A] text-yellow-400">
                  <UserCircle2 className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-[#0A0A0A] border border-yellow-400/10 rounded-lg shadow-lg shadow-yellow-500/10"
            align="end"
          >
            <div className="flex items-center justify-start p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <Link
                  href={`/user/${business?.username}/generate`}
                  className="font-medium text-yellow-400 cursor-pointer"
                  onClick={handleUsernameClick} // Close dropdown when username is clicked
                >
                  {business?.username}
                </Link>
                <p className="text-sm text-gray-400">{business?.email}</p>
              </div>
            </div>
            <DropdownMenuSeparator className="bg-yellow-400/10" />
            <Link
              href={`/user/${business?.username}/update-profile`}
              onClick={onManageProfile}
            >
              <DropdownMenuItem className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer">
                <User className="mr-2 h-4 w-4 text-yellow-400" />
                <span>Manage Profile</span>
              </DropdownMenuItem>
            </Link>

            <Link
              href={`/user/${business?.username}/show-invoices`}
              onClick={(e) => {
                if (
                  business?.plan?.planName === "free" ||
                  business?.plan?.planEndDate < new Date()
                ) {
                  e.preventDefault();
                  setIsSubscriptionPopupOpen(true);
                } else {
                  onManageInvoice();
                }
              }}
            >
              <DropdownMenuItem
                className={`text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer ${
                  business?.plan?.planName === "free" ? "relative" : ""
                }`}
              >
                <Receipt className="mr-2 h-4 w-4 text-yellow-400" />
                <span>Show Invoices</span>
                {(business?.plan?.planName === "free" ||
                  business?.plan?.planEndDate < new Date()) && (
                  <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
              </DropdownMenuItem>
            </Link>

            <Link
              href={`/user/${business?.username}/manage-coupons`}
              onClick={(e) => {
                if (
                  business?.plan?.planName === "free" ||
                  business?.plan?.planEndDate < new Date()
                ) {
                  e.preventDefault();
                  setIsSubscriptionPopupOpen(true);
                } else {
                  onManageCoupons();
                }
              }}
            >
              <DropdownMenuItem
                className={`text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer ${
                  business?.plan?.planName === "free" ? "relative" : ""
                }`}
              >
                <Ticket className="mr-2 h-4 w-4 text-yellow-400" />
                <span>Manage Coupons</span>
                {(business?.plan?.planName === "free" ||
                  business?.plan?.planEndDate < new Date()) && (
                  <Lock className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                )}
              </DropdownMenuItem>
            </Link>

            {!business?.gstinDetails?.gstinVerificationStatus && (
              <DropdownMenuItem
                className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer"
                onClick={() => setIsGSTINDialogOpen(true)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4 text-yellow-400" />
                <span>Verify GSTIN</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator className="bg-yellow-400/10" />
            <DropdownMenuItem
              className="text-gray-300 hover:text-yellow-400 hover:bg-yellow-400/5 focus:bg-yellow-400/5 focus:text-yellow-400 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4 text-yellow-400" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <GSTINVerificationDialog
          open={isGSTINDialogOpen}
          onOpenChange={setIsGSTINDialogOpen}
        />
      </div>

      <SubscriptionPopup
        isOpen={isSubscriptionPopupOpen}
        onClose={() => setIsSubscriptionPopupOpen(false)}
      />
    </>
  );
}

export default UserNav;
