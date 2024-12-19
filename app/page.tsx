//@ts-nocheck
"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [otp, setOtp] = useState(Array(6).fill(""));

  useEffect(() => {
    if ("OTPCredential" in window) {
      const ac = new AbortController();

      const fetchOtp = async () => {
        try {
          //@ts-ignore
          const otpCredential = await navigator.credentials.get({
            otp: { transport: ["sms"] },
            signal: ac.signal,
          });

          if (otpCredential) {
            //@ts-ignore
            const code = otpCredential.code.slice(0, 6); // Ensure only 6 digits
            setOtp(code.split(""));
            ac.abort();
          }
        } catch (err) {
          console.error("OTP Auto-fill failed:", err);
          ac.abort();
        }
      };

      fetchOtp();
    }
  }, []);

  const handleChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Automatically focus the next input field
    if (value !== "" && index < 5) {
      //@ts-ignore
      document.getElementById(`otp-${index + 1}`).focus();
    }
  };

  return (
    <div className="App">
      <h1>Enter OTP</h1>
      <h2>Your OTP is: {otp.join("")}</h2>
      <form
        autoComplete="one-time-code"
        style={{ display: "flex", gap: "10px" }}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            style={{
              width: "40px",
              textAlign: "center",
              fontSize: "1.5rem",
              border: "2px black solid",
            }}
          />
        ))}
      </form>
      <Button onClick={() => alert(`Entered OTP: ${otp.join("")}`)}>
        Submit OTP
      </Button>
    </div>
  );
}
