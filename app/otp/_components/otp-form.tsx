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
    .length(6, { message: "Your one-time password must be exactly 6 digits." }),
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

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    console.log("OTP Submitted:", data.pin);
    if (page === "user") {
      router.push(`/user/create-account`);
    } else if (page === "business") {
      router.push(`/business/create-account`);
    }
  };

  // Focus on first OTP input
  useEffect(() => {
    firstOtpInputRef.current?.focus();
  }, []);

  // Auto-submit when the pin is fully filled
  useEffect(() => {
    const pin = form.watch("pin");
    if (pin.length === 6) {
      form.handleSubmit(onSubmit)();
    }
  }, [form.watch("pin")]);

  // Auto-fill OTP using OTPCredential API
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

        if (otp && (otp as any).code) {
          const otpCode = (otp as any).code.slice(0, 6); // Ensure exactly 6 digits
          form.setValue("pin", otpCode);
        }
      } catch (err) {
        console.error("Failed to fetch OTP:", err);
      }
    };

    fetchOtp();

    return () => {
      abortController.abort();
    };
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} autoComplete="off">
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
                  autoComplete="one-time-code"
                  {...field}
                  ref={firstOtpInputRef}
                >
                  <InputOTPGroup>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <InputOTPSlot key={index} index={index} />
                    ))}
                  </InputOTPGroup>
                  <InputOTPSeparator />
                  <InputOTPGroup>
                    {Array.from({ length: 3 }).map((_, index) => (
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
