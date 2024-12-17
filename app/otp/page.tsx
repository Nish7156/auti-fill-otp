"use client";
import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { OtpForm } from "./_components/otp-form";

function Page() {
  return (
    <div className="container">
      <div className="flex flex-col items-center justify-center gap-6 pb-10 pt-24">
        <Suspense fallback={<div>Loading...</div>}>
          <OtpPageContent />
        </Suspense>
      </div>
    </div>
  );
}

function OtpPageContent() {
  const searchParams = useSearchParams();
  const email: string | null = searchParams.get("email");
  const phone: string | null = searchParams.get("phone");

  return (
    <>
  
      <OtpForm email={email || ""} phone={phone || ""} page={"user"} />
    </>
  );
}

export default Page;
