document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("new-listing-form");
  form.addEventListener("submit", validateListingForm);
});

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

async function validateListingForm(event) {
  event.preventDefault();
  let isTitleValid = true;
  let isPropertyTypeValid = true;
  let isPublicationStatusValid = true;
  let isPropertyStatusValid = true;
  let isDescriptionValid = true;
  let isPriceValid = true;
  let isAvailabilityDateValid = true;

  const title = document.getElementById("title");
  const propertyType = document.getElementById("propertyType");
  const publicationStatus = document.getElementById("publicationStatus");
  const propertyStatus = document.getElementById("propertyStatus");
  const description = document.getElementById("description");
  const price = document.getElementById("price");
  const availabilityDate = document.getElementById("availabilityDate");
  const error = document.getElementById("error");

  // Validate title
  if (title.value.trim() === "") {
    showError("title-error", "Title is required");
    isTitleValid = false;
  } else {
    isTitleValid = true;
    hideError("title-error");
  }

  // Validate property type
  if (propertyType.value.trim() === "") {
    showError("propertyType-error", "Property type is required");
    isPropertyTypeValid = false;
  } else {
    isPropertyTypeValid = true;
    hideError("propertyType-error");
  }

  // Validate publication status
  if (publicationStatus.value.trim() === "") {
    showError("publicationStatus-error", "Publication status is required");
    isPublicationStatusValid = false;
  } else {
    isPublicationStatusValid = true;
    hideError("publicationStatus-error");
  }

  // Validate property status
  if (propertyStatus.value.trim() === "") {
    showError("propertyStatus-error", "Property status is required");
    isPropertyStatusValid = false;
  } else {
    isPropertyStatusValid = true;
    hideError("propertyStatus-error");
  }

  // Validate description
  if (description.value.trim() === "") {
    showError("description-error", "Description is required");
    isDescriptionValid = false;
  } else {
    isDescriptionValid = true;
    hideError("description-error");
  }

  // Validate price
  if (
    price.value.trim() === "" ||
    isNaN(price.value) ||
    Number(price.value) <= 0
  ) {
    showError("price-error", "Valid price is required");
    isPriceValid = false;
  } else {
    isPriceValid = true;
    hideError("price-error");
  }

  // Validate availability date
  if (availabilityDate.value.trim() === "") {
    showError("availabilityDate-error", "Availability date is required");
    isAvailabilityDateValid = false;
  } else {
    isAvailabilityDateValid = true;
    hideError("availabilityDate-error");
  }

  if (
    isTitleValid &&
    isPropertyTypeValid &&
    isPublicationStatusValid &&
    isPropertyStatusValid &&
    isDescriptionValid &&
    isPriceValid &&
    isAvailabilityDateValid
  ) {
    const formData = new FormData(event.target);
    const jsonData = {};
    for (let [key, value] of formData.entries()) {
      if (key === "photos") {
        // Initialize the array if it doesn't exist
        if (!jsonData[key]) {
          jsonData[key] = [];
        }
        jsonData[key].push(value);
      } else {
        jsonData[key] = value;
      }
    }

    console.log(jsonData);
    //   try {
    //     const response = await fetch("/api/listings", {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(jsonData),
    //     });

    //     const data = await response.json();

    //     if (data.success) {
    //       window.location.href = "/listings";
    //     } else {
    //       alert("Error submitting listing");
    //     }
    //   } catch (error) {
    //     error.classList.remove("hidden");
    //     error.classList.add("flex");
    //     error.textContent = "Server error";
    //   }
  }
}
