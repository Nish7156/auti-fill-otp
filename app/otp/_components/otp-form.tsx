'use client'
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
  pin: z
    .string()
    .length(6, "Your one-time password must be exactly 6 characters."),
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
    defaultValues: { pin: "" },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("OTP Submitted:", data);
    // Example navigation based on page prop
    if (page === "user") {
      router.push(`/user/create-account`);
    } else if (page === "business") {
      router.push(`/business/create-account`);
    }
  };

  // Auto-focus the first OTP input
  useEffect(() => {
    firstOtpInputRef.current?.focus();
  }, []);

  // Automatically submit when the pin is fully filled
  useEffect(() => {
    const subscription = form.watch((value) => {
      //@ts-ignore
      if (value.pin.length === 6) {
        form.handleSubmit(onSubmit)();
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Handle OTP Auto-fill using OTPCredential
  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const abortController = new AbortController();

    (async () => {
      try {
        const otp = (await navigator.credentials.get({
          //@ts-ignore
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        })) as { code: string } | null;

        if (otp?.code) {
          form.setValue("pin", otp.code.slice(0, 6));
        }
      } catch (err) {
        console.error("Error fetching OTP:", err);
      }
    })();

    return () => abortController.abort();
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-center font-semibold">
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
