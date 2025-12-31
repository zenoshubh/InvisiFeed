"use client";
import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { updateProfile } from "@/actions/profile";
import { deleteAccount } from "@/actions/data-management";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";
import { useWatch } from "react-hook-form";
import { motion } from "motion/react";
import { updateProfileSchema as formSchema } from "@/schemas/profile/update-profile";

function UpdateProfileClient({ initialBusiness }) {
  const { data: session, update } = useSession();
  const business = session?.user || initialBusiness;

  const [saving, setSaving] = useState(false);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [locationDataLoaded, setLocationDataLoaded] = useState(false);
  const router = useRouter();

  // Initialize form with initialBusiness data
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: initialBusiness?.businessName || "",
      phoneNumber: initialBusiness?.phoneNumber || "",
      address: initialBusiness?.address ? {
        country: initialBusiness.address.country || "",
        state: initialBusiness.address.state || "",
        city: initialBusiness.address.city || "",
        localAddress: initialBusiness.address.localAddress || "",
        pincode: initialBusiness.address.pincode || "",
      } : {
        country: "",
        state: "",
        city: "",
        localAddress: "",
        pincode: "",
      },
    },
  });

  // Fetch location data (countries, states, cities)
  useEffect(() => {
    const fetchLocationData = async () => {
      try {
        // Fetch countries
        const fetchedCountries = Country.getAllCountries();
        setCountries(fetchedCountries);

        const businessData = session?.user || initialBusiness;

        // If user has country selected, fetch states
        if (businessData?.address?.country) {
          const countryCode = fetchedCountries.find(
            (c) => c.name === businessData.address.country
          )?.isoCode;

          if (countryCode) {
            const fetchedStates = State.getStatesOfCountry(countryCode);
            setStates(fetchedStates);

            // If user has state selected, fetch cities
            if (businessData?.address?.state) {
              const stateCode = fetchedStates.find(
                (s) => s.name === businessData.address.state
              )?.isoCode;

              if (stateCode) {
                const fetchedCities = City.getCitiesOfState(
                  countryCode,
                  stateCode
                );
                setCities(fetchedCities);
              }
            }
          }
        }

        setLocationDataLoaded(true);
      } catch (error) {
        console.error("Error fetching location data:", error);
        setLocationDataLoaded(true);
      }
    };

    fetchLocationData();
  }, [session?.user, initialBusiness]);

  // Update form values when business data or location data is ready
  useEffect(() => {
    if (!locationDataLoaded) return;

    const businessData = session?.user || initialBusiness;
    
    if (businessData) {
      // Reset form with all business data
      form.reset({
        businessName: businessData.businessName || "",
        phoneNumber: businessData.phoneNumber || "",
        address: businessData.address ? {
          country: businessData.address.country || "",
          state: businessData.address.state || "",
          city: businessData.address.city || "",
          localAddress: businessData.address.localAddress || "",
          pincode: businessData.address.pincode || "",
        } : {
          country: "",
          state: "",
          city: "",
          localAddress: "",
          pincode: "",
        },
      });

      // Explicitly set address fields to ensure they're displayed
      // This is especially important for city, localAddress, and pincode
      if (businessData.address) {
        if (businessData.address.city) {
          form.setValue("address.city", businessData.address.city, { shouldValidate: false });
        }
        if (businessData.address.localAddress) {
          form.setValue("address.localAddress", businessData.address.localAddress, { shouldValidate: false });
        }
        if (businessData.address.pincode) {
          form.setValue("address.pincode", businessData.address.pincode, { shouldValidate: false });
        }
      }
    }
  }, [locationDataLoaded, session?.user, initialBusiness, form]);

  const handleCountryChange = (countryName) => {
    const countryCode = countries.find((c) => c.name === countryName)?.isoCode;
    if (countryCode) {
      const fetchedStates = State.getStatesOfCountry(countryCode);
      setStates(fetchedStates);
      form.setValue("address.country", countryName);
      form.setValue("address.state", "");
      form.setValue("address.city", "");
      form.setValue("address.localAddress", "");
      form.setValue("address.pincode", "");
    }
  };

  const handleStateChange = (stateName) => {
    const countryCode = countries.find(
      (c) => c.name === form.getValues("address.country")
    )?.isoCode;
    const stateCode = states.find((s) => s.name === stateName)?.isoCode;

    if (countryCode && stateCode) {
      const fetchedCities = City.getCitiesOfState(countryCode, stateCode);
      setCities(fetchedCities);
      form.setValue("address.state", stateName);
      form.setValue("address.city", "");
      form.setValue("address.localAddress", "");
      form.setValue("address.pincode", "");
    }
  };

  const handleCityChange = (cityName) => {
    form.setValue("address.city", cityName);
    form.setValue("address.localAddress", "");
    form.setValue("address.pincode", "");
  };

  const handleSaveProfile = async (data) => {
    const payload = {
      data,
    };

    try {
      setSaving(true);

      const result = await updateProfile(payload.data);

      if (result.success) {
        // Update session with new data (ensure all fields are serializable)
        // Convert id to string if it's an ObjectId
        const userId = result.data.user.id 
          ? (typeof result.data.user.id === 'object' && result.data.user.id.toString ? result.data.user.id.toString() : String(result.data.user.id))
          : (typeof session.user.id === 'object' && session.user.id.toString ? session.user.id.toString() : String(session.user.id));
        
        await update({
          user: {
            id: userId,
            email: session.user.email,
            username: session.user.username,
            businessName:
              result.data.user.businessName || session.user.businessName,
            phoneNumber: result.data.user.phoneNumber || session.user.phoneNumber,
            address: result.data.user.address || session.user.address,
            isProfileCompleted: result.data.user.isProfileCompleted || session.user.isProfileCompleted,
            gstinDetails: session.user.gstinDetails,
            plan: session.user.plan,
            proTrialUsed: session.user.proTrialUsed,
          },
        });

        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] =
    useState(false);

  const showDeleteAccountModal = () => {
    setIsDeleteAccountModalOpen(true);
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const result = await deleteAccount();
    if (result.success) {
      toast.success(result.message);
      setIsDeletingAccount(false);
      signOut();
    } else {
      toast.error(result.message || "Failed to delete account");
      setIsDeletingAccount(false);
    }
  };

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  // Watch for changes in form values
  const watchedValues = useWatch({
    control: form.control,
  });

  // Function to compare form values with `business`
  const isFormUnchanged = (formData, businessData) => {
    return JSON.stringify(formData) === JSON.stringify(businessData);
  };

  // Use effect to enable/disable the save button based on changes
  useEffect(() => {
    const currentFormValues = form.getValues();
    if (business) {
      const unchanged = isFormUnchanged(currentFormValues, business);
      setIsSaveDisabled(unchanged);
    }
  }, [watchedValues, business]);

  return (
    <>
      <div className="min-h-screen bg-[#0A0A0A] py-8 px-4 sm:px-6 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl shadow-lg shadow-yellow-400/5">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                  Your Profile
                </h1>
                <p className="text-gray-400">
                  View and update your profile information below.
                </p>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSaveProfile)}
                  className="space-y-6"
                >
                  {/* Business Name */}
                  <FormField
                    control={form.control}
                    name="businessName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Business Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter Business Name"
                            className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Phone Number */}
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-200">
                          Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="tel"
                            placeholder="Enter Phone Number"
                            className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Address Information */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-gray-200 text-lg">
                        Address Information
                      </FormLabel>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {/* Country */}
                      <FormField
                        control={form.control}
                        name="address.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">
                              Country
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={handleCountryChange}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                                  <SelectValue placeholder="Select Country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                                {countries.map((country) => (
                                  <SelectItem
                                    key={country.isoCode}
                                    value={country.name}
                                    className="text-gray-200 hover:bg-yellow-400/10"
                                  >
                                    {country.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* State */}
                      <FormField
                        control={form.control}
                        name="address.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">
                              State
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={handleStateChange}
                              disabled={!form.getValues("address.country")}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                                  <SelectValue placeholder="Select State" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                                {states.map((state) => (
                                  <SelectItem
                                    key={state.isoCode}
                                    value={state.name}
                                    className="text-gray-200 hover:bg-yellow-400/10"
                                  >
                                    {state.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* City */}
                      <FormField
                        control={form.control}
                        name="address.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-gray-200">
                              City
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={handleCityChange}
                              disabled={!form.getValues("address.state")}
                            >
                              <FormControl>
                                <SelectTrigger className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 focus:border-yellow-400/50 focus:ring-yellow-400/20">
                                  <SelectValue placeholder="Select City" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-[#0A0A0A] border-yellow-400/20">
                                {cities.map((city) => (
                                  <SelectItem
                                    key={city.name}
                                    value={city.name}
                                    className="text-gray-200 hover:bg-yellow-400/10"
                                  >
                                    {city.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Local Address */}
                    <FormField
                      control={form.control}
                      name="address.localAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            Local Address
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="Enter Local Address"
                              className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Pincode */}
                    <FormField
                      control={form.control}
                      name="address.pincode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-200">
                            Pincode
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="text"
                              placeholder="Enter Pincode"
                              className="bg-[#0A0A0A]/30 border-yellow-400/20 text-gray-200 placeholder:text-gray-500 focus:border-yellow-400/50 focus:ring-yellow-400/20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Save Profile Button */}
                  <div className="flex justify-center mt-8">
                    <Button
                      type="submit"
                      disabled={saving || isSaveDisabled}
                      className={`px-8 py-2 font-semibold bg-yellow-400 hover:bg-yellow-500 text-black ${
                        isSaveDisabled || saving
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      }`}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Saving Profile...
                        </>
                      ) : (
                        "Save Profile"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>

          <p className="  px-6 py-3 text-sm transition-all duration-200  text-center mt-8 ">
            <span
              className="text-gray-400 hover:text-red-400 cursor-pointer underline"
              onClick={showDeleteAccountModal}
            >
              Want to Delete Account?
            </span>
          </p>
        </div>
      </div>
      {isDeleteAccountModalOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsDeleteAccountModalOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90%] max-w-sm backdrop-blur-md"
          >
            <div className="fixed inset-0 flex items-center justify-center bg-black/80 backdrop-blur-md transition-all duration-300 ease-in-out">
              <div className="bg-[#0A0A0A] border border-red-400/20 rounded-xl shadow-lg shadow-red-400/5 p-8 max-w-md w-full mx-4 transform transition-all duration-300 ease-in-out scale-100 opacity-100">
                <h2 className="text-2xl font-bold text-red-400 mb-4">
                  Delete Account
                </h2>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to delete your account? This action
                  cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    onClick={() => setIsDeleteAccountModalOpen(false)}
                    className="bg-[#0A0A0A]/30 hover:bg-[#0A0A0A]/50 text-gray-400 border border-gray-400/20 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDeleteAccount}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-400/20 px-4 py-2 rounded-md transition-all duration-200 cursor-pointer"
                  >
                    {isDeletingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting Account...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </>
  );
}

export default UpdateProfileClient;

