// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { useEffect, useRef } from "react";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   InputOTP,
//   InputOTPGroup,
//   InputOTPSeparator,
//   InputOTPSlot,
// } from "@/components/ui/input-otp";
// import { useRouter } from "next/navigation";

// const FormSchema = z.object({
//   pin: z
//     .string()
//     .length(6, { message: "Your one-time password must be exactly 6 digits." }),
// });

// export function OtpForm({
//   email,
//   phone,
//   page,
// }: {
//   email: string;
//   phone: string;
//   page: "user" | "business";
// }) {
//   const router = useRouter();
//   const firstOtpInputRef = useRef<HTMLInputElement>(null);

//   const form = useForm<z.infer<typeof FormSchema>>({
//     resolver: zodResolver(FormSchema),
//     defaultValues: {
//       pin: "",
//     },
//   });

//   const onSubmit = (data: z.infer<typeof FormSchema>) => {
//     console.log("OTP Submitted:", data.pin);
//     if (page === "user") {
//       router.push(`/user/create-account`);
//     } else if (page === "business") {
//       router.push(`/business/create-account`);
//     }
//   };

//   // Focus the first input field when the component mounts
//   useEffect(() => {
//     firstOtpInputRef.current?.focus();
//   }, []);

//   // Auto-submit form when the PIN has 6 digits
//   useEffect(() => {
//     const pin = form.watch("pin");
//     if (pin.length === 6) {
//       form.handleSubmit(onSubmit)();
//     }
//   }, [form.watch("pin")]);

//   // Periodically poll for OTP and autofill
//   useEffect(() => {
//     if (!("OTPCredential" in window)) return;

//     const abortController = new AbortController();
//     let pollingInterval: NodeJS.Timeout | null = null;
//     const startTime = Date.now();
//     const timeout = 30000; // 30 seconds timeout

//     const fetchOtp = async () => {
//       try {
//         const otp = await navigator.credentials.get({
//           //@ts-ignore
//           otp: { transport: ["sms"] },
//           signal: abortController.signal,
//         });

//         if (otp && (otp as any).code) {
//           const otpCode = (otp as any).code.slice(0, 6); // Ensure exactly 6 digits
//           form.setValue("pin", otpCode); // Autofill the form input
//           clearInterval(pollingInterval!); // Stop polling
//           console.log("OTP Retrieved:", otpCode);
//         }
//       } catch (error) {
//         console.warn("Failed to fetch OTP:", error);
//       }
//     };

//     // Start polling every 2 seconds until timeout
//     pollingInterval = setInterval(() => {
//       if (Date.now() - startTime >= timeout) {
//         console.log("OTP polling timeout reached.");
//         clearInterval(pollingInterval!);
//         abortController.abort();
//       } else {
//         fetchOtp();
//       }
//     }, 2000);

//     // Cleanup when component unmounts
//     return () => {
//       abortController.abort();
//       if (pollingInterval) clearInterval(pollingInterval);
//     };
//   }, [form]);

//   return (
//     <Form {...form}>
//       <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
//         <FormField
//           control={form.control}
//           name="pin"
//           render={({ field }) => (
//             <FormItem>
//               <FormLabel className="text-center font-semibold">
//                 Confirmation Code
//               </FormLabel>
//               <FormControl>
//                 <InputOTP
//                   maxLength={6}
//                   autoComplete="one-time-code"
//                   {...field}
//                   ref={firstOtpInputRef}
//                 >
//                   <InputOTPGroup>
//                     {Array.from({ length: 3 }).map((_, index) => (
//                       <InputOTPSlot key={index} index={index} />
//                     ))}
//                   </InputOTPGroup>
//                   <InputOTPSeparator />
//                   <InputOTPGroup>
//                     {Array.from({ length: 3 }).map((_, index) => (
//                       <InputOTPSlot key={index + 3} index={index + 3} />
//                     ))}
//                   </InputOTPGroup>
//                 </InputOTP>
//               </FormControl>
//               <FormMessage />
//             </FormItem>
//           )}
//         />
//       </form>
//     </Form>
//   );
// }


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

export default function OtpForm({
  page,
}: {
  page: "user" | "business";
}) {
  const router = useRouter();

  const { register, setValue, handleSubmit, watch, formState } = useForm<{
    pin: string;
  }>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  const [otp, setOtp] = useState<string | null>(null); // State to show OTP
  const pin = watch("pin");

  const onSubmit = (data: { pin: string }) => {
    console.log("OTP Submitted:", data.pin);
    // if (page === "user") {
    //   router.push(`/user/create-account`);
    // } else {
    //   router.push(`/business/create-account`);
    // }
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

    return () => abortController.abort(); // Cleanup
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
