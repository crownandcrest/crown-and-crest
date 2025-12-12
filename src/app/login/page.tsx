"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [loading, setLoading] = useState(false);
    const [isRecaptchaReady, setIsRecaptchaReady] = useState(false);

    // 1. Strict Initialization on Mount
    useEffect(() => {
        // CLEANUP: If an old one exists, destroy it immediately
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
            } catch (err) {
                console.warn("Could not clear old recaptcha", err);
            }
            window.recaptchaVerifier = null;
        }

        // CREATE: New instance
        try {
            const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                'size': 'invisible',
                'callback': () => {
                    console.log("Recaptcha resolved");
                },
                'expired-callback': () => {
                    console.log("Recaptcha expired");
                    setIsRecaptchaReady(false);
                }
            });

            window.recaptchaVerifier = verifier;
            setIsRecaptchaReady(true);
        } catch (error) {
            console.error("Recaptcha init failed", error);
        }

        // UNMOUNT: Cleanup when leaving page
        return () => {
            if (window.recaptchaVerifier) {
                try {
                    window.recaptchaVerifier.clear();
                } catch (e) {}
                window.recaptchaVerifier = null;
            }
        };
    }, []);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!phone || phone.length < 10) {
            alert("Please enter a valid 10-digit mobile number.");
            return;
        }

        if (!isRecaptchaReady || !window.recaptchaVerifier) {
            alert("Security check not ready. Please refresh the page.");
            return;
        }

        setLoading(true);

        try {
            const cleanPhone = phone.replace(/\D/g, ''); 
            const formatPh = `+91${cleanPhone}`;

            console.log("Sending OTP to:", formatPh);
            
            // USE EXISTING VERIFIER (Do not create a new one here!)
            const confirmationResult = await signInWithPhoneNumber(firebaseAuth, formatPh, window.recaptchaVerifier);
            
            window.confirmationResult = confirmationResult;
            setStep("OTP");
            
        } catch (error: any) {
            console.error("Firebase Error:", error);
            
            // If captcha failed, we might need to reset it
            if (error.code === 'auth/captcha-check-failed') {
                alert("Captcha failed. Please refresh.");
            } else if (error.code === 'auth/invalid-phone-number') {
                alert("Invalid phone number.");
            } else if (error.code === 'auth/too-many-requests') {
                alert("Too many attempts. Try again later.");
            } else {
                alert("Error: " + error.message);
            }
            
            // Reset loader so user can try again
            setLoading(false);
            
            // Force reload page on critical error so Captcha resets cleanly
            if (error.message.includes("reCAPTCHA")) {
                 window.location.reload();
            }
        }
        setLoading(false);
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (!window.confirmationResult) throw new Error("No OTP request found");

            // 1. Verify with Firebase
            const result = await window.confirmationResult.confirm(otp);
            const firebaseToken = await result.user.getIdToken();

            // 2. Call our Bridge API to get Supabase Session
            const response = await fetch('/api/auth/firebase-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken: firebaseToken })
            });

            const data = await response.json();

            if (data.success) {
                // 3. Log in to Supabase Client
                const { error } = await supabase.auth.setSession({
                    access_token: data.token,
                    refresh_token: data.token,
                });

                if (error) throw error;
                router.push("/shop");
            } else {
                alert("Login Failed: " + data.error);
            }

        } catch (error: any) {
            console.error(error);
            alert("Invalid OTP or Server Error");
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-2xl font-black mb-6 uppercase text-center">Login</h1>
                
                {/* REQUIRED: Invisible Recaptcha Container */}
                <div id="recaptcha-container"></div>

                {step === "PHONE" ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Mobile Number</label>
                            <div className="flex">
                                <span className="p-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 font-bold">+91</span>
                                <input 
                                    type="tel" 
                                    className="w-full p-3 border border-gray-200 rounded-r-xl outline-none focus:border-black"
                                    placeholder="9876543210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    maxLength={10}
                                />
                            </div>
                        </div>
                        <button disabled={loading || !isRecaptchaReady} className="w-full bg-black text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Enter OTP</label>
                            <input 
                                type="text" 
                                className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-black text-center text-xl tracking-[0.5em] font-bold"
                                placeholder="123456"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                maxLength={6}
                            />
                        </div>
                        <button disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-70">
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Verify & Login"}
                        </button>
                        <button type="button" onClick={() => window.location.reload()} className="w-full text-xs text-gray-500 underline mt-2 text-center block">
                            Wrong number? Go back
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}