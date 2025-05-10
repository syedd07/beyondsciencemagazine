// Initialize Appwrite client
const { Client, Databases, ID } = Appwrite;

const client = new Client();
client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67efa9d90005502fbfa9");  // Your project ID from other pages

const databases = new Databases(client);
const databaseId = "67efbe710015ee79508f"; // Using the same database ID as other files
const collectionId = "67fd416a0008ad9ee266"; // Collection ID for international donors

// DOM Elements
document.addEventListener("DOMContentLoaded", function() {
  const indiaBtn = document.getElementById("india-btn");
  const internationalBtn = document.getElementById("international-btn");
  const indiaForm = document.getElementById("india-form");
  const internationalForm = document.getElementById("international-form");
  const thankYouMessage = document.getElementById("thank-you");
  const donationAmounts = document.querySelectorAll(".donation-amount");
  const customAmount = document.getElementById("customAmount");
  
  // Location selection handlers
  indiaBtn.addEventListener("click", function() {
    indiaForm.style.display = "block";
    internationalForm.style.display = "none";
    indiaBtn.classList.add("primary");
    internationalBtn.classList.remove("primary");
    
    // Scroll to form
    indiaForm.scrollIntoView({ behavior: 'smooth' });
  });
  
  internationalBtn.addEventListener("click", function() {
    internationalForm.style.display = "block";
    indiaForm.style.display = "none";
    internationalBtn.classList.add("primary");
    indiaBtn.classList.remove("primary");
    
    // Scroll to form
    internationalForm.scrollIntoView({ behavior: 'smooth' });
  });
  
  // Donation amount selection
  donationAmounts.forEach(amount => {
    amount.addEventListener("click", function() {
      // Remove selected class from all amounts
      donationAmounts.forEach(amt => amt.classList.remove("selected"));
      
      // Add selected class to clicked amount
      this.classList.add("selected");
      
      // Clear custom amount
      customAmount.value = "";
    });
  });
  
  // Custom amount handler
  customAmount.addEventListener("input", function() {
    // Remove selected class from preset amounts when custom amount is entered
    if (this.value) {
      donationAmounts.forEach(amt => amt.classList.remove("selected"));
    }
  });

  // Handle "Other" amount selection for international form
  document.getElementById("intl-amount").addEventListener("change", function() {
    // Check if the "Other" option is selected
    const otherAmountContainer = document.getElementById("intl-other-amount-container");
    
    if (this.value === "other") {
      // If "Other" container doesn't exist yet, create it
      if (!otherAmountContainer) {
        // Create container
        const container = document.createElement("div");
        container.id = "intl-other-amount-container";
        container.className = "col-12";
        container.style.marginTop = "10px";
        
        // Create input
        const input = document.createElement("input");
        input.type = "number";
        input.id = "intl-other-amount";
        input.name = "otherAmount";
        input.placeholder = "Enter custom amount (USD)";
        input.required = true;
        input.min = "1";
        input.step = "0.01";
        input.style.width = "100%";
        
        // Add input to container
        container.appendChild(input);
        
        // Insert container after the amount dropdown
        this.parentNode.insertAdjacentElement('afterend', container);
      } else {
        otherAmountContainer.style.display = "block";
      }
    } else if (otherAmountContainer) {
      // Hide the container if it exists and "Other" is not selected
      otherAmountContainer.style.display = "none";
    }
  });

  // Handle international donation form (submit to Appwrite)
  document.getElementById("international-donation-form").addEventListener("submit", async function(e) {
    e.preventDefault(); // Prevent default form submission
    
    try {
      const name = document.getElementById("intl-name").value;
      const email = document.getElementById("intl-email").value;
      const country = document.getElementById("intl-country").value;
      const amountSelect = document.getElementById("intl-amount");
      
      // Check if the amount select element exists and has options
      if (!amountSelect || amountSelect.selectedIndex < 0) {
        alert("Please select a donation amount");
        return;
      }
      
      let amount = amountSelect.options[amountSelect.selectedIndex].value;
      // Get message if the element exists
      const messageElement = document.getElementById("intl-message");
      const message = messageElement ? messageElement.value : "";
      
      // Check if "Other" is selected and get custom amount
      if (amount === "other") {
        const otherAmountInput = document.getElementById("intl-other-amount");
        if (!otherAmountInput || !otherAmountInput.value) {
          alert("Please enter a custom amount.");
          return;
        }
        amount = otherAmountInput.value;
      }
      
      if (!name || !email || !country || !amount) {
        alert("Please fill all required fields.");
        return;
      }
      
      // Show loading state
      const submitBtn = document.getElementById("intl-submit-btn");
      if (submitBtn) {
        submitBtn.innerHTML = "Submitting...";
        submitBtn.disabled = true;
      }
      
      console.log("Creating document with data:", {
        name, email, country, amount, message
      });
      
      // Save data to Appwrite with proper amount handling
      const response = await databases.createDocument(
        databaseId,
        collectionId,
        ID.unique(),
        {
          name: name,
          email: email,
          country: country,
          preferredAmount: amount,
          message: message || "",
          createdAt: new Date().toISOString(),
          status: "pending"
        }
      );
      
      console.log("Document created successfully:", response);
      
      // Show thank you message
      if (internationalForm) internationalForm.style.display = "none";
      if (thankYouMessage) {
        thankYouMessage.style.display = "block";
        // Scroll to thank you message
        thankYouMessage.scrollIntoView({ behavior: 'smooth' });
      }
      
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error: " + (error.message || "There was an error submitting your information. Please try again later."));
      
      // Reset button state
      const submitBtn = document.getElementById("intl-submit-btn");
      if (submitBtn) {
        submitBtn.innerHTML = "Submit";
        submitBtn.disabled = false;
      }
    }
  });
  
  // Progress bar on scroll
  window.addEventListener('scroll', function() {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.querySelector('.progress-bar').style.width = scrolled + '%';
  });
});