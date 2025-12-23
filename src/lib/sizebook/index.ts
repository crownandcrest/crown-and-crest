// Phase 13: Sizebook Foundation - Barrel Exports
// Purpose: Centralized exports for Sizebook module

// Recommendation engine (pure functions, no side effects)
export {
  computeSizeRecommendation,
  validateMeasurements,
  hasCommonMeasurements,
} from './recommendation';

// Admin server actions (require admin role)
export {
  createSizeProfile,
  updateSizeProfile,
  deleteSizeProfile,
  listSizeProfiles,
  assignSizeProfileToProduct,
  removeSizeProfileFromProduct,
  getProductSizeProfiles,
  updateProductSizeProfileNotes,
} from './admin-actions';

// User server actions (require authenticated user)
export {
  saveUserSizeProfile,
  getUserSizeProfile,
  getAllUserSizeProfiles,
  deleteUserSizeProfile,
  hasUserSizeProfile,
} from './user-actions';
