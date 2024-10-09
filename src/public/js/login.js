document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("login-form");
  form.addEventListener("submit", validateLoginForm);
});

// Function to validate email format
function validateEmail(email) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email);
}

// Function to show error messages
function showError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

// Function to hide error messages
function hideError(errorId) {
  const errorElement = document.getElementById(errorId);
  errorElement.classList.add("hidden");
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}

async function validateLoginForm(event) {
  event.preventDefault();
  let isValidEmail = true;
  let isValidPassword = true;

  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const error = document.getElementById("error");

  // Validate email
  if (!validateEmail(email.value)) {
    showError("email-error", "Email invalide");
    isValidEmail = false;
  } else {
    hideError("email-error");
  }

  // Validate password
  if (password.value.length < 6) {
    showError("password-error", "Mot de passe invalide");
    isValidPassword = false;
  } else {
    hideError("password-error");
  }

  if (isValidEmail && isValidPassword) {
    const formData = new FormData(event.target);
    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      const data = await response.json();

      if (data.role === "user") {
        window.location.href = "/annonce";
      } else if (data.role === "agent") {
        window.location.href = "/dashboard";
      } else {
        error.classList.remove("hidden");
        error.classList.add("flex");
        error.textContent = "Email ou mot de passe incorrect";
      }
    } catch (error) {
      error.classList.remove("hidden");
      error.classList.add("flex");
      error.textContent = "Erreur serveur";
    }
  }
}
