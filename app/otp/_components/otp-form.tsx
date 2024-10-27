"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useRouter } from "next/navigation";

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

export function OtpForm({ email, phone }: { email: string; phone: string }) {
  const router = useRouter();
  const firstOtpInputRef = useRef<HTMLInputElement>(null);
  const [otp, setOtp] = useState(Array(6).fill(""));

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
      // router.push(`/user/create-account`);
    // alert(`your otp set ${otp}, ${data.pin}`);
    console.log(`your otp set ${otp}, ${data.pin}`);
    
  }

  // Auto-submit when the pin is fully filled
  useEffect(() => {
    if (form.watch("pin").length === 6) {
      form.handleSubmit(onSubmit)();
    }
  }, [form.watch("pin")]);

  useEffect(() => {
    if (firstOtpInputRef.current) {
      firstOtpInputRef.current.focus(); // Set focus to the first OTP input
    }
  }, []);

  // Web OTP API logic
  useEffect(() => {
    if ("OTPCredential" in window) {
      const ac = new AbortController();

      navigator.credentials
        .get({
          //@ts-ignore
          otp: { transport: ["sms"] },
          signal: ac.signal,
        })
        .then((otp) => {
          //@ts-ignore
          const otpCode = otp.code.split("").slice(0, 6); // Slice to ensure only 6 digits
          setOtp(otpCode);
          form.setValue("pin", otpCode.join("")); // Set OTP in form state
          ac.abort();
        })
        .catch((err) => {
          ac.abort();
          console.log(err);
        });
    }
  }, []);

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="mb-2.5 flex justify-center text-center text-paragraph-lg-bold font-semibold">
                  Confirmation Code
                </FormLabel>
                <FormControl>
                  <InputOTP autoComplete=""  maxLength={6} {...field} ref={firstOtpInputRef}>
                    <InputOTPGroup>
                      {Array.from({ length: 3 }, (_, index) => (
                        <InputOTPSlot
                          key={index}
                          index={index}
                              
                        />
                      ))}
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      {Array.from({ length: 3 }, (_, index) => (
                        <InputOTPSlot
                          key={index + 3}
                          index={index + 3}
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </>
  );
}
