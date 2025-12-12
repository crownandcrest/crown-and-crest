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
    console.log("API KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    const supabase = createClient();
    const router = useRouter();
    
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState<"PHONE" | "OTP">("PHONE");
    const [loading, setLoading] = useState(false);

    // 1. Initialize Recaptcha Safely
    const setupRecaptcha = () => {
        // A. Check if already exists to avoid "Already Rendered" error
        if (window.recaptchaVerifier) {
            return window.recaptchaVerifier;
        }

        // B. Create new instance
        const verifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
            'size': 'invisible',
            'callback': () => {
                console.log("Recaptcha resolved");
            },
            'expired-callback': () => {
                console.log("Recaptcha expired");
                if(window.recaptchaVerifier) {
                    window.recaptchaVerifier.clear();
                    window.recaptchaVerifier = null;
                }
            }
        });

        window.recaptchaVerifier = verifier;
        return verifier;
    };

    // Initialize on mount (and cleanup on unmount)
    useEffect(() => {
        setupRecaptcha();
        
        // Cleanup function to remove widget when leaving page
        return () => {
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
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

        setLoading(true);

        try {
            // Ensure verifier is ready
            const appVerifier = setupRecaptcha();
            
            const cleanPhone = phone.replace(/\D/g, ''); 
            const formatPh = `+91${cleanPhone}`;

            console.log("Sending OTP to:", formatPh);
            
            const confirmationResult = await signInWithPhoneNumber(firebaseAuth, formatPh, appVerifier);
            window.confirmationResult = confirmationResult;
            setStep("OTP");
            
        } catch (error: any) {
            console.error("Firebase Error:", error);
            
            // If error is related to recaptcha, clear it so we can try again
            if (window.recaptchaVerifier) {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            }

            if (error.code === 'auth/invalid-phone-number') {
                alert("Invalid phone number format.");
            } else if (error.code === 'auth/too-many-requests') {
                alert("Too many requests. Please try again later.");
            } else if (error.code === 'auth/invalid-app-credential') {
                alert("App not authorized. Check Firebase Console -> Settings -> Authorized Domains.");
            } else {
                alert("Error: " + error.message);
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
                        <button disabled={loading} className="w-full bg-black text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2 disabled:opacity-70">
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
                        <button type="button" onClick={() => setStep("PHONE")} className="w-full text-xs text-gray-500 underline mt-2 text-center block">
                            Wrong number? Go back
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}