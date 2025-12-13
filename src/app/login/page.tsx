"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { auth } from "@/lib/firebase/config"; 
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { firebaseLoginBridge } from "@/actions/auth"; // 👈 IMPORT THE BRIDGE
import { Loader2, Smartphone, Mail, ArrowRight, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-[110] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl transition-all duration-500 animate-in slide-in-from-top-4 fade-in ${
      type === 'success' ? 'bg-black text-white' : 'bg-red-500 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="font-medium text-sm">{message}</span>
    </div>
  );
}

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'MOBILE' | 'EMAIL'>('MOBILE');
  const [view, setView] = useState<'LOGIN' | 'OTP'>('LOGIN');
  
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const notify = (msg: string, type: 'success' | 'error') => setToast({ msg, type });

  // RECAPTCHA
  useEffect(() => {
    if (view === 'LOGIN' && activeTab === 'MOBILE') {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {}
            });
        }
    }
  }, [view, activeTab]);

  // 1. SEND SMS (FIREBASE)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return notify("Enter valid number", "error");

    setLoading(true);
    const fullPhone = `+91${phone}`;
    const appVerifier = window.recaptchaVerifier;

    try {
        const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
        setConfirmationResult(result);
        notify("OTP sent!", "success");
        setView('OTP');
    } catch (error: any) {
        notify(error.message, "error");
        if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
        setLoading(false);
    }
  };

  // 2. VERIFY & LOGIN (THE HYBRID BRIDGE)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
        // A. Verify with Firebase
        if (!confirmationResult) throw new Error("No OTP request found");
        await confirmationResult.confirm(otp);

        // B. Call Server Bridge to get Supabase Session
        const fullPhone = `+91${phone}`;
        const result = await firebaseLoginBridge(fullPhone);

        if (result.error) {
            throw new Error(result.error);
        }

        if (result.url) {
            notify("Login Successful! Redirecting...", "success");
            // C. Auto-Click the Magic Link to start session
            window.location.href = result.url; 
        }

    } catch (error: any) {
        notify(error.message || "Invalid Code", "error");
        setLoading(false);
    }
  };

  // 3. EMAIL LOGIN (STANDARD)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) notify(error.message, "error");
    else window.location.href = "/shop";
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white flex items-center justify-center p-4">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <div className="absolute inset-0 bg-gray-50/50 -z-10" />

      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative">
        <div className="pt-8 pb-6 text-center">
            <h1 className="text-2xl font-black tracking-tighter uppercase">Crown & Crest</h1>
            <p className="text-gray-400 text-xs font-bold mt-1 tracking-widest uppercase">Identity Secure Login</p>
        </div>

        {view === 'LOGIN' && (
          <div className="px-8 mb-6">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button onClick={() => setActiveTab('MOBILE')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'MOBILE' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                <Smartphone className="w-4 h-4" /> Mobile
              </button>
              <button onClick={() => setActiveTab('EMAIL')} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'EMAIL' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}>
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>
          </div>
        )}

        <div className="px-8 pb-8">
          {view === 'LOGIN' ? (
            activeTab === 'MOBILE' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-400">🇮🇳 +91</span>
                      <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} placeholder="98765 43210" className="bg-transparent w-full outline-none font-bold" autoFocus />
                  </div>
                  <div id="recaptcha-container"></div>
                  <button disabled={loading} className="w-full bg-black text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" /> : <>Continue Securely <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>
            ) : (
                <form onSubmit={handleEmailAuth} className="space-y-4">
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border focus:border-black" />
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full px-4 py-3 bg-gray-50 rounded-xl outline-none border focus:border-black" />
                    <button disabled={loading} className="w-full bg-black text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin" /> : "Login"}
                    </button>
                </form>
            )
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
               <div className="text-center"><h3>Verify Mobile</h3></div>
               <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="123456" className="w-full text-center text-3xl font-black py-4 border-b-2 outline-none" maxLength={6} autoFocus />
               <button disabled={loading} className="w-full bg-black text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : "Verify & Login"}
               </button>
            </form>
          )}
          {view === 'LOGIN' && <div className="mt-6 text-center"><Link href="/" className="text-sm font-bold text-gray-400">Cancel</Link></div>}
        </div>
      </div>
    </div>
  );
}
