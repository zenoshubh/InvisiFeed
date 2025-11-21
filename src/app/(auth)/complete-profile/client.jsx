"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import { useRouter } from "next/navigation";
import { Country, State, City } from "country-state-city";
import { motion } from "motion/react";
import { useSession, Session } from "next-auth/react"; // Import Session type
import MobileLogo from "@/components/layout/mobile-logo";
import GSTINVerificationDialog from "@/components/owner-page-components/gstin-verification-dialog";
import {
  completeUserProfile,
  skipProfileCompletion,
} from "@/actions/auth/profile-management";
import LoadingScreen from "@/components/common/loading-screen";
import { clientFormSchema } from "@/schemas/profile/complete-profile";

function ProfileCompletionForm({ initialSession }) {
  // ✅ Move ALL hooks to the top first
  const [isNavigatingToUserPage, setIsNavigatingToUserPage] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null); // "complete" | "skip" | null
  const router = useRouter();
  const {
    data: session,
    status,
    update,
  } = useSession({
    initialData: initialSession,
    required: false,
  });

  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [localAddress, setLocalAddress] = useState("");
  const [pincode, setPincode] = useState("");

  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const countryRef = useRef(null);
  const stateRef = useRef(null);
  const cityRef = useRef(null);

  const [searchCountry, setSearchCountry] = useState("");
  const [searchState, setSearchState] = useState("");
  const [searchCity, setSearchCity] = useState("");

  // Client-side validation state
  const [clientErrors, setClientErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [showValidation, setShowValidation] = useState(false);

  const [isGSTINDialogOpen, setIsGSTINDialogOpen] = useState(false);
  console.log(session);
  // No server-side redirect here—handled in parent server component

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryRef.current && !countryRef.current.contains(event.target)) {
        setIsCountryOpen(false);
      }
      if (stateRef.current && !stateRef.current.contains(event.target)) {
        setIsStateOpen(false);
      }
      if (cityRef.current && !cityRef.current.contains(event.target)) {
        setIsCityOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch Countries using country-state-city
  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
  }, []);

  // Fetch states based on country
  useEffect(() => {
    if (selectedCountry) {
      const countryData = countries.find(
        (country) => country.name === selectedCountry
      );
      if (countryData) {
        const fetchedStates = State.getStatesOfCountry(countryData.isoCode);
        setStates(fetchedStates);
        setSelectedState("");
        setSelectedCity("");
        setCities([]);
      }
    }
  }, [selectedCountry, countries]);

  // Fetch cities based on state
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const countryData = countries.find(
        (country) => country.name === selectedCountry
      );
      const stateData = states.find((state) => state.name === selectedState);

      if (countryData && stateData) {
        const fetchedCities = City.getCitiesOfState(
          countryData.isoCode,
          stateData.isoCode
        );
        setCities(fetchedCities);
        setSelectedCity("");
      }
    }
  }, [selectedState, selectedCountry, states, countries]);

  // Filter functions
  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchCountry.toLowerCase())
  );

  const filteredStates = states.filter((state) =>
    state.name.toLowerCase().includes(searchState.toLowerCase())
  );

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchCity.toLowerCase())
  );

  // Form Setup - simplified for client-side validation only
  const form = useForm({
    resolver: zodResolver(clientFormSchema),
    mode: "onSubmit",
    defaultValues: {
      businessName: session?.user?.businessName || "",
      phoneNumber: "",
    },
  });

  // Update form when session is loaded
  useEffect(() => {
    if (session?.user) {
      form.setValue("businessName", session.user.businessName || "");
    }
  }, [session, form]);

  // Client-side validation function
  const validateAllFields = () => {
    const errors = {};

    // Basic form validation
    const formData = form.getValues();
    if (!formData.businessName?.trim() && !session?.user?.businessName) {
      errors.businessName = ["Business name is required"];
    }
    if (
      !formData.phoneNumber?.trim() ||
      formData.phoneNumber?.length < 10 ||
      formData.phoneNumber.length > 10
    ) {
      errors.phoneNumber = ["Enter a valid phone number"];
    }

    // Address validation
    if (!selectedCountry?.trim()) {
      errors.country = ["Country is required"];
    }
    if (!selectedState?.trim()) {
      errors.state = ["State is required"];
    }
    if (!selectedCity?.trim()) {
      errors.city = ["City is required"];
    }
    if (!localAddress?.trim()) {
      errors.localAddress = ["Local address is required"];
    }
    if (!pincode?.trim()) {
      errors.pincode = ["Pincode is required"];
    }

    setClientErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission with server action
  const handleSubmit = async (formData) => {
    setLoadingAction("complete");
    setShowValidation(true);
    setServerErrors({});
    setIsNavigatingToUserPage(false);

    try {
      const isValid = validateAllFields();
      if (!isValid) {
        setLoadingAction(null);
        return;
      }

      const submitData = new FormData();
      submitData.append("businessName", formData.businessName);
      submitData.append("phoneNumber", formData.phoneNumber);
      submitData.append("localAddress", localAddress);
      submitData.append("city", selectedCity);
      submitData.append("state", selectedState);
      submitData.append("country", selectedCountry);
      submitData.append("pincode", pincode);

      setClientErrors({});

      const result = await completeUserProfile({}, submitData);

      if (result.success) {
        toast.success(result.message);
        setIsNavigatingToUserPage(true);

        // Update session and then redirect
        await update({
          ...session,
          user: {
            ...session.user,
            businessName: result.updatedUser.businessName,
            phoneNumber: result.updatedUser.phoneNumber,
            address: result.updatedUser.address,
            isProfileCompleted: result.profileStatus,
          },
        });

        // Direct redirect without waiting for useEffect
        router.replace(`/user/${session?.user?.username}/generate`);
      } else {
        toast.error(result.message || "Failed to complete profile");
        setServerErrors(result.errors || {});
        setShowValidation(true);
      }
    } catch (error) {
      console.error("Profile completion error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoadingAction(null);
      setIsSubmitting(false);
    }
  };

  // Handle "I'll do it later" button click
  const handleSkipProfile = async () => {
    setLoadingAction("skip");
    setShowValidation(false);
    setClientErrors({});
    setServerErrors({});

    try {
      const result = await skipProfileCompletion({});

      if (result.success) {
        toast.success(result.message);
        setIsNavigatingToUserPage(true);

        // Update the session to reflect the new profile status
        await update({
          ...session,
          user: {
            ...session.user,
            isProfileCompleted: result.profileStatus,
          },
        });

        // Direct redirect
        router.push(`/user/${session?.user?.username}/generate`);
      } else {
        toast.error(result.message || "Failed to skip profile completion");
      }
    } catch (error) {
      console.error("Skip profile error:", error);
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoadingAction(null);
    }
  };

  // Get error message for a field (server errors take precedence)
  const getFieldError = (fieldName) => {
    const serverError = serverErrors[fieldName]?.[0];
    const clientError = clientErrors[fieldName]?.[0];
    return showValidation ? serverError || clientError : null;
  };
  // But keep loading check for hydration
  if (status === "loading" || isNavigatingToUserPage) {
    return <LoadingScreen />;
  }
  return (
    <>
      <Toaster position="top-center" richColors />
      {/* Main Content Section */}
      <div className="w-full flex flex-col items-center p-6 pb-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <MobileLogo />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full space-y-4"
          >
            <div className="text-center">
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Complete Your Profile
              </h1>
              <p className="mt-1 text-sm text-gray-400">
                We need a few more details to set up your account
              </p>
            </div>

            <div className="flex justify-center mb-4">
              <Button
                onClick={() => {
                  if (!session?.user?.gstinDetails?.gstinVerificationStatus) {
                    setIsGSTINDialogOpen(true);
                  }
                }}
                disabled={session?.user?.gstinDetails?.gstinVerificationStatus}
                className={`${
                  session?.user?.gstinDetails?.gstinVerificationStatus
                    ? "bg-green-500/20 text-green-400 border-green-400/30 cursor-not-allowed"
                    : "bg-transparent hover:bg-yellow-400/10 text-yellow-400 border-yellow-400/20"
                } font-medium px-4 py-2 rounded-full transition-all duration-200`}
              >
                {session?.user?.gstinDetails?.gstinVerificationStatus ? (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    GSTIN Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    Verify GSTIN
                  </div>
                )}
              </Button>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="space-y-4"
              >
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter Business Name"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (showValidation) {
                                  validateAllFields();
                                }
                              }}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none rounded-md"
                            />
                            {getFieldError("businessName") && (
                              <p className="text-[11px] text-red-500 mt-1">
                                {getFieldError("businessName")}
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter Phone Number"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e);
                                if (showValidation) {
                                  validateAllFields();
                                }
                              }}
                              className="bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none rounded-md"
                            />
                            {getFieldError("phoneNumber") && (
                              <p className="text-[11px] text-red-500 mt-1">
                                {getFieldError("phoneNumber")}
                              </p>
                            )}
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Country Dropdown */}
                  <div className="relative" ref={countryRef}>
                    <div
                      onClick={() => setIsCountryOpen(!isCountryOpen)}
                      className="w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 outline-none"
                    >
                      <span
                        className={
                          selectedCountry ? "text-white" : "text-gray-400"
                        }
                      >
                        {selectedCountry || "Select Country"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${
                          isCountryOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {getFieldError("country") && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {getFieldError("country")}
                      </p>
                    )}
                    {isCountryOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A]/95 backdrop-blur-md border border-yellow-400/10 rounded-md shadow-lg shadow-black/20 max-h-60 overflow-hidden">
                        <div className="sticky top-0 bg-[#0A0A0A]/95 p-2 border-b border-yellow-400/10">
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={searchCountry}
                            onChange={(e) => setSearchCountry(e.target.value)}
                            className="w-full p-1.5 text-sm bg-[#0A0A0A]/50 border border-yellow-400/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/30"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent">
                          {filteredCountries.map((country) => (
                            <div
                              key={country.isoCode}
                              onClick={() => {
                                setSelectedCountry(country.name);
                                setIsCountryOpen(false);
                                setSearchCountry("");
                                if (showValidation) {
                                  validateAllFields();
                                }
                              }}
                              className={`px-3 py-2 cursor-pointer text-white hover:bg-yellow-400/10 transition-all duration-150 border-b border-yellow-400/5 last:border-0 ${
                                selectedCountry === country.name
                                  ? "bg-yellow-400/20"
                                  : ""
                              }`}
                            >
                              {country.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* State Dropdown */}
                  <div className="relative" ref={stateRef}>
                    <div
                      onClick={() =>
                        selectedCountry && setIsStateOpen(!isStateOpen)
                      } // Fixed: Removed extra ||
                      className={`w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 outline-none ${
                        !selectedCountry ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className={
                          selectedState ? "text-white" : "text-gray-400"
                        }
                      >
                        {selectedState || "Select State"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${
                          isStateOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {getFieldError("state") && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {getFieldError("state")}
                      </p>
                    )}
                    {isStateOpen && states.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A]/95 backdrop-blur-md border border-yellow-400/10 rounded-md shadow-lg shadow-black/20 max-h-60 overflow-hidden">
                        <div className="sticky top-0 bg-[#0A0A0A]/95 p-2 border-b border-yellow-400/10">
                          <input
                            type="text"
                            placeholder="Search state..."
                            value={searchState}
                            onChange={(e) => setSearchState(e.target.value)}
                            className="w-full p-1.5 text-sm bg-[#0A0A0A]/50 border border-yellow-400/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/30"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent">
                          {filteredStates.map((state) => (
                            <div
                              key={state.isoCode}
                              onClick={() => {
                                setSelectedState(state.name);
                                setIsStateOpen(false);
                                setSearchState("");
                                if (showValidation) {
                                  validateAllFields();
                                }
                              }}
                              className={`px-3 py-2 cursor-pointer text-white hover:bg-yellow-400/10 transition-all duration-150 border-b border-yellow-400/5 last:border-0 ${
                                selectedState === state.name
                                  ? "bg-yellow-400/20"
                                  : ""
                              }`}
                            >
                              {state.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* City Dropdown */}
                  <div className="relative" ref={cityRef}>
                    <div
                      onClick={() =>
                        selectedState && setIsCityOpen(!isCityOpen)
                      } // Fixed similarly
                      className={`w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 cursor-pointer h-9 flex items-center justify-between hover:border-yellow-400/30 transition-all duration-200 outline-none ${
                        !selectedState ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                    >
                      <span
                        className={
                          selectedCity ? "text-white" : "text-gray-400"
                        }
                      >
                        {selectedCity || "Select City"}
                      </span>
                      <svg
                        className={`w-4 h-4 text-yellow-400/50 transition-transform duration-200 ${
                          isCityOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                    {getFieldError("city") && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {getFieldError("city")}
                      </p>
                    )}
                    {isCityOpen && cities.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-[#0A0A0A]/95 backdrop-blur-md border border-yellow-400/10 rounded-md shadow-lg shadow-black/20 max-h-60 overflow-hidden">
                        <div className="sticky top-0 bg-[#0A0A0A]/95 p-2 border-b border-yellow-400/10">
                          <input
                            type="text"
                            placeholder="Search city..."
                            value={searchCity}
                            onChange={(e) => setSearchCity(e.target.value)}
                            className="w-full p-1.5 text-sm bg-[#0A0A0A]/50 border border-yellow-400/10 rounded text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400/30"
                            autoFocus
                          />
                        </div>
                        <div className="overflow-auto max-h-[200px] scrollbar-thin scrollbar-thumb-yellow-400/20 scrollbar-track-transparent">
                          {filteredCities.map((city) => (
                            <div
                              key={city.name}
                              onClick={() => {
                                setSelectedCity(city.name);
                                setIsCityOpen(false);
                                setSearchCity("");
                                if (showValidation) {
                                  validateAllFields();
                                }
                              }}
                              className={`px-3 py-2 cursor-pointer text-white hover:bg-yellow-400/10 transition-all duration-150 border-b border-yellow-400/5 last:border-0 ${
                                selectedCity === city.name
                                  ? "bg-yellow-400/20"
                                  : ""
                              }`}
                            >
                              {city.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Local Address */}
                  <div className="relative">
                    <Input
                      value={localAddress}
                      onChange={(e) => {
                        setLocalAddress(e.target.value);
                        if (showValidation) {
                          validateAllFields();
                        }
                      }}
                      placeholder="Enter Local Address"
                      className="w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none"
                    />
                    {getFieldError("localAddress") && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {getFieldError("localAddress")}
                      </p>
                    )}
                  </div>

                  {/* Pincode */}
                  <div className="relative">
                    <Input
                      value={pincode}
                      onChange={(e) => {
                        setPincode(e.target.value);
                        if (showValidation) {
                          validateAllFields();
                        }
                      }}
                      placeholder="Enter Pincode"
                      className="w-full p-2 border rounded-md bg-[#0A0A0A]/50 backdrop-blur-sm text-white border-yellow-400/10 focus:border-yellow-400 h-9 outline-none"
                    />
                    {getFieldError("pincode") && (
                      <p className="text-[11px] text-red-500 mt-1">
                        {getFieldError("pincode")}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      type="submit"
                      disabled={loadingAction !== null}
                      className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 hover:from-yellow-600 hover:to-yellow-500 text-gray-900 font-medium cursor-pointer h-9 shadow-lg shadow-yellow-500/20"
                    >
                      {loadingAction === "complete" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Completing profile...
                        </>
                      ) : (
                        "Complete Profile"
                      )}
                    </Button>

                    <Button
                      type="button"
                      onClick={handleSkipProfile}
                      disabled={loadingAction !== null}
                      className="w-full bg-transparent hover:bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 font-medium cursor-pointer h-9"
                    >
                      {loadingAction === "skip" ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Skipping profile...
                        </>
                      ) : (
                        "I'll do it later"
                      )}
                    </Button>
                  </div>
                </motion.div>
              </form>
            </Form>
          </motion.div>
        </div>
      </div>

      <GSTINVerificationDialog
        open={isGSTINDialogOpen}
        onOpenChange={setIsGSTINDialogOpen}
      />
    </>
  );
}

export default ProfileCompletionForm;
