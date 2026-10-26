"use client";

import { useState } from "react";

export type AuthCredentials = {
  email: string;
  password: string;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
};

/** Email + password typed into the auth forms; owned by a parent so tabs can share them. */
export function useAuthCredentials(): AuthCredentials {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return { email, password, setEmail, setPassword };
}
