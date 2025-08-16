const COPY = {
  // Network / throttling
  "auth/network-request-failed": "Network issue. Please check your internet and try again.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and retry.",

  // Email/password
  "auth/email-already-in-use": "This email is already registered. Try logging in or reset your password.",
  "auth/invalid-email": "That email address looks invalid.",
  "auth/weak-password": "Your password is too weak. Please use at least 8 characters with a mix of letters and numbers.",
  "auth/invalid-credential": "Invalid email or password.",
  "auth/user-not-found": "Invalid email or password.",
  "auth/wrong-password": "Invalid email or password.",

  // Project/config
  "auth/operation-not-allowed": "Sign-ups are currently disabled. Please contact support.",
};

export function authErrorToCopy(code, fallback = "Something went wrong. Please try again.") {
  if (!code) return fallback;
  return COPY[code] || fallback;
}
