// src/lib/utils/email-utils.ts

/**
 * Normalizes an email address by converting it to lowercase.
 * This should be used before storing or comparing emails in your database.
 * * @param email The raw email string (e.g., "RajveerBoddh@Gmail.com").
 * @returns The normalized, lowercase email string (e.g., "rajveerboddh@gmail.com").
 */
export function normalizeEmail(email: string): string {
    if (!email) {
        return '';
    }
    // Simple, reliable conversion to lowercase
    return email.toLowerCase().trim();
}