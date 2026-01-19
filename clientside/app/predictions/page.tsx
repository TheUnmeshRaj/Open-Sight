"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import NavBar from "@/app/components/NavBar";
import { User } from "@supabase/supabase-js";

export default function PredictionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.push("/login");
        } else {
          setUser(user);
        }
      } catch (err) {
        console.error("Error checking auth:", err);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) return null; // or a spinner if you care

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <NavBar user={user ? { email: user.email || "", id: user.id } : undefined} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-emerald-700 to-emerald-900 bg-clip-text text-transparent mb-2">
            Crime Risk Prediction
          </h1>
          <p className="text-slate-600 text-lg">
            Predict crime risk for any location and date in Bengaluru
          </p>
        </div>

        <iframe
          src="https://open-sight-3swikarspfhr9yyjimecnr.streamlit.app/?page=dashboard&embed=true"
          width="100%"
          height={800}
          style={{ border: "none" }}
        />
      </main>
    </div>
  );
}
