"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export type RealtimeConnectionStatus =
  | "disabled"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "error";

export interface PosyanduRealtimeChange {
  table?: string;
  operation?: string;
  changedAt?: string;
}

interface RealtimeContextValue {
  status: RealtimeConnectionStatus;
  lastChange: PosyanduRealtimeChange | null;
}

interface SupabaseRealtimeChannel {
  on(
    type: "broadcast",
    filter: { event: string },
    callback: (message: { payload?: PosyanduRealtimeChange }) => void
  ): SupabaseRealtimeChannel;
  subscribe(callback?: (status: string, error?: unknown) => void): SupabaseRealtimeChannel;
}

interface SupabaseBrowserClient {
  channel(
    topic: string,
    options?: {
      config?: {
        private?: boolean;
        broadcast?: { self?: boolean; ack?: boolean };
      };
    }
  ): SupabaseRealtimeChannel;
  removeChannel(channel: SupabaseRealtimeChannel): Promise<unknown> | unknown;
}

declare global {
  interface Window {
    supabase?: {
      createClient: (
        url: string,
        key: string,
        options?: Record<string, unknown>
      ) => SupabaseBrowserClient;
    };
  }
}

export const POSYANDU_REALTIME_EVENT = "posyandu:realtime-change";
const TOPIC = "posyandu:changes";
const EVENT = "data_changed";
const MIN_REFRESH_INTERVAL_MS = 1_000;
const ALLOWED_REALTIME_TABLES = new Set([
  "users",
  "password_reset_requests",
  "categories",
  "archive_categories",
  "visitors",
  "monitoring_balita",
  "monitoring_ibu_hamil",
  "monitoring_remaja",
  "monitoring_usia_produktif",
  "monitoring_lansia",
  "attendances",
  "posyandu_sessions",
  "products",
  "documentations",
  "archives",
  "profiles",
  "news_categories",
  "news",
  "events",
  "faqs",
  "audit_logs",
]);
const ALLOWED_OPERATIONS = new Set(["INSERT", "UPDATE", "DELETE"]);

function isValidRealtimeChange(
  value: PosyanduRealtimeChange | undefined
): value is PosyanduRealtimeChange & { table: string; operation: string } {
  return Boolean(
    value?.table &&
      value.operation &&
      ALLOWED_REALTIME_TABLES.has(value.table) &&
      ALLOWED_OPERATIONS.has(value.operation)
  );
}

const RealtimeContext = createContext<RealtimeContextValue>({
  status: "disabled",
  lastChange: null,
});

function readPublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();
  return { url, key };
}

export function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<RealtimeConnectionStatus>("connecting");
  const [lastChange, setLastChange] = useState<PosyanduRealtimeChange | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const { url, key } = readPublicConfig();
    if (!url || !key) {
      setStatus("disabled");
      return;
    }

    let disposed = false;
    let client: SupabaseBrowserClient | null = null;
    let channel: SupabaseRealtimeChannel | null = null;
    let libraryWaitTimer: ReturnType<typeof setInterval> | null = null;
    let attempts = 0;

    const scheduleRefresh = (change: PosyanduRealtimeChange) => {
      if (!isValidRealtimeChange(change)) return;

      setLastChange(change);
      window.dispatchEvent(
        new CustomEvent<PosyanduRealtimeChange>(POSYANDU_REALTIME_EVENT, {
          detail: change,
        })
      );

      // A public channel carries only invalidation metadata. Validate and
      // throttle it so a fabricated broadcast cannot create a refresh storm.
      if (refreshTimer.current) return;
      const elapsed = Date.now() - lastRefreshAt.current;
      const wait = Math.max(0, MIN_REFRESH_INTERVAL_MS - elapsed);
      refreshTimer.current = setTimeout(() => {
        refreshTimer.current = null;
        lastRefreshAt.current = Date.now();
        router.refresh();
      }, wait);
    };

    const connect = () => {
      if (disposed) return;
      attempts += 1;
      const library = window.supabase;
      if (!library?.createClient) {
        if (attempts >= 100) {
          setStatus("error");
          if (libraryWaitTimer) clearInterval(libraryWaitTimer);
        }
        return;
      }

      if (libraryWaitTimer) clearInterval(libraryWaitTimer);
      client = library.createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
        realtime: {
          params: { eventsPerSecond: 10 },
        },
      });

      channel = client
        .channel(TOPIC, {
          config: {
            private: false,
            broadcast: { self: false, ack: false },
          },
        })
        .on("broadcast", { event: EVENT }, (message) => {
          scheduleRefresh(message.payload ?? {});
        })
        .subscribe((nextStatus) => {
          if (disposed) return;
          if (nextStatus === "SUBSCRIBED") setStatus("connected");
          else if (nextStatus === "CHANNEL_ERROR" || nextStatus === "TIMED_OUT") {
            setStatus("error");
          } else if (nextStatus === "CLOSED") {
            setStatus("reconnecting");
          } else {
            setStatus("connecting");
          }
        });
    };

    setStatus("connecting");
    connect();
    if (!channel) libraryWaitTimer = setInterval(connect, 100);

    const handleOnline = () => setStatus((current) => (current === "disabled" ? current : "reconnecting"));
    const handleOffline = () => setStatus((current) => (current === "disabled" ? current : "reconnecting"));
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      disposed = true;
      if (libraryWaitTimer) clearInterval(libraryWaitTimer);
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (client && channel) void client.removeChannel(channel);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [router]);

  const value = useMemo(() => ({ status, lastChange }), [status, lastChange]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

export function useRealtimeStatus() {
  return useContext(RealtimeContext);
}
