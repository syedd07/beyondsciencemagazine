(function () {
  const { Client, Databases } = Appwrite;

  // Initialize Appwrite Client
  const client = new Appwrite.Client();
  client
    .setEndpoint("https://cloud.appwrite.io/v1")
    .setProject("67efa9d90005502fbfa9");

  const databases = new Appwrite.Databases(client);
  const databaseId = "67efbe710015ee79508f";
  const collectionId = "67f16ece002b3f15acb3";
  const BUCKET_ID = "67f1709500236aedbcce";

  // Extract articleID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const articleID = urlParams.get("articleID");

  // DOM Elements
  const articleTitle = document.getElementById("article-title");
  const articleImage = document.getElementById("article-image");
  const articleContent = document.getElementById("article-content");
  const authorDetails = document.getElementById("author-details");
  const articleSpinner = document.getElementById("article-spinner");

  // Calculate reading time
  function calculateReadingTime(content) {
    // Strip HTML tags
    const text = content.replace(/<[^>]*>/g, "");
    // Count words (split by spaces)
    const wordCount = text.split(/\s+/).length;
    // Calculate reading time (average 200 words per minute)
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));
    return readingTime;
  }

  //  helper function for getting user likes from localStorage
  function getUserLikes() {
    const likes = localStorage.getItem("userLikes");
    return likes ? JSON.parse(likes) : {};
  }
  // helper function to get user views from localStorage
  function getUserViews() {
    const views = localStorage.getItem("userViews");
    return views ? JSON.parse(views) : {};
  }

  // Helper function to format time as "1d ago", "1hr ago", etc.
  function timeAgo(date) {
    const now = new Date();
    const createdDate = new Date(date);
    const seconds = Math.floor((now - createdDate) / 1000);
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1,
    };

    for (const [unit, value] of Object.entries(intervals)) {
      const count = Math.floor(seconds / value);
      if (count > 0) {
        return `${count} ${unit}${count > 1 ? "s" : ""} ago`;
      }
    }
    return "just now";
  }

  // Helper function for showing toast notifications - move outside fetchArticle
  // Initialize Notyf
  const notyf = new Notyf({
    duration: 5000, // Notification duration in milliseconds
    position: {
      x: "right",
      y: "top",
    },
    dismissible: true, // Allow dismissing notifications
  });

  // Helper function for showing toast notifications
  function showToast(message, type = "success") {
    notyf.open({
      type: type,
      message: message,
    });
  }

  // Social sharing function
  function setupSocialSharing(article) {
    const pageUrl = encodeURIComponent(window.location.href);

    // Twitter share - improved format to avoid showing encoded URL in the middle
    document.getElementById("share-twitter").addEventListener("click", () => {
      const title = encodeURIComponent(article.articleTitle || "Article");
      const authorName = encodeURIComponent(
        `${article.firstName} ${article.lastName}`
      );

      // Define hashtags for Twitter
      const hashtags = "BeyondScience,Research,Science";

      // Create better formatted tweet text without the URL in the middle
      const tweetText = encodeURIComponent(
        `Check out "${article.articleTitle}" by ${article.firstName} ${article.lastName} on BEYOND SC!ENCE Magazine`
      );

      window.open(
        `https://twitter.com/intent/tweet?text=${tweetText}&url=${pageUrl}&hashtags=${hashtags}`,
        "_blank"
      );
    });

    // Facebook share with new tab
    document.getElementById("share-facebook").addEventListener("click", () => {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
        "_blank"
      );
    });

    // LinkedIn share - simplified to work better with LinkedIn's API
    document.getElementById("share-linkedin").addEventListener("click", () => {
      // LinkedIn only reliably accepts the URL parameter
      window.open(
        `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`,
        "_blank"
      );
    });

    // Copy link
    document.getElementById("share-copy").addEventListener("click", () => {
      navigator.clipboard
        .writeText(window.location.href)
        .then(() => {
          showToast("Link copied to clipboard!", "success");
        })
        .catch((err) => {
          showToast("Failed to copy link", "error");
        });
    });
  }

  // New function to update banner based on verification status
  function updateVerificationBanner(isVerified) {
    // console.log("Verification status:", isVerified);
    const bannerElement = document.getElementById("verification-banner");

    if (!bannerElement) {
      //console.error("Verification banner element not found!");
      return; // Exit if banner element doesn't exist
    }

    if (isVerified) {
      // Show verified banner
      bannerElement.innerHTML = `
      <div class="verification-success">
        <div class="success-icon">
          <i class="fas fa-check-circle"></i>
        </div>
        <div class="success-text">
          <strong>VERIFIED:</strong> THE FACTS AND INFORMATION IN THIS ARTICLE HAVE BEEN 
          REVIEWED AND VERIFIED BY THE BEYOND SC!ENCE MAGAZINE EDITORIAL TEAM.
        </div>
      </div>
    `;
    } else {
      // Show default warning banner (unverified)
      bannerElement.innerHTML = `
      <div class="verification-warning">
        <div class="warning-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <div class="warning-text">
          <strong>DISCLAIMER:</strong> BEYOND SC!ENCE MAGAZINE HAS NOT VERIFIED THE FACTS OR 
          CLAIMS IN THIS USER-CONTRIBUTED ARTICLE. Readers should exercise discretion.
        </div>
      </div>
    `;
    }
  }

  window.addEventListener("scroll", function () {
    const winScroll =
      document.body.scrollTop || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById("reading-progress-bar").style.width =
      scrolled + "%";
  });

  // Bookmark functionality
  function setupBookmarkFeature() {
    const bookmarkBtn = document.getElementById("bookmark-btn");
    if (!bookmarkBtn) return;

    // Check if article is already bookmarked
    const bookmarks = JSON.parse(
      localStorage.getItem("bookmarkedArticles") || "[]"
    );
    const isBookmarked = bookmarks.includes(articleID);

    // Update initial state
    if (isBookmarked) {
      bookmarkBtn.classList.add("active");
      bookmarkBtn.innerHTML =
        '<i class="fas fa-bookmark"></i><span>Saved</span>';
    }

    // Add click handler
    bookmarkBtn.addEventListener("click", () => {
      const bookmarks = JSON.parse(
        localStorage.getItem("bookmarkedArticles") || "[]"
      );
      const isCurrentlyBookmarked = bookmarks.includes(articleID);

      if (!isCurrentlyBookmarked) {
        // Add to bookmarks
        bookmarks.push(articleID);
        bookmarkBtn.classList.add("active");
        bookmarkBtn.innerHTML =
          '<i class="fas fa-bookmark"></i><span> Saved</span>';
        showToast("Article saved to your bookmarks", "success");
      } else {
        // Remove from bookmarks
        const index = bookmarks.indexOf(articleID);
        bookmarks.splice(index, 1);
        bookmarkBtn.classList.remove("active");
        bookmarkBtn.innerHTML =
          '<i class="far fa-bookmark"></i><span>Save</span>';
        showToast("Article removed from your bookmarks", "error");
      }

      localStorage.setItem("bookmarkedArticles", JSON.stringify(bookmarks));
    });
  }

  // Fetch related articles
  async function fetchRelatedArticles(currentArticle) {
    try {
      // Get 20 most recent articles
      const response = await databases.listDocuments(databaseId, collectionId, [
        // Limit 20, order by created date
        Appwrite.Query.limit(20),
        Appwrite.Query.orderDesc("$createdAt"),
      ]);

      // Filter out the current article
      let relatedArticles = response.documents.filter(
        (art) => art.$id !== articleID
      );

      // Score articles by relevance:
      // 1. Same author (+10 points)
      // 2. Shared research fields/tags (+5 points per match)
      relatedArticles = relatedArticles.map((art) => {
        let score = 0;

        // Same author
        if (
          art.firstName === currentArticle.firstName &&
          art.lastName === currentArticle.lastName
        ) {
          score += 10;
        }

        // Shared research fields
        if (art.researchFields && currentArticle.researchFields) {
          const commonFields = art.researchFields.filter((field) =>
            currentArticle.researchFields.includes(field)
          );
          score += commonFields.length * 5;
        }

        return { ...art, relevanceScore: score };
      });

      // Sort by relevance score then date (for ties)
      relatedArticles.sort((a, b) => {
        if (b.relevanceScore !== a.relevanceScore) {
          return b.relevanceScore - a.relevanceScore;
        }
        return new Date(b.$createdAt) - new Date(a.$createdAt);
      });

      // Take top 3
      return relatedArticles.slice(0, 3);
    } catch (error) {
      console.error("Error fetching related articles:", error);
      return [];
    }
  }

  // Render related articles
  function renderRelatedArticles(articles) {
    const container = document.querySelector(".related-articles-container");
    if (!container) return;

    if (articles.length === 0) {
      container.innerHTML = "<p>No related articles found.</p>";
      return;
    }

    const articlesHTML = articles
      .map(
        (article) => `
      <div class="related-article">
        <a href="view.html?articleID=${article.$id}">
          <div class="related-article-image">
            <img src="${
              article.image_id
                ? `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${article.image_id}/view?project=67efa9d90005502fbfa9`
                : "/articles/images/default-thumbnail.jpg"
            }" 
              alt="${article.articleTitle || "Related article"}">
          </div>
          <div class="related-article-content">
            <h4>${article.articleTitle || "Untitled Article"}</h4>
            <p class="related-article-author">By ${article.firstName} ${article.lastName}</p>
          </div>
        </a>
      </div>
    `
      )
      .join("");

    container.innerHTML = articlesHTML;
  }

  // Fetch and Render Article
  async function fetchArticle() {
    // console.log("Fetching article...");
    // console.log("Article ID:", articleID);
    if (articleSpinner) {
      articleSpinner.style.display = "flex"; // Show spinner
      articleContent.style.display = "none"; // Hide content area
    }

    if (!articleID) {
      // console.error("No article ID found in URL");
      if (articleSpinner) articleSpinner.style.display = "none";
      articleTitle.textContent = "Error: No Article Found";
      articleContent.textContent = "The requested article does not exist.";
      return;
    }

    try {
      // console.log("Attempting to fetch article with ID:", articleID);

      // 1. Fetch the existing document
      const article = await databases.getDocument(
        databaseId,
        collectionId,
        articleID
      );
      // console.log("Successfully fetched article:", article);

      // Get the verification status
      const isVerified = article.isVerified || false;

      // Update the verification banner
      updateVerificationBanner(isVerified);

      // 2. Check if user has viewed this article within the last 24 hours
      const userViews = getUserViews();
      const lastViewTime = userViews[articleID] || 0;
      const viewExpired = Date.now() - lastViewTime > 24 * 60 * 60 * 1000; // 24 hours

      // Only increment views if this is a new view or the previous view has expired
      if (!lastViewTime || viewExpired) {
        // Store this view with timestamp
        userViews[articleID] = Date.now();
        localStorage.setItem("userViews", JSON.stringify(userViews));

        // Increment view in database
        const updatedViews = (article.views || 0) + 1;
        await databases.updateDocument(databaseId, collectionId, articleID, {
          views: updatedViews,
          likes: article.likes ?? 0,
          isEmailVerified: article.isEmailVerified,
        });
      }

      // 3. Re-fetch updated document after potential view update
      const updatedArticle = await databases.getDocument(
        databaseId,
        collectionId,
        articleID
      );

      // 4. Update UI with new views
      const viewsSpan = document.getElementById("article-views");
      if (viewsSpan) {
        viewsSpan.textContent = `Views: ${updatedArticle.views || 0}`;
      }

      // Use the articleTitle attribute for the title
      articleTitle.textContent =
        updatedArticle.articleTitle || "Untitled Article";

      // Populate the article image
      if (updatedArticle.image_id) {
        articleImage.src = `https://cloud.appwrite.io/v1/storage/buckets/${BUCKET_ID}/files/${updatedArticle.image_id}/view?project=67efa9d90005502fbfa9`;
        articleImage.classList.remove("default-thumbnail"); // Remove class if it exists
      } else {
        articleImage.src = "/articles/images/default-thumbnail.jpg";
        articleImage.classList.add("default-thumbnail"); // Add class for default image
      }

      // Populate the article content
      articleContent.innerHTML =
        updatedArticle.story || "No content available.";

      if (articleSpinner) {
        articleSpinner.style.display = "none";
        articleContent.style.display = "block";
      }

      // Update the page title
      document.title = `${updatedArticle.articleTitle || "Untitled Article"} - BEYOND SC!ENCE Magazine`;

      // Populate the author details section
      const socialLinks = `
      ${
        updatedArticle.linkedIn
          ? `<a href="${updatedArticle.linkedIn}" target="_blank"><i class="fab fa-linkedin"></i> LinkedIn</a>`
          : ""
      }
      ${
        updatedArticle.instagram
          ? `<a href="${updatedArticle.instagram}" target="_blank"><i class="fab fa-instagram"></i> Instagram</a>`
          : ""
      }
      ${
        updatedArticle.twitter
          ? `<a href="${updatedArticle.twitter}" target="_blank"><i class="fab fa-twitter"></i> Twitter</a>`
          : ""
      }
    `;

      const readingTime = calculateReadingTime(updatedArticle.story || "");
      const readingTimeHTML = `<div class="reading-time"><i class="far fa-clock"></i> ${readingTime} min read</div>`;
      // Insert after the title
      document
        .querySelector(".main h1")
        .insertAdjacentHTML("afterend", readingTimeHTML);

      // Handle "Like" button
      $(function () {
        // Check if user already liked this article
        const userLikes = getUserLikes();
        const hasLiked = userLikes[articleID] === true;

        // Set initial UI state
        if (hasLiked) {
          $("#like-button").addClass("is-active");
        }

        $("#like-button").on("click", async function () {
          if (!articleID) return;

          // Toggle like status in localStorage
          const userLikes = getUserLikes();
          const isNowLiked = !userLikes[articleID];
          userLikes[articleID] = isNowLiked;
          localStorage.setItem("userLikes", JSON.stringify(userLikes));

          // Toggle UI feedback
          $(this).toggleClass("is-active");

          try {
            // Fetch current document
            const doc = await databases.getDocument(
              databaseId,
              collectionId,
              articleID
            );

            // Increment or decrement likes based on action
            const updatedLikes = isNowLiked
              ? (doc.likes || 0) + 1 // like
              : Math.max(0, (doc.likes || 0) - 1); // unlike (prevent negative)

            // Update the document with required fields
            await databases.updateDocument(
              databaseId,
              collectionId,
              articleID,
              {
                likes: updatedLikes,
                isEmailVerified: doc.isEmailVerified,
              }
            );

            // Update displayed like count
            $("#like-count").text(updatedLikes);
          } catch (err) {
            console.error("Failed to update likes:", err);
            // Revert local storage on error
            userLikes[articleID] = !isNowLiked;
            localStorage.setItem("userLikes", JSON.stringify(userLikes));
          }
        });
      });

      const tags = (updatedArticle.researchFields || [])
        .map((tag) => `<span class="tag">${tag}</span>`)
        .join(" ");

      const createdTime = timeAgo(updatedArticle.$createdAt);

      authorDetails.innerHTML = `
      <div class="author-info">
        <i class="fas fa-user-circle fa-2x"></i>
        <span id="author-name-trigger">${updatedArticle.firstName} ${updatedArticle.lastName}</span>
        ${
          updatedArticle.isEmailVerified
            ? `<i class="fas fa-check-circle tooltip-badge" style="color: #1DA1F2; margin-left: 2px; font-size: 1.2em; position: relative; cursor: help;">
              <span class="custom-tooltip">Author's email is verified!</span>
            </i>`
            : ""
        }
      </div>
      <br>
      <div class="created-time" style="margin-bottom: 0px;">
        <strong>Published:</strong> ${createdTime}
      </div>
      <div style="margin-right: 20px; margin-top: 10px">
        <i class="fa fa-eye"></i> Views: ${updatedArticle.views || "Unable to fetch"}
      </div>
      <div style="display: flex; position: relative; margin-left: 0;">
        <div class="heart" id="like-button" style="margin-left: -40px; margin-top: -20px padding: 0;"></div>
        <span id="like-count" style="position: absolute; left: 28px; top: 39px; font-weight: bold; font-size: 1em; text-decoration: underline;">${updatedArticle.likes || "0"}</span>
      </div>
    `;
      const style = document.createElement("style");
      style.textContent = `
  .tooltip-badge {
    position: relative;
  }
  
  .custom-tooltip {
    visibility: hidden;
    background-color: #555;
    color: white;
    text-align: center;
    padding: 5px 10px;
    border-radius: 6px;
    position: absolute;
    z-index: 1;
    bottom: 125%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.3s;
    white-space: nowrap;
    font-size: 0.8em;
    font-weight: normal;
  }
  
  .custom-tooltip::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }
  
  .tooltip-badge:hover .custom-tooltip {
    visibility: visible;
    opacity: 1;
  }
  `;
      document.head.appendChild(style);

      // Initialize author modal functionality
      setupAuthorModal(updatedArticle);

      loadComments();

      // After all content is loaded - call the new functions:
      setupSocialSharing(updatedArticle);
      setupBookmarkFeature();

      // After updating content, fetch and render related articles
      const relatedArticles = await fetchRelatedArticles(updatedArticle);
      renderRelatedArticles(relatedArticles);
    } catch (error) {
      console.log("Article ID:", articleID);
      console.error("Error fetching article:", error);
      articleTitle.textContent = "Error: Article Not Found";
      articleContent.textContent = "The requested article could not be found.";
      if (articleSpinner) articleSpinner.style.display = "none";
    }
  }

  // Then add this function to your script
  function setupAuthorModal(author) {
  // Get elements
  const authorNameTrigger = document.getElementById('author-name-trigger');
  const modal = document.getElementById('author-modal');
  const modalContent = modal.querySelector('.author-modal-content');
  const closeButton = modal.querySelector('.close-modal');
  const modalLoading = modal.querySelector('.author-modal-loading');
  const modalBody = modal.querySelector('.author-modal-body');
  
  // Style the author name trigger
  if (authorNameTrigger) {
    authorNameTrigger.style.cursor = 'pointer';
    authorNameTrigger.style.color = '#4a9df8';
    authorNameTrigger.style.fontWeight = 'bold';
  
    // Set modal title
    document.getElementById('modal-author-name').textContent = 
      `${author.firstName} ${author.lastName}`;
      
    // Set up hover/click events based on device
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile, use click
      authorNameTrigger.addEventListener('click', showModal);
    } else {
      // For desktop, use hover
      let hoverTimeout;
      authorNameTrigger.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(showModal, 300); // Delay to avoid accidental triggers
      });
      authorNameTrigger.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
      });
      // Still allow click on desktop
      authorNameTrigger.addEventListener('click', showModal);
    }
  }
  
  // Close events
  closeButton.addEventListener('click', hideModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) hideModal();
  });
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) hideModal();
  });
  
  function showModal() {
    modal.classList.add('show');
    // Initially show loading and hide content
    modalLoading.style.display = 'flex';
    modalBody.style.display = 'none';
    
    // Fill the modal with author data
    fillAuthorData(author);
  }
  
  function hideModal() {
    modal.classList.remove('show');
  }
  
  // THIS FUNCTION WAS MISSING - Add it to fix the loading issue
  function fillAuthorData(author) {
    // Short timeout to show the loading animation
    setTimeout(() => {
      // Set university if available
      const universityEl = document.getElementById('author-university').querySelector('span');
      universityEl.textContent = author.university || 'Not provided';
      
      // Set country if available
      const countryEl = document.getElementById('author-country').querySelector('span');
      countryEl.textContent = author.country || 'Not provided';
      
      // Set research fields
      const tagsContainer = document.getElementById('author-tags');
      if (author.researchFields && author.researchFields.length > 0) {
        tagsContainer.innerHTML = author.researchFields
          .map(field => `<span class="tag">${field}</span>`)
          .join('');
      } else {
        tagsContainer.innerHTML = '<span class="tag">No research fields provided</span>';
      }
      
      // Set social links
      const socialContainer = document.getElementById('author-social');
      let socialHTML = '';
      
      if (author.linkedIn) {
        socialHTML += `<a href="${author.linkedIn}" class="linkedin" target="_blank" title="LinkedIn">
                        <i class="fab fa-linkedin-in"></i>
                      </a>`;
      }
      
      if (author.twitter) {
        socialHTML += `<a href="${author.twitter}" class="twitter" target="_blank" title="Twitter">
                        <i class="fab fa-twitter"></i>
                      </a>`;
      }
      
      if (author.instagram) {
        socialHTML += `<a href="${author.instagram}" class="instagram" target="_blank" title="Instagram">
                        <i class="fab fa-instagram"></i>
                      </a>`;
      }
      
      if (socialHTML === '') {
        socialContainer.innerHTML = '<p>No social media links provided</p>';
      } else {
        socialContainer.innerHTML = socialHTML;
      }
      
      // Set up contact button
      const contactButton = document.getElementById('contact-author');
      if (author.email) {
        contactButton.addEventListener('click', () => {
          window.location.href = `mailto:${author.email}?subject=Regarding your article on Beyond Science Magazine`;
        });
      } else {
        contactButton.disabled = true;
        contactButton.textContent = 'Email not available';
      }
      
      // Set up edit suggestion button
      const editButton = document.querySelector('.edit-suggestion i');
      editButton.addEventListener('click', () => {
        showToast('Edit suggestion feature coming soon!', 'error');
      });
      
      // Hide loading, show content
      modalLoading.style.display = 'none';
      modalBody.style.display = 'block';
    }, 500); // Short delay for loading animation
  }
}

  // Separate function for loading comments to improve code organization
  function loadComments() {
    const commentPlaceholder = document.getElementById(
      "comment-box-placeholder"
    );
    if (!commentPlaceholder) {
      console.warn("Comment box placeholder not found");
      return;
    }

    // First check if comments are already loaded to prevent duplication
    if (commentPlaceholder.dataset.loaded === "true") {
      return;
    }

    fetch("/comment-box.html")
      .then((res) => res.text())
      .then((html) => {
        commentPlaceholder.innerHTML = html;
        commentPlaceholder.dataset.loaded = "true"; // Mark as loaded

        // Load comment script dynamically
        const commentScript = document.createElement("script");
        commentScript.src = "/assets/js/comment.js";
        document.body.appendChild(commentScript);
      })
      .catch((err) => {
        console.error("Failed to load comments:", err);
      });
  }

  // Fetch the article on page load
  fetchArticle();
})();
