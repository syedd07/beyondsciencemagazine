const { Client, Databases, Storage, ID } = Appwrite;
const BUCKET_ID = "67f1709500236aedbcce";

const client = new Appwrite.Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67efa9d90005502fbfa9");

const databases = new Databases(client);
const storage = new Storage(client);
const databaseId = "67efbe710015ee79508f";
const collectionId = "67f16ece002b3f15acb3";
let profilePicId = "";
let uploadedImageURL = "";


window.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("storyForm");
  if (!form) return;

  const statusDiv = document.getElementById("fileUploadStatus");

  document
    .getElementById("profilePic")
    .addEventListener("change", async function () {
      const file = this.files[0];
      if (!file) return;

      try {
        statusDiv.textContent = "Uploading...";
        statusDiv.style.color = "gray";

        const uploadedFile = await storage.createFile(
          BUCKET_ID,
          ID.unique(),
          file
        );
        profilePicId = uploadedFile.$id;

        const filePreview = await storage.getFilePreview(
          BUCKET_ID,
          profilePicId
        );
        uploadedImageURL = filePreview.href;

        statusDiv.textContent = "✅ Profile picture uploaded successfully!";
        statusDiv.style.color = "green";
      } catch (error) {
        console.error("File upload failed:", error);
        statusDiv.textContent = "❌ Upload failed. Try again.";
        statusDiv.style.color = "red";
      }
    });

  const previewBtn = document.getElementById("previewBtn");
  const previewContent = document.getElementById("previewContent");
  const previewModal = document.getElementById("previewModal");
  const modalOverlay = document.getElementById("modalOverlay");
  const closeModal = document.getElementById("closeModal");
  const finalSubmit = document.getElementById("finalSubmit");
  const dragHandle = document.querySelector(".modal-drag-handle");

  previewBtn.addEventListener("click", (e) => {
    e.preventDefault();

    const firstName = document.getElementById("FirstName").value;
    const lastName = document.getElementById("LastName").value || "";
    const email = document.getElementById("Email").value || "";
    const country = document.getElementById("Country").value || "";
    const linkedIn = document.getElementById("linkedIn").value || "";
    const instagram = document.getElementById("Instagram")?.value || "";
    const twitter = document.getElementById("Twitter")?.value || "";
    const university = document.getElementById("University")?.value || "";
    const articleTitle = document.getElementById("Title").value || "";
    const shortBio = document.getElementById("ShortBio").value || "";
    const tags = Array.from(document.querySelectorAll("#tags-wrapper span"))
      .map((tag) => tag.textContent)
      .join(", ");
    const storyHTML = quill.root.innerHTML || "";

    previewContent.innerHTML = `
      <div class="modal-drag-indicator"></div>
      <div class="modal-body">
        ${uploadedImageURL ? `<img src="${uploadedImageURL}" class="modal-preview-image" alt="Uploaded Image">` : ""}
        <hr>
        <div class="author-info">
          <i class="fas fa-user-circle fa-2x"></i>
          <p style="margin-left: 8px; margin-bottom: 0;"><strong>Author:</strong> ${firstName} ${lastName}</p>
        </div>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Bio:</strong> ${shortBio}</p>
        <hr>
        <p><strong>Theme:</strong> ${tags}</p>
        <div class="social-links">
          ${linkedIn ? `<a href="${linkedIn}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>` : ""}
          ${instagram ? `<a href="${instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>` : ""}
          ${twitter ? `<a href="${twitter}" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>` : ""}
        </div>
        <br>
        <p><strong>Research Center/University:</strong> ${university}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Article Title:</strong> ${articleTitle}</p>
        <hr>
        <h3>Story:</h3>
        <div class="modal-story-content">${storyHTML}</div>
      </div>
    `;

    previewModal.classList.add("active");
    modalOverlay.classList.add("active");
    document.body.classList.add("modal-open");
  });


  const closePreview = () => {
    previewModal.classList.remove("active");
    modalOverlay.classList.remove("active");
    document.body.classList.remove("modal-open");
  };

  closeModal.addEventListener("click", closePreview);
  modalOverlay.addEventListener("click", closePreview);
  dragHandle.addEventListener("click", closePreview);

  let isDragging = false;
  let dragStartY = 0;
  let currentTranslateY = 0;

  dragHandle.addEventListener("touchstart", (e) => {
    isDragging = true;
    dragStartY = e.touches[0].clientY;
    previewModal.style.transition = "none";
  });

  dragHandle.addEventListener("touchmove", (e) => {
    if (!isDragging) return;
    const touchY = e.touches[0].clientY;
    currentTranslateY = touchY - dragStartY;
    if (currentTranslateY > 0) {
      previewModal.style.transform = `translateY(${currentTranslateY}px)`;
    }
  });

  dragHandle.addEventListener("touchend", () => {
    isDragging = false;
    previewModal.style.transition = "transform 0.3s ease";
    if (currentTranslateY > 100) {
      previewModal.style.transform = "translateY(100%)";
      setTimeout(closePreview, 300);
    } else {
      previewModal.style.transform = "translateY(0)";
    }
    currentTranslateY = 0;
  });
});

// OTP box logic

const otpBoxes = document.querySelectorAll("#otpInput .otp-box");

otpBoxes.forEach((box, index) => {
  // Prevent paste in individual boxes
  box.addEventListener("paste", (e) => {
    e.preventDefault();
  });

  // Move to next box when input is entered
  box.addEventListener("input", () => {
    const val = box.value;
    if (val && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });

  // Handle keyboard inputs
  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (box.value === "") {
        if (index > 0) {
          otpBoxes[index - 1].focus();
          otpBoxes[index - 1].value = "";
        }
      }
    } else if (e.key >= "0" && e.key <= "9") {
      // Allow number input
    } else if (
      e.key !== "Tab" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowRight"
    ) {
      e.preventDefault(); // Block non-numeric input
    }
  });
});

// Initialize Notyf
const notyf = new Notyf({
  duration: 5000, // Notification duration in milliseconds
  position: {
    x: 'right',
    y: 'top',
  },
  dismissible: true, // Allow dismissing notifications
});

// Ensure Notyf notifications are above the modal
document.querySelector('.notyf').style.zIndex = '3000';

// Generate OTP

const verifyEmailBtn = document.getElementById("verifyEmailBtn");
const otpSection = document.getElementById("otpSection");
const verifyOtpBtn = document.getElementById("verifyOtpBtn");
const emailInput = document.getElementById("Email");
const nameInput = document.getElementById("LastName");
const otpInput = Array.from(document.querySelectorAll("#otpInput .otp-box"))
  .map((box) => box.value)
  .join("")
  .trim();
const emailVerifiedMsg = document.getElementById("emailVerifiedMsg");
const functionId = "67f3b98a001b3d12e6e8";

let generatedOTP = null; // will store OTP here

verifyEmailBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  const messageDiv = document.getElementById("otp-message");

  if (!email || !email.includes("@")) {
    messageDiv.textContent = "Please enter a valid email address.";
    messageDiv.style.color = "red";
    return;
  }

  messageDiv.textContent = "Sending OTP...";
  messageDiv.style.color = "black";

  try {
    const response = await fetch(
      "https://n8n.beyondsciencemagazine.studio/webhook/send-otp",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: nameInput.value,
          email: email,
        }),
      }
    );


    // Ensure the response is OK
    if (!response.ok) {
      messageDiv.textContent = "Failed to send OTP.";
      messageDiv.style.color = "red";
      notyf.error("Failed to send OTP. Please try again.");
      return;
    }

    // Read the response only once. First, check if it's JSON.
    let result = {};
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("application/json")) {
      result = await response.json(); // If response is JSON, parse it
    } else {
      const text = await response.text(); // If it's not JSON, handle it as text
      console.error("Received non-JSON response:", text);
      result = { success: false }; // Set success to false to display failure message
    }

    // Check if the success field is true
    if (result.success) {
      messageDiv.textContent = "OTP sent to your email.";
      messageDiv.style.color = "green";
      otpSection.style.display = "block"; // Show OTP section
      notyf.success("OTP sent to your email. Please check your inbox.");
    } else {
      messageDiv.textContent = "Failed to send OTP.";
      messageDiv.style.color = "red";
      notyf.error("Failed to send OTP. Please try again.");
    }
  } catch (err) {
    messageDiv.textContent = "Error: " + err.message;
    messageDiv.style.color = "red";
  }
});

let isOtpVerified = false; // Flag to track OTP verification

verifyOtpBtn.addEventListener("click", async (e) => {
  e.preventDefault(); // Prevent default form submission
  const enteredOtp = Array.from(document.querySelectorAll("#otpInput .otp-box"))
  .map((box) => box.value)
  .join("")
  .trim();
  const email = emailInput.value.trim();
  const messageDiv = document.getElementById("otp-message");

  if (!enteredOtp || !email) {
    messageDiv.textContent = "Please fill both email and OTP.";
    messageDiv.style.color = "red";
    notyf.error("Please fill both email and OTP.");
    return;
  }

  messageDiv.textContent = "Verifying OTP...";
  messageDiv.style.color = "black";

  try {
  const response = await fetch(
    "https://n8n.beyondsciencemagazine.studio/webhook/verify-otp",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, otp: enteredOtp }),
    }
  );

  // Get the raw text first
  const responseText = await response.text();
  console.log("Raw response:", responseText);
  
  // Then parse it as JSON
  const result = JSON.parse(responseText);
  console.log("OTP Verify Result:", result);

  if (result.success === true || result.success === 'true') {
      messageDiv.textContent = "Email verified! Continue with your form submission.";
      messageDiv.style.color = "green";
      notyf.success("Email verified! You can now submit your story.");
    
      // Disable OTP input boxes
      otpBoxes.forEach((box) => {
        box.disabled = true; // Disable the input box
        box.style.cursor = "not-allowed"; // Change cursor to indicate it's not editable
        box.style.backgroundColor = "#f5f5f5"; // Optional: Change background color for visual feedback
      });
    
      // Optionally disable the Verify OTP button
      verifyOtpBtn.disabled = true;
      verifyOtpBtn.style.cursor = "not-allowed";
      verifyOtpBtn.style.backgroundColor = "#ccc"; // Optional: Change button color

      isOtpVerified = true; // Set OTP verification flag to true

    } else {
      messageDiv.textContent = result.message || "Incorrect OTP.";
      messageDiv.style.color = "red";
      notyf.error(result.message || "Incorrect OTP. Please try again.");

    }
  } catch (err) {
    messageDiv.textContent = "Error: " + err.message;
    messageDiv.style.color = "red";
    notyf.error(err.message || "An error occurred while verifying OTP.");
  }
});






// Prevent form submission if OTP is not verified and other required fields are not filled
finalSubmit.addEventListener("click", async (e) => {
  e.preventDefault();

  // Check if OTP is verified
  if (!isOtpVerified) {
    notyf.error("Please verify your OTP before submitting the form.");
    return;
  }

  // Check if the story content is too long
  const storyHTML = document.querySelector("#editor .ql-editor").innerHTML;
  if (storyHTML.length > 150000) {
    notyf.error(
      "Your story is too long. Please shorten it to fit within 1500 characters."
    );
    return;
  }

  // Check if required fields are filled
  const requiredFields = [
    "FirstName",
    "Email",
    "Country",
    "University",
    "ShortBio",
  ];
  for (const id of requiredFields) {
    if (!document.getElementById(id).value.trim()) {
      notyf.error("Please fill out all required fields.");
      return;
    }
  }

  // Check if profile picture is uploaded
  if (!profilePicId) {
    notyf.error("Please upload a profile picture.");
    return;
  }

  // Prepare the data for submission
  const data = {
    firstName: document.getElementById("FirstName").value,
    lastName: document.getElementById("LastName").value,
    email: document.getElementById("Email").value,
    country: document.getElementById("Country").value,
    linkedIn: document.getElementById("linkedIn").value,
    instagram: document.getElementById("Instagram").value,
    twitter: document.getElementById("Twitter").value,
    other: document.getElementById("Other").value,
    shortBio: document.getElementById("ShortBio").value,
    university: document.getElementById("University").value,
    researchFields: Array.from(
      document.querySelectorAll("#tags-wrapper span")
    ).map((tag) => tag.textContent),
    image_id: profilePicId,
    story: document.getElementById("StoryContent").value,
    articleTitle: document.getElementById("Title").value,
  };

  try {
    // Submit the data to the database
    await databases.createDocument(
      databaseId,
      collectionId,
      ID.unique(),
      data
    );

    notyf.success("Your story has been submitted successfully!");

    // Redirect to the success page
    window.location.href = "/user-uploads/success.html";
  } catch (error) {
    console.error("Document creation failed:", error);
    notyf.error("Something went wrong while submitting your story.");
  }
});
