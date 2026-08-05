"use client";

import { useEffect } from "react";
import {
  POSYANDU_REALTIME_EVENT,
  type PosyanduRealtimeChange,
} from "@/components/realtime/RealtimeProvider";

/**
 * Runs a local refetch when a relevant Supabase database change is broadcast.
 * The callback should be stable (normally wrapped in useCallback).
 */
export function useRealtimeRefresh(
  callback: () => void | Promise<void>,
  tables?: readonly string[]
) {
  const tableKey = tables?.join("|") ?? "";

  useEffect(() => {
    const tableSet = new Set(tableKey.split("|").filter(Boolean));
    const listener = (event: Event) => {
      const change = (event as CustomEvent<PosyanduRealtimeChange>).detail;
      if (tableSet.size && (!change?.table || !tableSet.has(change.table))) return;
      void callback();
    };

    window.addEventListener(POSYANDU_REALTIME_EVENT, listener);
    return () => window.removeEventListener(POSYANDU_REALTIME_EVENT, listener);
  }, [callback, tableKey]);
}
