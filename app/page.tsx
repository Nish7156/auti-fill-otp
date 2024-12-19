//@ts-nocheck
'use client'
import React from "react";
import { useState, useEffect } from "react";

export default function App() {
  const [otp, setOtp] = useState("");
  useEffect(() => {
    let ac = new AbortController();
    setTimeout(() => {
      // abort after 10 minutes
      ac.abort();
    }, 10 * 60 * 1000);
    navigator.credentials
      .get({
        otp: { transport: ["sms"] },
        signal: ac.signal
      })
      .then(otp => {
        setOtp(otp.code);
        console.log("your otp code is", otp.code);
      })
      .catch(err => {
        console.log(err);
      });
  });
  return (
    <div>
      <h1>Web Otp Example Code {otp}</h1>
      <input type="text" inputmode="numeric" name="one-time-code" value={otp} />
    </div>
  );
}
