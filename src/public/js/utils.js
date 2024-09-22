// Function to validate email format
export function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Function to show error messages
export function showError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

// Function to hide error messages
export function hideError(errorId) {
  const errorElement = document.getElementById(errorId);
  errorElement.classList.add("hidden");
}
