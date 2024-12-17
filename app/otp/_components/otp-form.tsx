"use client";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  pin: z
    .string()
    .length(6, { message: "Your one-time password must be exactly 6 digits." }),
});

export default function OtpForm({ page }: { page: "user" | "business" }) {
  const router = useRouter();

  const { register, setValue, handleSubmit, watch, formState } = useForm<{
    pin: string;
  }>({
    resolver: zodResolver(FormSchema),
    defaultValues: { pin: "" },
  });

  const [otp, setOtp] = useState<string | null>(null); // State to show OTP
  const pin = watch("pin");

  // Handle form submission
  const onSubmit = (data: { pin: string }) => {
    console.log("OTP Submitted:", data.pin);
 
  };

  // Autofill OTP using OTPCredential API
  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const abortController = new AbortController();

    const fetchOtp = async () => {
      try {
        const otp = await navigator.credentials.get({
          //@ts-ignore
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        });

        if (otp && "code" in otp) {
          //@ts-ignore
          const otpCode = otp.code.slice(0, 6); // Ensure only 6 digits
          setValue("pin", otpCode);
          setOtp(otpCode); // Set the fetched OTP to display
          console.log("OTP Retrieved:", otpCode);
        }
      } catch (err) {
        console.error("OTP Retrieval Error:", err);
      }
    };

    fetchOtp();

    return () => abortController.abort();
  }, [setValue]);

  // Auto-submit when all 6 characters are filled
  useEffect(() => {
    if (pin.length === 6) {
      handleSubmit(onSubmit)();
    }
  }, [pin, handleSubmit]);

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-2xl font-bold">Enter Confirmation Code</h1>
      {otp && <h2 className="text-lg text-green-500">Your OTP: {otp}</h2>}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-4"
        autoComplete="off"
      >
        <input
          id="otp"
          type="text"
          inputMode="numeric"
          maxLength={6}
          autoComplete="one-time-code"
          placeholder="******"
          {...register("pin")}
          className="w-48 text-center border border-gray-300 rounded p-2 text-2xl tracking-widest"
        />
        {formState.errors.pin && (
          <p className="text-red-500 text-sm">{formState.errors.pin.message}</p>
        )}
      </form>
    </div>
  );
}
