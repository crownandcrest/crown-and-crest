import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";
import { supabaseAdmin } from "@/lib/supabase/admin";
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
  try {
    const { idToken, userData } = await req.json();

    // 1. Verify the Firebase Token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const phone = decodedToken.phone_number;
    const firebaseUid = decodedToken.uid;

    if (!phone) {
      return NextResponse.json({ success: false, error: "No phone number in token" }, { status: 400 });
    }

    // 2. Check if user already exists in Supabase
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    let supabaseUser = listData.users.find(u => u.phone === phone);

    // 3. NEW USER LOGIC
    if (!supabaseUser) {
        
        // A. If frontend didn't send profile data yet, tell them to ask the user!
        if (!userData || !userData.fullName) {
            return NextResponse.json({ 
                success: false, 
                requiresProfile: true 
            });
        }

        // B. We have the data -> Create the user
        // The Database Trigger we wrote earlier will auto-create the 'profile' row
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: userData.email || undefined, // Email is optional for phone login
            phone: phone,
            email_confirm: true,
            phone_confirm: true,
            user_metadata: { 
                firebase_uid: firebaseUid,
                full_name: userData.fullName, // <--- This is what we needed!
            },
        });

        if (createError) throw createError;
        supabaseUser = newUser.user;
    }

    // 4. Generate a Session Token for Supabase
    // This allows the frontend to be "Logged In" and access RLS-protected data
    const payload = {
        aud: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
        sub: supabaseUser.id,
        email: supabaseUser.email,
        phone: supabaseUser.phone,
        role: "authenticated",
        app_metadata: { provider: "firebase" },
        user_metadata: supabaseUser.user_metadata
    };
    
    // Sign the token using your Project Secret
    const token = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET!);

    return NextResponse.json({ 
        success: true, 
        token: token,
        user: supabaseUser 
    });

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}