"use client";

import { useEffect } from "react";
import "@/axios.setup"; // side-effect import

export default function AxiosInit() {
  useEffect(() => {
    // ensures this module is evaluated in the browser
  }, []);
  return null;
}