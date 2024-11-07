import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useRef } from "react";

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

export function OtpForm({
  email,
  phone,
  page,
}: {
  email: string;
  phone: string;
  page: "user" | "business";
}) {
  const router = useRouter();
  const firstOtpInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data);
    if (page === "user") {
      router.push(`/user/create-account`);
    } else if (page === "business") {
      router.push(`/business/create-account`);
    }
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

  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const abortController = new AbortController();

    const fetchOtp = async () => {
      try {
        const otpCredentials: CredentialRequestOptions = {
          //@ts-ignore
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        };

        const otp = (await navigator.credentials.get(otpCredentials)) as {
          code: string;
        } | null;

        if (!otp || !otp.code) {
          throw new Error("OTP retrieval failed: No OTP code found");
        }

        const otpCode = otp.code.slice(0, 6); // Ensure only 6 digits
        form.setValue("pin", otpCode); // Set OTP in form state
      } catch (err) {
        console.log("OTP retrieval error:", err);
      }
    };

    fetchOtp();

    return () => {
      abortController.abort(); // Cleanup on component unmount
    };
  }, []);

  return (
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
                <InputOTP
                  maxLength={6}
                  {...field}
                  ref={firstOtpInputRef}
                  autoComplete="one-time-code"
                >
                  <InputOTPGroup>
                    {Array.from({ length: 3 }, (_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {Array.from({ length: 3 }, (_, index) => (
                      <InputOTPSlot key={index + 3} index={index + 3} />
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
  );
}
