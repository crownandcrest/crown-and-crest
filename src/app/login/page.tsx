"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Phone, Mail, Lock, User, ArrowRight } from "lucide-react";

declare global {
  interface Window {
    recaptchaVerifier: any;
    confirmationResult: any;
  }
}

export default function LoginPage() {
    const supabase = createClient();
    const router = useRouter();
    
    // --- MODE SWITCHING ---
    const [authMethod, setAuthMethod] = useState<"PHONE" | "EMAIL">("PHONE");
    const [emailMode, setEmailMode] = useState<"LOGIN" | "SIGNUP">("LOGIN");

    // --- FORM STATES ---
    const [loading, setLoading] = useState(false);
    
    // Phone State
    const [phone, setPhone] = useState("");
    const [otp, setOtp] = useState("");
    const [phoneStep, setPhoneStep] = useState<"PHONE" | "OTP" | "PROFILE">("PHONE");
    
    // Email State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState(""); // Used for both Phone Profile & Email Signup

    // --- RECAPTCHA SETUP (Only for Phone) ---
    useEffect(() => {
        if (authMethod === "PHONE" && phoneStep === "PHONE") {
            // Clean up old instances
            if (window.recaptchaVerifier) {
                try { window.recaptchaVerifier.clear(); } catch(e) {}
                window.recaptchaVerifier = null;
            }

            try {
                window.recaptchaVerifier = new RecaptchaVerifier(firebaseAuth, 'recaptcha-container', {
                    'size': 'invisible',
                    'callback': () => console.log("Recaptcha verified"),
                });
            } catch (err) {
                console.error("Recaptcha init error", err);
            }
        }
    }, [authMethod, phoneStep]);


    // ==============================
    // 🟢 PHONE LOGIC
    // ==============================
    const handlePhoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const cleanPhone = phone.replace(/\D/g, ''); 
            const formatPh = `+91${cleanPhone}`;
            
            // 1. Send OTP
            const confirmationResult = await signInWithPhoneNumber(firebaseAuth, formatPh, window.recaptchaVerifier);
            window.confirmationResult = confirmationResult;
            setPhoneStep("OTP");
        } catch (error: any) {
            console.error(error);
            alert("Error sending SMS: " + error.message);
            window.location.reload(); // Reload to reset captcha on error
        }
        setLoading(false);
    };

    const handleOtpVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 2. Verify OTP
            const result = await window.confirmationResult.confirm(otp);
            const firebaseToken = await result.user.getIdToken();

            // 3. Check with Backend (The Code we wrote earlier)
            const response = await fetch('/api/auth/firebase-login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    idToken: firebaseToken,
                    userData: { 
                        fullName: fullName, 
                        email: email // Send email if we collected it in Profile step
                    } 
                })
            });

            const data = await response.json();

            if (data.requiresProfile) {
                // Backend says: "New user! Ask for details."
                setPhoneStep("PROFILE");
                setLoading(false);
                return; // Stop here, let user fill form
            }

            if (data.success) {
                // Login Success! Set Session and Go.
                if (data.token) {
                    await supabase.auth.setSession({
                        access_token: data.token,
                        refresh_token: data.token, // This token acts as both for simplicity
                    });
                }
                router.push("/shop");
            } else {
                alert("Login failed: " + data.error);
            }

        } catch (error: any) {
            console.error(error);
            alert("Invalid OTP");
        }
        setLoading(false);
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        // User filled Name/Email -> Retry verification logic to create account
        handleOtpVerify(e); 
    };


    // ==============================
    // 🔵 EMAIL LOGIC (Supabase Native)
    // ==============================
    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (emailMode === "SIGNUP") {
                // --- SIGN UP ---
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName, // This triggers our DB function!
                            role: 'customer'
                        }
                    }
                });
                
                if (error) throw error;
                alert("Account created! Logging you in...");
                router.push("/shop");

            } else {
                // --- LOGIN ---
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });

                if (error) throw error;
                router.push("/shop");
            }
        } catch (error: any) {
            alert(error.message);
        }
        setLoading(false);
    };


    // ==============================
    // 🎨 UI RENDER
    // ==============================
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-gray-100">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black mb-2 uppercase tracking-tight">Welcome</h1>
                    <p className="text-gray-500 text-sm">Sign in to access your account</p>
                </div>

                {/* TABS */}
                <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                    <button 
                        onClick={() => setAuthMethod("PHONE")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMethod === "PHONE" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Phone
                    </button>
                    <button 
                        onClick={() => setAuthMethod("EMAIL")}
                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${authMethod === "EMAIL" ? "bg-white shadow-sm text-black" : "text-gray-400 hover:text-gray-600"}`}
                    >
                        Email
                    </button>
                </div>

                {/* --- PHONE FORM --- */}
                {authMethod === "PHONE" && (
                    <>
                        <div id="recaptcha-container"></div>
                        
                        {phoneStep === "PHONE" && (
                            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Mobile Number</label>
                                    <div className="flex mt-1">
                                        <div className="bg-gray-100 border border-gray-200 border-r-0 rounded-l-xl px-3 flex items-center">
                                            <span className="font-bold text-gray-500 text-sm">+91</span>
                                        </div>
                                        <input 
                                            type="tel" 
                                            className="w-full p-3 border border-gray-200 rounded-r-xl outline-none focus:border-black font-medium"
                                            placeholder="9876543210"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            maxLength={10}
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin w-5 h-5"/> : <>Send OTP <ArrowRight className="w-4 h-4"/></>}
                                </button>
                            </form>
                        )}

                        {phoneStep === "OTP" && (
                            <form onSubmit={handleOtpVerify} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Enter OTP</label>
                                    <input 
                                        type="text" 
                                        className="w-full p-3 mt-1 border border-gray-200 rounded-xl outline-none focus:border-black text-center text-2xl tracking-[0.5em] font-bold"
                                        placeholder="123456"
                                        maxLength={6}
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                    />
                                </div>
                                <button disabled={loading} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Verify & Login"}
                                </button>
                                <button type="button" onClick={() => setPhoneStep("PHONE")} className="w-full text-xs text-gray-400 hover:text-black underline mt-2">
                                    Wrong number? Change
                                </button>
                            </form>
                        )}

                        {phoneStep === "PROFILE" && (
                            <form onSubmit={handleProfileSubmit} className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                                <div className="p-4 bg-blue-50 text-blue-600 text-xs font-medium rounded-xl mb-4">
                                    Almost there! We just need your name to finish creating your account.
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                    <div className="relative mt-1">
                                        <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                        <input 
                                            type="text" 
                                            className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                                            placeholder="John Doe"
                                            required
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Email (Optional)</label>
                                    <div className="relative mt-1">
                                        <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                        <input 
                                            type="email" 
                                            className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                                            placeholder="john@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <button disabled={loading} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin w-5 h-5"/> : "Complete Setup"}
                                </button>
                            </form>
                        )}
                    </>
                )}

                {/* --- EMAIL FORM --- */}
                {authMethod === "EMAIL" && (
                    <form onSubmit={handleEmailAuth} className="space-y-4">
                        
                        {emailMode === "SIGNUP" && (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase">Full Name</label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                                        placeholder="John Doe"
                                        required
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Email Address</label>
                            <div className="relative mt-1">
                                <Mail className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                <input 
                                    type="email" 
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                                    placeholder="john@example.com"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase">Password</label>
                            <div className="relative mt-1">
                                <Lock className="absolute left-3 top-3.5 w-5 h-5 text-gray-300" />
                                <input 
                                    type="password" 
                                    className="w-full pl-10 p-3 border border-gray-200 rounded-xl outline-none focus:border-black"
                                    placeholder="••••••••"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button disabled={loading} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-900 transition flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="animate-spin w-5 h-5"/> : (emailMode === "LOGIN" ? "Login" : "Create Account")}
                        </button>

                        <div className="text-center pt-2">
                            <button 
                                type="button"
                                onClick={() => setEmailMode(emailMode === "LOGIN" ? "SIGNUP" : "LOGIN")}
                                className="text-xs text-gray-500 font-bold hover:underline"
                            >
                                {emailMode === "LOGIN" ? "New here? Create an account" : "Already have an account? Login"}
                            </button>
                        </div>
                    </form>
                )}

            </div>
        </div>
    );
}