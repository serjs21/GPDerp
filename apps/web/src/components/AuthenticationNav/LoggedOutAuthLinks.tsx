"use client";

import Link from "next/link";

export const LoggedOutAuthLinks = () => {
  return (
    <nav style={{ display: "flex", gap: 16 }}>
      <Link href="/login">Login</Link>
      <Link href="/register">Register</Link>
    </nav>
  );
};
