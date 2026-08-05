"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, KeyRound, Loader2, RefreshCw, X } from "lucide-react";
import { PASSWORD_MAX_BYTES, validateNewPassword } from "@/utils/password";
import { useRealtimeRefresh } from "@/hooks/useRealtimeRefresh";

type Item = { id:number; email:string; status:"PENDING"|"RESOLVED"|"REJECTED"; requestedAt:string; userName:string|null };
function generatePassword() {
  const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%";
  const values=new Uint32Array(14); window.crypto.getRandomValues(values);
  return Array.from(values,(value)=>alphabet[value%alphabet.length]).join("");
}
function dateLabel(value:string) { return new Intl.DateTimeFormat("id-ID",{dateStyle:"medium",timeStyle:"short"}).format(new Date(value)); }

export default function PasswordResetQueue() {
  const [items,setItems]=useState<Item[]>([]); const [loading,setLoading]=useState(true);
  const [activeId,setActiveId]=useState<number|null>(null); const [password,setPassword]=useState("");
  const [busyId,setBusyId]=useState<number|null>(null); const [message,setMessage]=useState<string|null>(null);
  const [error,setError]=useState<string|null>(null);
  const load=useCallback(async()=>{ setLoading(true); try { const res=await fetch("/api/admin/password-reset-requests",{cache:"no-store"}); const data=await res.json(); if(!res.ok) throw new Error(data.message||"Gagal memuat permintaan."); setItems(data); } catch(e){setError(e instanceof Error?e.message:"Gagal memuat permintaan.");} finally {setLoading(false);} },[]);
  useEffect(()=>{void load();},[load]);
  useRealtimeRefresh(load, ["password_reset_requests", "users"]);
  async function act(id:number,action:"RESET"|"REJECT") {
    if(action==="RESET") { const validation=validateNewPassword(password); if(validation){setError(validation);return;} }
    setBusyId(id); setError(null); setMessage(null);
    try { const res=await fetch(`/api/admin/password-reset-requests/${id}`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,temporaryPassword:password})}); const data=await res.json(); if(!res.ok) throw new Error(data.message||"Gagal memproses permintaan."); setMessage(data.message); setActiveId(null); setPassword(""); await load(); }
    catch(e){setError(e instanceof Error?e.message:"Gagal memproses permintaan.");} finally {setBusyId(null);}
  }
  return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4"><h2 className="font-bold text-slate-800">Antrean Permintaan Reset Kata Sandi</h2><p className="text-xs text-slate-500 mt-1">Permintaan dari tombol lupa kata sandi dapat ditinjau dan diselesaikan di sini.</p></div>
    {message&&<p className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}
    {error&&<p className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading?<div className="flex justify-center py-8 text-slate-400"><Loader2 className="mr-2 animate-spin"/>Memuat...</div>:
    <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead><tr className="border-b text-left text-xs uppercase text-slate-400"><th className="pb-3">Pengguna</th><th className="pb-3">Email</th><th className="pb-3">Diajukan</th><th className="pb-3">Status</th><th className="pb-3 text-right">Tindakan</th></tr></thead><tbody>
      {items.length?items.map(item=><tr key={item.id} className="border-b last:border-0"><td className="py-3 font-medium">{item.userName||"Akun tidak ditemukan"}</td><td>{item.email}</td><td>{dateLabel(item.requestedAt)}</td><td><span className="rounded-full bg-slate-100 px-2 py-1 text-xs">{item.status}</span></td><td className="py-3 text-right">
        {item.status!=="PENDING"?<span className="text-xs text-slate-400">Selesai</span>:activeId===item.id?<form className="flex justify-end gap-2" onSubmit={e=>{e.preventDefault();void act(item.id,"RESET")}}><input aria-label={`Kata sandi sementara untuk ${item.email}`} value={password} onChange={e=>setPassword(e.target.value)} minLength={8} maxLength={PASSWORD_MAX_BYTES} className="h-9 rounded-lg border px-3"/><button type="button" onClick={()=>setPassword(generatePassword())} className="h-9 rounded-lg border px-3" title="Acak"><RefreshCw size={14}/></button><button disabled={busyId===item.id} className="h-9 rounded-lg bg-blue-600 px-3 text-white"><Check size={14}/></button><button type="button" onClick={()=>{setActiveId(null);setPassword("")}} className="h-9 rounded-lg border px-3"><X size={14}/></button></form>:
        <div className="flex justify-end gap-2"><button onClick={()=>{setActiveId(item.id);setPassword(generatePassword())}} className="flex h-9 items-center gap-1 rounded-lg bg-blue-50 px-3 text-xs font-semibold text-blue-700"><KeyRound size={14}/>Buat Sandi</button><button disabled={busyId===item.id} onClick={()=>{if(confirm(`Tolak permintaan ${item.email}?`))void act(item.id,"REJECT")}} className="h-9 rounded-lg border px-3 text-xs">Tolak</button></div>}
      </td></tr>):<tr><td colSpan={5} className="py-8 text-center text-slate-400">Belum ada permintaan reset.</td></tr>}
    </tbody></table></div>}
  </section>;
}
