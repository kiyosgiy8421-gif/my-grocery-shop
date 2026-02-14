"use client";

import Link from "next/link";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-green-50 px-4">
      <div className="w-full max-w-md rounded-xl border border-green-100 bg-white p-8 shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <Mail className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="mb-2 text-center text-xl font-semibold text-green-900">
          Verify your email
        </h1>
        <p className="mb-6 text-center text-green-700">
          A confirmation link has been sent to your email. Please click the link
          to verify your account and sign in.
        </p>
        <p className="mb-6 text-center text-sm text-green-600">
          After clicking the link, you will be redirected to Fresh Grocery where
          you can sign in and start shopping.
        </p>
        <div className="space-y-3">
          <Link
            href="/"
            className="block w-full rounded-lg bg-green-600 py-3 text-center font-medium text-white transition-colors hover:bg-green-700"
          >
            Back to Store
          </Link>
          <p className="text-center text-sm text-green-600">
            Didn&apos;t receive the email? Check your spam folder or{" "}
            <Link href="/" className="font-medium text-green-800 underline hover:no-underline">
              try signing up again
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
