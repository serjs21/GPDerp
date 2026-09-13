"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function ManageShareLinksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", "share-links");
    router.replace(`/settings?${params.toString()}`);
  }, [router, searchParams]);

  return null;
}
