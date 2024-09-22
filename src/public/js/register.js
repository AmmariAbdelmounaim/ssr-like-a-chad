function showForm(formType) {
  const utilisateurForm = document.getElementById("utilisateurForm");
  const agentForm = document.getElementById("agentForm");
  const utilisateurBtn = document.getElementById("utilisateurBtn");
  const agentBtn = document.getElementById("agentBtn");

  if (formType === "utilisateur") {
    utilisateurForm.classList.remove("hidden");
    agentForm.classList.add("hidden");
    utilisateurBtn.classList.add("bg-primary", "text-primary-foreground");
    utilisateurBtn.classList.remove("bg-transparent", "text-foreground");
    agentBtn.classList.remove("bg-primary", "text-primary-foreground");
    agentBtn.classList.add("bg-transparent", "text-foreground");
  } else {
    agentForm.classList.remove("hidden");
    utilisateurForm.classList.add("hidden");
    utilisateurBtn.classList.remove("bg-primary", "text-primary-foreground");
    utilisateurBtn.classList.add("bg-transparent", "text-foreground");
    agentBtn.classList.add("bg-primary", "text-primary-foreground");
    agentBtn.classList.remove("bg-transparent", "text-foreground");
  }
}

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

// Function to validate the "Nom" field
function validateNom(nomValue, errorId) {
  if (nomValue.trim() === "") {
    showError(errorId, "Le nom est obligatoire");
    return false;
  }
  hideError(errorId);
  return true;
}

// Function to validate Utilisateur form
async function validateUtilisateurForm(event) {
  event.preventDefault();
  let emailValid = true;
  let passwordValid = true;
  let nomValid = true;
  const error = document.getElementById("error");

  const nomUtilisateur = document.getElementById("nom-utilisateur");
  const emailUtilisateur = document.getElementById("email-utilisateur");
  const passwordUtilisateur = document.getElementById("password-utilisateur");

  // Validate nom
  if (!validateNom(nomUtilisateur.value, "nom-utilisateur-error")) {
    nomValid = false;
  }

  // Validate email
  if (!validateEmail(emailUtilisateur.value)) {
    showError("email-utilisateur-error", "Email Invalide");
    emailValid = false;
  } else {
    hideError("email-utilisateur-error");
    emailValid = true;
  }

  // Validate password
  if (passwordUtilisateur.value.length < 6) {
    showError("password-utilisateur-error", "Mot de passe invalide");
    passwordValid = false;
  } else {
    hideError("password-utilisateur-error");
    passwordValid = true;
  }

  if (emailValid && passwordValid && nomValid) {
    const formData = new FormData(event.target);
    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });
    console.log(jsonData);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        console.log("Form submitted successfully");
        window.location.href = "/auth/login";
      } else {
        error.classList.remove("hidden");
        error.classList.add("flex");
        error.textContent = "Utilisateur déjà enregistré.";
      }
    } catch (error) {
      error.classList.remove("hidden");
      error.classList.add("flex");
      error.textContent = "Échec de l'enregistrement. Veuillez réessayer.";
    }
  }
}

// Function to validate Agent form
async function validateAgentForm(event) {
  event.preventDefault();
  let emailValid = true;
  let passwordValid = true;
  let companyValid = true;
  let nomValid = true;
  const error = document.getElementById("error");

  const nomAgent = document.getElementById("nom-agent");
  const emailAgent = document.getElementById("email-agent");
  const passwordAgent = document.getElementById("password-agent");
  const company = document.getElementById("company");

  // Validate nom
  if (!validateNom(nomAgent.value, "nom-agent-error")) {
    nomValid = false;
  }

  // Validate email
  if (!validateEmail(emailAgent.value)) {
    showError("email-agent-error", "Email Invalide");
    emailValid = false;
  } else {
    hideError("email-agent-error");
    emailValid = true;
  }

  // Validate password
  if (passwordAgent.value.length < 6) {
    showError("password-agent-error", "Password invalide");
    passwordValid = false;
  } else {
    hideError("password-agent-error");
    passwordValid = true;
  }

  // Validate company
  if (company.value.trim() === "") {
    showError("company-error", "Nom de l'entreprise obligatoire");
    companyValid = false;
  } else {
    hideError("company-error");
    companyValid = true;
  }

  if (emailValid && passwordValid && companyValid && nomValid) {
    const formData = new FormData(event.target);
    const jsonData = {};
    formData.forEach((value, key) => {
      jsonData[key] = value;
    });

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(jsonData),
      });

      if (response.ok) {
        console.log("Form submitted successfully");
        window.location.href = "/auth/login";
      } else {
        error.classList.remove("hidden");
        error.classList.add("flex");
        error.textContent = "Utilisateur déjà enregistré.";
      }
    } catch (error) {
      error.classList.remove("hidden");
      error.classList.add("flex");
      error.textContent = "Échec de l'enregistrement. Veuillez réessayer.";
    }
  }
}

// Attach event listeners to forms
document.addEventListener("DOMContentLoaded", (event) => {
  document
    .getElementById("utilisateurForm")
    .addEventListener("submit", validateUtilisateurForm);
  document
    .getElementById("agentForm")
    .addEventListener("submit", validateAgentForm);
});
