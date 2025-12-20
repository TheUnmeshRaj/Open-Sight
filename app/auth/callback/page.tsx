"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth
      .exchangeCodeForSession(window.location.href)
      .then(() => router.replace("/"))
      .catch(() => router.replace("/login"));
  }, [router]);

  return null;
}
