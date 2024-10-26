"use client";
//@ts-nocheck
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  const [otp, setOtp] = useState(Array(6).fill(""));

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
          setOtp(otp.code.split("").slice(0, 6)); // Slice to ensure only 6 digits
          ac.abort();
        })
        .catch((err) => {
          ac.abort();
          console.log(err);
        });
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
      <h1>Hello CodeSandbox</h1>
      <h2>Your OTP is: {otp.join("")}</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleChange(e.target.value, index)}
            style={{
              width: "40px",
              textAlign: "center",
              fontSize: "1.5rem",
              border:"2px black solid"
            }}
          />
        ))}
      </div>
      <Button onClick={() => alert(`Entered OTP: ${otp.join("")}`)}>
        Submit OTP
      </Button>
    </div>
  );
}
