"use client";
import { SessionProvider } from "next-auth/react";
import React from "react";

export default function SessionProviderComp({
  children,
  session,
}: {
  children: React.ReactNode;
  session?: React.ComponentProps<typeof SessionProvider>["session"];
}) {
  return (
    <>
      <SessionProvider session={session}>{children}</SessionProvider>
    </>
  );
}
