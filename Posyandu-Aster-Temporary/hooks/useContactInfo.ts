"use client";

import { useCallback, useEffect, useState } from "react";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

export interface ContactInfo {
  organizationName: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export function useContactInfo() {
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const loadContact = useCallback(async () => {
    try {
      const response = await fetch("/api/profile/contact", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal memuat kontak.");
      setContact(await response.json());
    } catch {
      setContact(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadContact();
  }, [loadContact]);
  useRealtimeRefresh(loadContact, ["profiles"]);

  return { contact, loading };
}
