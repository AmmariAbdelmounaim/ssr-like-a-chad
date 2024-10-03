const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("photos");
const fileList = document.getElementById("file-list");
const existingImages = document.getElementById("existing-images");
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
fileInput.addEventListener("change", () => updateFileList(fileInput.files));

function updateFileList(files) {
  fileList.innerHTML = "";
  Array.from(files).forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.classList.add("flex", "items-center", "space-x-2");

    const fileName = document.createElement("span");
    fileName.textContent = file.name;

    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.classList.add("text-red-500", "ml-2");
    removeButton.onclick = () => {
      const newFiles = Array.from(fileInput.files).filter(
        (_, i) => i !== index
      );
      const dataTransfer = new DataTransfer();
      newFiles.forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
      updateFileList(fileInput.files);
    };

    const imgPreview = document.createElement("img");
    imgPreview.src = URL.createObjectURL(file);
    imgPreview.classList.add("h-16", "w-16", "object-cover", "mr-2");

    fileItem.appendChild(imgPreview);
    fileItem.appendChild(fileName);
    fileItem.appendChild(removeButton);
    fileList.appendChild(fileItem);
  });
}

// existingImages.addEventListener("click", function (event) {
//   if (event.target.classList.contains("remove-existing-image")) {
//     const imageDiv = event.target.closest("div");
//     imageDiv.remove();
//   }
// });
existingImages.addEventListener("click", function (event) {
  if (event.target.classList.contains("remove-existing-image")) {
    const imageDiv = event.target.closest("div");
    if (imageDiv) {
      imageDiv.classList.add("marked-for-removal", "hidden"); // Ensure both classes are added
    }
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("edit-listing-form");

  form.addEventListener("submit", validateEditListingForm);
});

function showError(errorId, message) {
  const errorElement = document.getElementById(errorId);
  errorElement.textContent = message;
  errorElement.classList.remove("hidden");
}

function hideError(errorId) {
  const errorElement = document.getElementById(errorId);
  errorElement.classList.add("hidden");
}

function updateFileList(files) {
  fileList.innerHTML = ""; // Clear the current list
  Array.from(files).forEach((file, index) => {
    const fileItem = document.createElement("div");
    fileItem.classList.add("flex", "items-center", "space-x-2");

    const fileName = document.createElement("span");
    fileName.textContent = file.name;

    const removeButton = document.createElement("button");
    removeButton.textContent = "X";
    removeButton.classList.add("text-red-500", "ml-2");
    removeButton.onclick = () => {
      const dataTransfer = new DataTransfer();
      Array.from(fileInput.files)
        .filter((_, i) => i !== index)
        .forEach((file) => dataTransfer.items.add(file));
      fileInput.files = dataTransfer.files;
      updateFileList(fileInput.files);
    };

    const imgPreview = document.createElement("img");
    imgPreview.src = URL.createObjectURL(file);
    imgPreview.classList.add("h-16", "w-16", "object-cover", "mr-2");

    fileItem.appendChild(imgPreview);
    fileItem.appendChild(fileName);
    fileItem.appendChild(removeButton);
    fileList.appendChild(fileItem);
  });
}

async function handleImageUpload(propertyId, imgData) {
  const url = `/api/property/${propertyId}/uploadImage`;
  for (let i = 0; i < imgData.length; i++) {
    const formData = new FormData();
    formData.append("image", imgData[i]);
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      console.log(response);
    } catch (error) {
      alert("Error uploading image");
      break; // Exit the loop if an error occurs
    }
  }
}

async function handleImageDeletion(propertyId, imageUrl) {
  const url = `/api/property/${propertyId}/image/${encodeURIComponent(
    imageUrl
  )}`;
  try {
    const response = await fetch(url, {
      method: "DELETE",
      credentials: "include",
    });
    console.log(response);
  } catch (error) {
    alert("Error deleting image");
  }
}

async function validateEditListingForm(event) {
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
    const imgData = [];
    const removedImages = [];
   
    document.querySelectorAll("#existing-images .marked-for-removal").forEach((div) => {
      const img = div.querySelector("img");
      if (img) {
        removedImages.push(img.src); // Collect marked images
      }
    });

    for (let [key, value] of formData.entries()) {
      if (key === "photos") {
        imgData.push(value);
      } else {
        jsonData[key] = value;
      }
    }

    // Filter out removed images from imgData
    // imgData = imgData.filter((img) => !removedImages.includes(img));

    
    try {
      const listingId = window.location.pathname.split("/").pop();
      // update listing properties
      await fetch(`/api/property/${listingId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(jsonData),
      });
      console.log("removedImages.length: ",removedImages.length)
      // delete images if there is a change
      if (removedImages.length > 0) {
        for (let i = 0; i < removedImages.length; i++) {
          handleImageDeletion(listingId, removedImages[i]);
        }
      }
      console.log("imgData.length: ",imgData.length)
      // upload the new images
      if (imgData.length > 0) {
        for (let i = 0; i < imgData.length; i++) {
          handleImageUpload(listingId, imgData);
        }
      }
      // window.location.href = "/dashboard";
    } catch (error) {
      error.classList.remove("hidden");
      error.classList.add("flex");
      error.textContent = "Server error";
    }
  }
}
