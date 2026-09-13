"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/** Legacy route: redirect `/profile` → `/settings` (preserve query). */
export default function ProfileRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(query ? `/settings?${query}` : "/settings");
  }, [router, searchParams]);

  return null;
}
