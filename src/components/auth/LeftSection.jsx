import Link from "next/link";

export default function LeftSection({ handleNavigation }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#0A0A0A] to-[#000000] p-8 flex-col justify-center items-center text-white">
      <div className="max-w-md space-y-4">
        <Link
          href="/"
          onClick={() => handleNavigation && handleNavigation("/")}
        >
          <h1 className="text-4xl font-extrabold tracking-tight cursor-pointer">
            InvisiFeed
          </h1>
        </Link>
        <p className="text-lg text-gray-200">
          Transform your business with honest feedback
        </p>
        <div className="space-y-3 mt-4">
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p>Secure and honest feedback system</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p>Real-time insights and analytics</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <p>Build a culture of trust and transparency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
