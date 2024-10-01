// logic for dropzone
const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("photos");
const fileList = document.getElementById("file-list");
const dropzoneText = document.getElementById("dropzone-text");

dropzone.addEventListener("click", () => fileInput.click());

dropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropzone.classList.add("bg-accent");
});

dropzone.addEventListener("dragleave", () => {
  dropzone.classList.remove("bg-accent");
});

dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropzone.classList.remove("bg-accent");
  fileInput.files = e.dataTransfer.files;
  updateFileList(fileInput.files);
});

fileInput.addEventListener("change", () => {
  updateFileList(fileInput.files);
});

function updateFileList(files) {
  fileList.innerHTML = "";
  Array.from(files).forEach((file) => {
    const fileItem = document.createElement("div");
    fileItem.classList.add("flex", "items-center", "space-x-2");
    const fileName = document.createElement("span");
    fileName.textContent = file.name;
    fileItem.appendChild(fileName);
    fileList.appendChild(fileItem);
  });
}


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
    showError("title-error", "Le titre est requis");
    isTitleValid = false;
  } else {
    isTitleValid = true;
    hideError("title-error");
  }

  // Validate property type
  if (propertyType.value.trim() === "") {
    showError("propertyType-error", "Le type de propriété est requis");
    isPropertyTypeValid = false;
  } else {
    isPropertyTypeValid = true;
    hideError("propertyType-error");
  }

  // Validate publication status
  if (publicationStatus.value.trim() === "") {
    showError("publicationStatus-error", "Le statut de publication est requis");
    isPublicationStatusValid = false;
  } else {
    isPublicationStatusValid = true;
    hideError("publicationStatus-error");
  }

  // Validate property status
  if (propertyStatus.value.trim() === "") {
    showError("propertyStatus-error", "Le statut de la propriété est requis");
    isPropertyStatusValid = false;
  } else {
    isPropertyStatusValid = true;
    hideError("propertyStatus-error");
  }

  // Validate description
  if (description.value.trim() === "") {
    showError("description-error", "La description est requise");
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
    showError("price-error", "Un prix valide est requis");
    isPriceValid = false;
  } else {
    isPriceValid = true;
    hideError("price-error");
  }

  // Validate availability date
  if (availabilityDate.value.trim() === "") {
    showError("availabilityDate-error", "La date de disponibilité est requise");
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
    const imgData = []
    for (let [key, value] of formData.entries()) {
      if (key === "photos") {
        imgData.push(value);
      } else {
        jsonData[key] = value;
      }
    }
    console.log(jsonData);

      try {
        const addPropertyResponse = await fetch("/api/property", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: 'include',
          body: JSON.stringify(jsonData),
        });

        const data = await addPropertyResponse.json();
        console.log(data)
        if (data.property) {
          if(imgData.length > 0){
            // upload request
            const addedProperty = data.property;
            const url = `/api/property/${addedProperty._id}/uploadImage`;
            
            for (let i = 0; i < imgData.length; i++) {
              const formData = new FormData();
              formData.append('image', imgData[i]);
              
              try {
                const uploadProprtyImgResponse = await fetch(url, {
                  method: "POST",
                  credentials: 'include',
                  body: formData,
                });
                console.log(uploadProprtyImgResponse)
              } catch (error) {
                alert("Error uploading image");
                break; // Exit the loop if an error occurs
              }
            }
          }
          // window.location.href = "/dashboard";
        } else {
          alert("Error submitting listing");
        }
      } catch (error) {
        error.classList.remove("hidden");
        error.classList.add("flex");
        error.textContent = "Server error";
      }
  }
}
