"use server";

import { supabaseAdmin } from "@/lib/supabase/admin";

export async function firebaseLoginBridge(phone: string) {
  // 1. Standardize the "Shadow Email" for this phone user
  // (Supabase needs an email to work best, so we create a fake internal one)
  const cleanPhone = phone.replace('+', '');
  const shadowEmail = `${cleanPhone}@mobile.crowncrest.com`;

  // 2. Check if user exists
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = users.find(u => u.email === shadowEmail);

  let userId = existingUser?.id;

  // 3. If New User -> Create them
  if (!userId) {
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: shadowEmail,
      email_confirm: true,
      phone: phone,
      phone_confirm: true,
      user_metadata: { full_name: "Mobile User" }
    });
    
    if (createError) return { error: createError.message };
    userId = newUser.user.id;

    // Create Profile entry
    await supabaseAdmin.from('profiles').insert({
        id: userId,
        phone: phone,
        mobile_verified: true,
        full_name: "Mobile User",
        role: "customer"
    });
  // ... (End user creation logic)

  // 👇 UPDATED PART:
  // We point the redirect to the Callback Route we just built
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: shadowEmail,
    options: {
        // This ensures they go to /auth/callback to set the cookie
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/shop` 
    }
  });

  if (linkError) return { error: linkError.message };

  // 5. Return the link so the frontend can "click" it
  return { url: linkData.properties.action_link };
}}