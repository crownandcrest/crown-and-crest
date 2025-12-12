import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import admin from "firebase-admin";
import jwt from "jsonwebtoken";

// 1. Initialize Firebase Admin (Server-Side)
if (!admin.apps.length) {
  // We use standard env vars for the service account
  // If you downloaded a JSON file, you can just map these values in .env.local
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // Handle newline characters in private key properly
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// 2. Initialize Supabase Admin (Needs Service Role Key to bypass RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, 
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
        return NextResponse.json({ error: "Missing ID Token" }, { status: 400 });
    }

    // A. Verify the Firebase Token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const phone = decodedToken.phone_number; // E.g., "+919876543210"
    const firebaseUid = decodedToken.uid;

    if (!phone) {
      return NextResponse.json({ error: "Phone number missing in token" }, { status: 400 });
    }

    // B. Check if user exists in Supabase
    // We create a fake email because Supabase usually expects one for user management
    const fakeEmail = `${phone.replace('+', '')}@crownandcrest.com`;

    const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
    let supabaseUser = users.find(u => u.email === fakeEmail);

    // C. If user doesn't exist, create them in Supabase
    if (!supabaseUser) {
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: fakeEmail,
        phone: phone,
        email_confirm: true,
        phone_confirm: true,
        user_metadata: { firebase_uid: firebaseUid },
      });
      
      if (createError) throw createError;
      supabaseUser = newUser.user;
    }

    // D. Generate a Supabase JWT
    // This allows the frontend to act as this user with RLS permissions
    const payload = {
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      sub: supabaseUser?.id,
      email: fakeEmail,
      role: "authenticated",
      phone: phone,
    };

    // Sign using your Supabase JWT Secret
    const supabaseAccessToken = jwt.sign(payload, process.env.SUPABASE_JWT_SECRET!);

    return NextResponse.json({
      success: true, 
      token: supabaseAccessToken,
      user: supabaseUser 
    });

  } catch (error: any) {
    console.error("Bridge Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}