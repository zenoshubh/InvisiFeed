import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import Image from "next/image";
import NavbarClient from "./navbar-client";

export default async function Navbar({ pathname = "/" }) {
  // SSR session check
  const session = await getServerSession(authOptions);
  const business = session?.user;

  return (
    <nav className="p-4 md:p-6 bg-[#0A0A0A] text-white shadow-lg border-b border-yellow-400/10">
      <NavbarClient>
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo/Brand Name */}
          <Link href="/" className="flex items-center gap-2 cursor-pointer">
            <span className="text-2xl font-bold text-yellow-400 cursor-pointer">
              InvisiFeed
            </span>
          </Link>

          {/* Navigation Links - Desktop */}
          <div className="hidden md:flex flex-row gap-6 absolute left-1/2 -translate-x-1/2">
            {pathname === "/" ||
            pathname === "/pricing" ||
            pathname === "/purpose" ||
            pathname === "/guide" ||
            pathname === "/privacy-policy" ||
            pathname === "/terms-of-service" ? (
              <>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Home
                </Link>
                <Link
                  href="/purpose"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Purpose
                </Link>
                <Link
                  href="/guide"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Guide
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Pricing
                </Link>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof document !== "undefined") {
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Contact
                </span>
              </>
            ) : business ? (
              <>
                <Link
                  href={`/user/${business?.username}/generate`}
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Generate
                </Link>
                <Link
                  href={`/user/${business?.username}/dashboard`}
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Dashboard
                </Link>
                <Link
                  href={`/user/${business?.username}/feedbacks`}
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Feedbacks
                </Link>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof document !== "undefined") {
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Contact
                </span>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Home
                </Link>
                <Link
                  href="/purpose"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Purpose
                </Link>
                <Link
                  href="/guide"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Guide
                </Link>
                <Link
                  href="/pricing"
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Pricing
                </Link>
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    if (typeof document !== "undefined") {
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  className="text-gray-300 hover:text-yellow-400 transition-colors cursor-pointer"
                >
                  Contact
                </span>
              </>
            )}
          </div>

          {/* SSR UserNav */}
          {!business ? (
            <Link href="/sign-in">
              <button className="hidden md:flex bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium shadow-lg shadow-yellow-500/20 cursor-pointer min-w-[120px] px-4 py-2 rounded">
                Get Started
              </button>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Image
                src={business.image || "/avatar.png"}
                alt="avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
              <span className="text-white">{business.name || business.username}</span>
              <Link href={`/user/${business.username}/dashboard`}>
                <button className="ml-2 px-3 py-1 bg-yellow-400 text-black rounded">
                  Dashboard
                </button>
              </Link>
            </div>
          )}
        </div>
      </NavbarClient>
    </nav>
  );
}
