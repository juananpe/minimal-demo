document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Helper to get short initials from an email (used for avatar badge)
  function getInitials(email) {
    const namePart = (email || "").split("@")[0];
    const parts = namePart.split(/[\.\-_]/).filter(Boolean);
    if (parts.length === 0) return email.slice(0, 2).toUpperCase();
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and reset activity select
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>

          <div class="participants">
            <div class="participants-label">Participants</div>
            <div class="participants-list" aria-live="polite"></div>
          </div>
        `;

        // Render participant badges (initials with tooltip) and a remove button
        const participantsList = activityCard.querySelector(".participants-list");
        if (!details.participants || details.participants.length === 0) {
          const empty = document.createElement("div");
          empty.className = "no-participants";
          empty.textContent = "No participants yet";
          participantsList.appendChild(empty);
        } else {
          details.participants.forEach((email) => {
            const item = document.createElement("div");
            item.className = "participant-item";

            const badge = document.createElement("span");
            badge.className = "participant-badge";
            badge.textContent = getInitials(email);
            badge.title = email;

            const removeBtn = document.createElement("button");
            removeBtn.className = "participant-remove";
            removeBtn.type = "button";
            removeBtn.title = `Remove ${email}`;
            removeBtn.textContent = "×";

            // Click handler to remove participant
            removeBtn.addEventListener("click", async () => {
              if (!confirm(`Remove ${email} from ${name}?`)) return;
              try {
                const res = await fetch(`/activities/${encodeURIComponent(name)}/remove?email=${encodeURIComponent(email)}`, { method: "POST" });
                const resJson = await res.json();
                if (res.ok) {
                  messageDiv.textContent = resJson.message;
                  messageDiv.className = "success";
                  messageDiv.classList.remove("hidden");
                  setTimeout(() => { messageDiv.classList.add("hidden"); }, 5000);
                  // Refresh activities to reflect change
                  fetchActivities();
                } else {
                  messageDiv.textContent = resJson.detail || "An error occurred";
                  messageDiv.className = "error";
                  messageDiv.classList.remove("hidden");
                }
              } catch (err) {
                messageDiv.textContent = "Failed to remove participant. Please try again.";
                messageDiv.className = "error";
                messageDiv.classList.remove("hidden");
                console.error("Error removing participant:", err);
              }
            });

            item.appendChild(badge);
            item.appendChild(removeBtn);
            participantsList.appendChild(item);
          });
        }

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        // Refresh the activities list so the new participant appears immediately
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
