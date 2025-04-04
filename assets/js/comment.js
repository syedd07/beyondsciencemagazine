const client = new Appwrite.Client();
const databases = new Appwrite.Databases(client);

client
  .setEndpoint("https://cloud.appwrite.io/v1")
  .setProject("67efa9d90005502fbfa9");

const databaseId = "67efbe710015ee79508f";
const collectionId = "comments";

const articleId = window.location.pathname.split("/").filter(Boolean).pop();

const replyVisibility = {}; // Keeps track of which comment replies are shown

document.addEventListener("submit", async function (e) {
  if (e.target && e.target.id === "comment-form") {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const designation = document.getElementById("designation").value.trim();
    const text = document.getElementById("text").value.trim();
    const parentId = document.getElementById("parentId").value;

    if (!name || !email || !text) {
      alert("Name, email, and comment are required!");
      return;
    }

    try {
      await databases.createDocument(databaseId, collectionId, "unique()", {
        articleId,
        name,
        email,
        designation,
        text,
        likes: 0,
        timestamp: new Date().toISOString(),
        parentId: parentId || null,
      });
      e.target.reset();
      document.getElementById("parentId").value = "";
      loadComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      alert("Failed to submit comment. Try again.");
    }
  }
});

function timeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now - then) / 1000);
  
    const intervals = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'w', seconds: 604800 },
      { label: 'd', seconds: 86400 },
      { label: 'hr', seconds: 3600 },
      { label: 'min', seconds: 60 },
      { label: 's', seconds: 1 },
    ];
  
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
  
    return 'just now';
  }
  

async function loadComments() {
  try {
    const res = await databases.listDocuments(databaseId, collectionId, [
      Appwrite.Query.equal("articleId", articleId),
      Appwrite.Query.orderAsc("timestamp"),
    ]);

    const comments = res.documents;
    const rootComments = comments.filter((c) => !c.parentId);

    const commentsContainer = document.getElementById("comments-container");
    commentsContainer.innerHTML = "";

    rootComments.forEach((comment) => {
      const el = renderComment(comment, comments);
      commentsContainer.appendChild(el);
    });
  } catch (err) {
    console.error("Error loading comments:", err);
  }
}

function renderComment(comment, allComments) {
    const el = document.createElement("div");
    el.className = "comment";
    el.setAttribute("data-comment-id", comment.$id);
  
    const avatarInitial = comment.name.trim().charAt(0).toUpperCase();
    
    // Determine if this comment has been liked by the user
    const liked = localStorage.getItem(`liked_${comment.$id}`) ? true : false;
    // Use Font Awesome icons: filled heart if liked, outline heart if not
    const heartIcon = liked
      ? '<i class="fa fa-heart" style="color: #f56a6a;"></i>'
      : '<i class="fa fa-heart-o" style="color:rgb(228, 16, 16);"></i>';

    el.innerHTML = `
      <div class="comment-header">
        <div class="avatar">${avatarInitial}</div>
        <div>
          <strong>${comment.name}</strong> ${comment.designation ? "(" + comment.designation + ")" : ""}<br>
          <small class="comment-date">${timeAgo(comment.timestamp)}</small>
        </div>
      </div>
      <p class="comment-text">${comment.text}</p>
      <button onclick="likeComment('${comment.$id}', ${comment.likes})" class="like-btn">
         ${heartIcon} ${comment.likes}
      </button>
      <button onclick="setReply('${comment.$id}')">Reply</button>
    `;
  
    const replies = allComments.filter((c) => c.parentId === comment.$id);
    if (replies.length) {
      const replyContainer = document.createElement("div");
      replyContainer.className = "replies";
  
      replies.forEach((reply) => {
        const replyEl = renderComment(reply, allComments);
        replyContainer.appendChild(replyEl);
      });
  
      const toggleBtn = document.createElement("button");
      toggleBtn.className = "toggle-replies-btn";
      toggleBtn.style.marginTop = "8px";
  
      // Set initial visibility based on stored state
      const isVisible = replyVisibility[comment.$id] ?? false;
      replyContainer.style.display = isVisible ? "block" : "none";
      toggleBtn.textContent = isVisible ? "Hide Replies" : "Show Replies";
  
      toggleBtn.addEventListener("click", () => {
        const currentlyVisible = replyContainer.style.display === "block";
        replyContainer.style.display = currentlyVisible ? "none" : "block";
        toggleBtn.textContent = currentlyVisible ? "Show Replies" : "Hide Replies";
        replyVisibility[comment.$id] = !currentlyVisible; // Store toggle state
      });
  
      el.appendChild(toggleBtn);
      el.appendChild(replyContainer);
    }
  
    return el;
  }
  

function setReply(parentCommentId) {
    const parentCommentDiv = document.querySelector(
        `[data-comment-id="${parentCommentId}"]`
      );
      if (!parentCommentDiv) return;
    
      // If a reply form already exists under this parent, remove it (toggle off)
      const existingReplyForm = parentCommentDiv.querySelector("#inline-reply-form");
      if (existingReplyForm) {
        existingReplyForm.remove();
        return;
      }
    
      // Otherwise, create and append the reply form (toggle on)
      const replyForm = document.createElement("form");
      replyForm.id = "inline-reply-form";
      replyForm.innerHTML = `
        <input type="hidden" name="parentId" value="${parentCommentId}">
        <input type="text" name="name" placeholder="Your Name" required>
        <input type="email" name="email" placeholder="Your Email" required>
        <input type="text" name="designation" placeholder="Your Designation (optional)">
        <textarea name="text" placeholder="Write your reply..." required></textarea>
        <button type="submit">Post Reply</button>
      `;
      replyForm.addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = new FormData(replyForm);
        const name = formData.get("name").trim();
        const email = formData.get("email").trim();
        const designation = formData.get("designation").trim();
        const text = formData.get("text").trim();
        const parentId = formData.get("parentId");
    
        if (!name || !email || !text) {
          alert("All fields are required!");
          return;
        }
    
        try {
          await databases.createDocument(databaseId, collectionId, "unique()", {
            articleId,
            name,
            email,
            designation,
            text,
            likes: 0,
            timestamp: new Date().toISOString(),
            parentId,
          });
          loadComments();
        } catch (err) {
          console.error("Error posting reply:", err);
          alert("Failed to post reply.");
        }
      });
      parentCommentDiv.appendChild(replyForm);
    }

async function likeComment(id, currentLikes) {
  // Check if user has already liked this comment
  const alreadyLiked = localStorage.getItem(`liked_${id}`);
  if (alreadyLiked) {
    // Unlike: decrement the like count and remove the like flag
    try {
      // Ensure the likes do not go negative
      const newLikes = currentLikes > 0 ? currentLikes - 1 : 0;
      await databases.updateDocument(databaseId, collectionId, id, {
        likes: newLikes,
      });
      localStorage.removeItem(`liked_${id}`);
      loadComments();
    } catch (err) {
      console.error("Error unliking comment:", err);
    }
    return;
  }
  
  // Like: increment the like count and set the flag in localStorage
  try {
    await databases.updateDocument(databaseId, collectionId, id, {
      likes: currentLikes + 1,
    });
    localStorage.setItem(`liked_${id}`, "true");
    loadComments();
  } catch (err) {
    console.error("Error liking comment:", err);
  }
}

loadComments();
