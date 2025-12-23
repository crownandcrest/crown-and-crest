// Phase 13: Sizebook Foundation - User Server Actions
// Purpose: User profile management (save/update/get size measurements)
// Guards: All actions require authenticated user (not admin)

'use server';

import { supabaseServer } from '@/lib/supabase/server';
import { getCurrentUser } from '@/lib/auth';
import { validateMeasurements } from './recommendation';
import type {
  UserSizeProfile,
  SaveUserSizeProfilePayload,
  SizebookActionResult,
} from '@/types/sizebook';

// ==========================================
// User Size Profile CRUD
// ==========================================

/**
 * Save or update user's size profile for a category
 * Creates new profile if doesn't exist, updates if exists
 * 
 * @example
 * ```ts
 * const result = await saveUserSizeProfile({
 *   category: 'men_top',
 *   measurements: { chest_cm: 98, waist_cm: 84, shoulder_cm: 46, length_cm: 74 }
 * });
 * ```
 */
export async function saveUserSizeProfile(
  payload: SaveUserSizeProfilePayload
): Promise<SizebookActionResult<UserSizeProfile>> {
  try {
    // Authentication guard
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Validate measurements are within reasonable ranges
    const validation = validateMeasurements(payload.measurements);
    if (!validation.valid) {
      return {
        success: false,
        error: `Invalid measurements: ${validation.errors.join(', ')}`,
      };
    }

    // Upsert (insert or update if exists)
    const { data, error } = await supabaseServer
      .from('user_size_profile')
      .upsert(
        {
          user_uid: user.uid,
          category: payload.category,
          measurements: payload.measurements,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_uid,category',  // Unique constraint
        }
      )
      .select()
      .single();

    if (error) {
      console.error('[saveUserSizeProfile] Database error:', error);
      return { success: false, error: 'Failed to save size profile' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[saveUserSizeProfile] Error:', error);
    return { success: false, error: 'Failed to save size profile' };
  }
}

/**
 * Get user's size profile for a specific category
 * Returns null if user hasn't set up profile for this category
 * 
 * @example
 * ```ts
 * const result = await getUserSizeProfile('men_top');
 * if (result.success && result.data) {
 *   console.log('User chest:', result.data.measurements.chest_cm);
 * }
 * ```
 */
export async function getUserSizeProfile(
  category: string
): Promise<SizebookActionResult<UserSizeProfile | null>> {
  try {
    // Authentication guard
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    const { data, error } = await supabaseServer
      .from('user_size_profile')
      .select('*')
      .eq('user_uid', user.uid)
      .eq('category', category)
      .maybeSingle();  // Returns null if not found (not an error)

    if (error) {
      console.error('[getUserSizeProfile] Database error:', error);
      return { success: false, error: 'Failed to get size profile' };
    }

    return { success: true, data };
  } catch (error) {
    console.error('[getUserSizeProfile] Error:', error);
    return { success: false, error: 'Failed to get size profile' };
  }
}

/**
 * Get all size profiles for current user (all categories)
 * Useful for "My Profile" page showing all saved measurements
 */
export async function getAllUserSizeProfiles(): Promise<
  SizebookActionResult<UserSizeProfile[]>
> {
  try {
    // Authentication guard
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    const { data, error } = await supabaseServer
      .from('user_size_profile')
      .select('*')
      .eq('user_uid', user.uid)
      .order('category', { ascending: true });

    if (error) {
      console.error('[getAllUserSizeProfiles] Database error:', error);
      return { success: false, error: 'Failed to get size profiles' };
    }

    return { success: true, data: data ?? [] };
  } catch (error) {
    console.error('[getAllUserSizeProfiles] Error:', error);
    return { success: false, error: 'Failed to get size profiles' };
  }
}

/**
 * Delete user's size profile for a specific category
 * Useful if user wants to remove their saved measurements
 */
export async function deleteUserSizeProfile(
  category: string
): Promise<SizebookActionResult> {
  try {
    // Authentication guard
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    const { error } = await supabaseServer
      .from('user_size_profile')
      .delete()
      .eq('user_uid', user.uid)
      .eq('category', category);

    if (error) {
      console.error('[deleteUserSizeProfile] Database error:', error);
      return { success: false, error: 'Failed to delete size profile' };
    }

    return { success: true, data: undefined };
  } catch (error) {
    console.error('[deleteUserSizeProfile] Error:', error);
    return { success: false, error: 'Failed to delete size profile' };
  }
}

// ==========================================
// Public Helper (No Auth Required)
// ==========================================

/**
 * Check if user has a size profile for a category (public, no sensitive data)
 * Used by PDP to decide whether to show "Set up your profile" prompt
 */
export async function hasUserSizeProfile(
  category: string
): Promise<SizebookActionResult<boolean>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: false };  // Not logged in = no profile
    }

    const { count, error } = await supabaseServer
      .from('user_size_profile')
      .select('id', { count: 'exact', head: true })
      .eq('user_uid', user.uid)
      .eq('category', category);

    if (error) {
      console.error('[hasUserSizeProfile] Database error:', error);
      return { success: false, error: 'Failed to check profile' };
    }

    return { success: true, data: (count ?? 0) > 0 };
  } catch (error) {
    console.error('[hasUserSizeProfile] Error:', error);
    return { success: false, error: 'Failed to check profile' };
  }
}
