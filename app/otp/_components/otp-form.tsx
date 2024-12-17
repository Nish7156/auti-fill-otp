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

  // Focus the first input field when the component mounts
  useEffect(() => {
    firstOtpInputRef.current?.focus();
  }, []);

  // Auto-submit form when the PIN has 6 digits
  useEffect(() => {
    const pin = form.watch("pin");
    if (pin.length === 6) {
      form.handleSubmit(onSubmit)();
    }
  }, [form.watch("pin")]);

  // Periodically poll for OTP and autofill
  useEffect(() => {
    if (!("OTPCredential" in window)) return;

    const abortController = new AbortController();
    let pollingInterval: NodeJS.Timeout | null = null;
    const startTime = Date.now();
    const timeout = 30000; // 30 seconds timeout

    const fetchOtp = async () => {
      try {
        const otp = await navigator.credentials.get({
          //@ts-ignore
          otp: { transport: ["sms"] },
          signal: abortController.signal,
        });

        if (otp && (otp as any).code) {
          const otpCode = (otp as any).code.slice(0, 6); // Ensure exactly 6 digits
          form.setValue("pin", otpCode); // Autofill the form input
          clearInterval(pollingInterval!); // Stop polling
          console.log("OTP Retrieved:", otpCode);
        }
      } catch (error) {
        console.warn("Failed to fetch OTP:", error);
      }
    };

    // Start polling every 2 seconds until timeout
    pollingInterval = setInterval(() => {
      if (Date.now() - startTime >= timeout) {
        console.log("OTP polling timeout reached.");
        clearInterval(pollingInterval!);
        abortController.abort();
      } else {
        fetchOtp();
      }
    }, 2000);

    // Cleanup when component unmounts
    return () => {
      abortController.abort();
      if (pollingInterval) clearInterval(pollingInterval);
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
