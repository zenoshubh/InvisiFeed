"use client";

import { useRouter } from "next/navigation";

export default function MobileLogo() {
  const router = useRouter();

  return (
    <div className="lg:hidden flex justify-center items-center py-4">
      <h1
        className="text-3xl font-bold  text-yellow-400 cursor-pointer"
        onClick={() => router.push("/")}
      >
        InvisiFeed
      </h1>
    </div>
  );
}
