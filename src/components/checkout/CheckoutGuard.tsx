"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client"; // Database connection
import { auth } from "@/lib/firebase/config"; // SMS connection
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Loader2, ShieldCheck, X } from "lucide-react";

interface CheckoutGuardProps {
  children: React.ReactNode;
  onVerified: () => void;
}

export default function CheckoutGuard({ children, onVerified }: CheckoutGuardProps) {
  const supabase = createClient();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  
  // Firebase State
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  // 1. THE GUARD LOGIC 🛡️ (Checks Supabase Database)
  const handleGuardCheck = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      window.location.href = "/login"; 
      return;
    }

    // Check Database Status
    const { data: profile } = await supabase
      .from('profiles')
      .select('mobile_verified, mobile_session_expiry, phone')
      .eq('id', user.id)
      .single();

    if (!profile) return;

    const now = new Date();
    const expiry = profile.mobile_session_expiry ? new Date(profile.mobile_session_expiry) : null;
    
    // CONDITION: If not verified OR Session Expired -> Block & Verify
    if (!profile.mobile_verified || !expiry || now > expiry) {
        setStep('PHONE');
        // Pre-fill phone if we know it, removing the +91 prefix for the input display
        if (profile.phone) setPhone(profile.phone.replace(/^\+91/, ''));
        setShowModal(true);
        setLoading(false);
        return;
    }

    // SUCCESS: Gate Open! 🚀
    setLoading(false);
    onVerified(); 
  };

  // 2. FIREBASE RECAPTCHA SETUP
  useEffect(() => {
    if (!showModal || step !== 'PHONE') return;

    // Initialize invisible recaptcha
    if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
                // reCAPTCHA solved, allow signInWithPhoneNumber.
            }
        });
    }
    
    return () => {
        if(window.recaptchaVerifier) {
            window.recaptchaVerifier.clear();
            window.recaptchaVerifier = undefined;
        }
    }
  }, [showModal, step]);


  // 3. FIREBASE: Send SMS
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return alert("Enter valid number");
    
    setLoading(true);
    const fullPhone = `+91${phone}`;
    const appVerifier = window.recaptchaVerifier;

    try {
        const result = await signInWithPhoneNumber(auth, fullPhone, appVerifier);
        setConfirmationResult(result); // Save the result to verify later
        setStep('OTP');
    } catch (error: any) {
        console.error(error);
        alert("SMS Failed: " + error.message);
        // Reset captcha on failure
        if(window.recaptchaVerifier) window.recaptchaVerifier.clear();
    } finally {
        setLoading(false);
    }
  };


  // 4. FIREBASE + SUPABASE: Verify & Save
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);

    try {
        // A. Verify with Firebase
        await confirmationResult.confirm(otp);
        
        // B. Update Supabase Database (Hybrid Magic ✨)
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const sessionTime = new Date();
            sessionTime.setMinutes(sessionTime.getMinutes() + 45); // +45 Mins

            await supabase.from('profiles').update({
                mobile_verified: true,
                phone: `+91${phone}`,
                mobile_session_expiry: sessionTime.toISOString()
            }).eq('id', user.id);
        }

        // C. Success!
        setShowModal(false);
        onVerified();

    } catch (error) {
        alert("Invalid Code");
    } finally {
        setLoading(false);
    }
  };


  return (
    <>
      <div onClick={handleGuardCheck} className="w-full">
        {children}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl relative animate-in zoom-in-95">
              
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center mb-6">
                <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center mb-3">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-black text-lg uppercase">Security Check</h3>
                <p className="text-sm text-gray-500 text-center">
                    {step === 'PHONE' ? "Verify mobile number via Firebase" : "Enter the code sent to your phone."}
                </p>
              </div>

              {step === 'PHONE' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="font-bold text-gray-400">🇮🇳 +91</span>
                      <input 
                        type="tel" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="bg-transparent w-full outline-none font-bold"
                        placeholder="98765 43210"
                        autoFocus
                      />
                    </div>
                    {/* Hidden div for Recaptcha */}
                    <div id="recaptcha-container"></div>
                    
                    <button disabled={loading} className="w-full bg-black text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Send OTP"}
                    </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <input 
                        type="text" 
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="w-full text-center text-3xl font-black tracking-widest py-3 border-b-2 border-gray-200 focus:border-black outline-none"
                        placeholder="123456"
                        maxLength={6}
                        autoFocus
                    />
                    <button disabled={loading} className="w-full bg-black text-white h-12 rounded-xl font-bold flex items-center justify-center gap-2">
                        {loading ? <Loader2 className="animate-spin w-4 h-4"/> : "Verify & Pay"}
                    </button>
                </form>
              )}
           </div>
        </div>
      )}
    </>
  );
}

// Add types for window
declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}