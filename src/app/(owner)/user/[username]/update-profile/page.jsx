"use client";
import { signOut, useSession } from "next-auth/react";
import React, { useState, useEffect } from "react";
import { Country, State, City } from "country-state-city";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Check, Edit2 } from "lucide-react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  phoneNumber: z.string(),
  address: z.object({
    country: z.string(),
    state: z.string(),
    city: z.string(),
    localAddress: z.string(),
    pincode: z.string(),
  }),
});

function UpdateProfilePage() {
  const { data: session, update } = useSession();
  const owner = session?.user;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      phoneNumber: "",
      address: {
        country: "",
        state: "",
        city: "",
        localAddress: "",
        pincode: "",
      },
    },
  });

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch countries
        const fetchedCountries = Country.getAllCountries();
        setCountries(fetchedCountries);

        form.reset(owner);

        // If user has country selected, fetch states
        if (owner?.address?.country) {
          const countryCode = fetchedCountries.find(
            (c) => c.name === owner.address.country
          )?.isoCode;

          if (countryCode) {
            const fetchedStates = State.getStatesOfCountry(countryCode);
            setStates(fetchedStates);

            // If user has state selected, fetch cities
            if (owner?.address?.state) {
              const stateCode = fetchedStates.find(
                (s) => s.name === owner.address.state
              )?.isoCode;

              if (stateCode) {
                const fetchedCities = City.getCitiesOfState(
                  countryCode,
                  stateCode
                );
                setCities(fetchedCities);
              }
            }
            if (owner?.address?.city) {
              const cityCode = fetchedCities.find(
                (s) => s.name === owner.address.city
              )?.isoCode;
              form.setValue("address.city", cityCode);
            }
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    if (owner?.username) {
      fetchData();
    }
  }, [owner?.username, form]);

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

  const handleGlobalEdit = () => {
    if (editingField === "all") {
      // If already in edit mode, save the changes
      setEditingField(null);
    } else {
      // Enter edit mode
      setEditingField("all");
    }
  };

  const handleSaveProfile = async (data) => {
    if (editingField === "all") {
      toast.error(
        "Please save your current changes before updating the profile"
      );
      return;
    }

    const payload = {
      data,
    };

    try {
      setSaving(true);

      const { data } = await axios.patch("/api/update-profile", payload);

      if (data.success) {
        // Update session with new data
        await update({
          user: {
            ...session.user,
            businessName:
              data.user.businessName || session.user.businessName,
            phoneNumber: data.user.phoneNumber,
            address: data.user.address || session.user.address,
            isProfileCompleted: data.user.isProfileCompleted,
          },
        });

        toast.success(data.message);
        setEditingField(null);
        router.refresh();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
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
    const { data } = await axios.delete("/api/delete-account");
    if (data.success) {
      toast.success(data.message);
      setIsDeletingAccount(false);
      signOut();
    }
  };

  const [isSaveDisabled, setIsSaveDisabled] = useState(true);

  // Watch for changes in form values
  const watchedValues = useWatch({
    control: form.control,
  });

  // Function to compare form values with `owner`
  const isFormUnchanged = (formData, ownerData) => {
    return JSON.stringify(formData) === JSON.stringify(ownerData);
  };

  // Use effect to enable/disable the save button based on changes
  useEffect(() => {
    const currentFormValues = form.getValues();
    if (owner) {
      const unchanged = isFormUnchanged(currentFormValues, owner);
      setIsSaveDisabled(unchanged);
    }
  }, [watchedValues, owner]);
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex items-center space-x-2 text-yellow-400">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-[#0A0A0A] py-8 px-4 sm:px-6 pt-24">
        <div className="max-w-2xl mx-auto">
          <div className="bg-[#0A0A0A]/50 backdrop-blur-sm border border-yellow-400/20 rounded-xl shadow-lg shadow-yellow-400/5">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-8 relative">
                <h1 className="text-2xl sm:text-3xl font-bold text-yellow-400 mb-2">
                  Your Profile
                </h1>
                <p className="text-gray-400">
                  View and update your profile information below.
                </p>
                <Button
                  type="button"
                  onClick={handleGlobalEdit}
                  className="absolute top-0 right-0 px-3 bg-yellow-400/10 hover:bg-yellow-400/20 text-yellow-400 border-yellow-400/20"
                >
                  {editingField === "all" ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Edit2 className="w-4 h-4" />
                  )}
                </Button>
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
                            disabled={editingField !== "all"}
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
                            disabled={editingField !== "all"}
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
                              disabled={editingField !== "all"}
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
                              disabled={
                                editingField !== "all" ||
                                !form.getValues("address.country")
                              }
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
                              disabled={
                                editingField !== "all" ||
                                !form.getValues("address.state")
                              }
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
                              disabled={editingField !== "all"}
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
                              disabled={editingField !== "all"}
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
                      className={`px-8 py-2 font-semibold ${
                        editingField !== "all"
                          ? "bg-yellow-400 hover:bg-yellow-500  text-black"
                          : "bg-gray-700 text-gray-400 "
                      } ${
                        isSaveDisabled || saving
                          ? "cursor-not-allowed"
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

export default UpdateProfilePage;
