"use client";

import { Wifi, WifiOff } from "lucide-react";
import { useRealtimeStatus } from "@/components/realtime/RealtimeProvider";

export default function RealtimeStatusBadge() {
  const { status } = useRealtimeStatus();

  const connected = status === "connected";
  const disabled = status === "disabled";
  const label = connected
    ? "Realtime aktif"
    : disabled
      ? "Realtime belum disetel"
      : status === "error"
        ? "Realtime bermasalah"
        : "Menghubungkan realtime";

  return (
    <div
      className={`hidden md:inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-semibold ${
        connected
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : disabled
            ? "border-amber-200 bg-amber-50 text-amber-700"
            : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
      title={label}
      aria-label={label}
    >
      <span className="relative flex h-2 w-2">
        {connected ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        ) : null}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            connected ? "bg-emerald-500" : disabled ? "bg-amber-500" : "bg-slate-400"
          }`}
        />
      </span>
      {connected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {label}
    </div>
  );
}
