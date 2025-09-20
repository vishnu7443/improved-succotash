<script>
document.addEventListener('DOMContentLoaded', () => {
  // Display username from global USERNAME variable injected by Flask
  document.getElementById('usernameDisplay').textContent = USERNAME;

  const menuItems = document.querySelectorAll('.sidebar nav ul li');
  const contentSection = document.getElementById('sectionContent');
  const internshipList = document.getElementById('internshipList');
  const searchBtn = document.getElementById('searchBtn');
  const internshipSearch = document.getElementById('internshipSearch');

  // ✅ Jobs come from Flask (injected as JSON)
  const internships = JOBS || [];

  function displayInternships(list) {
    if (!list || list.length === 0) {
      internshipList.innerHTML = '<p>No jobs found.</p>';
      return;
    }
    internshipList.innerHTML = list.map(i => `
      <div class="internship-card">
        <div class="internship-logo">
          ${i.logo ? `<img src="${i.logo}" alt="Logo" />` : `<i class="fa-solid fa-briefcase"></i>`}
        </div>
        <h3>${i.title || i.job_title}</h3>
        <p><i class="fa-solid fa-building"></i> <strong>Company:</strong> ${i.company || "N/A"}</p>
        <p><i class="fa-solid fa-location-dot"></i> <strong>Location:</strong> ${i.location || "Remote"}</p>
        <p><i class="fa-solid fa-clock"></i> <strong>Duration:</strong> ${i.duration || "Not specified"}</p>
        <p><i class="fa-solid fa-calendar"></i> <strong>Apply by:</strong> ${i.applyBy || "Rolling"}</p>
        <p><i class="fa-solid fa-coins"></i> <strong>Stipend:</strong> ${i.stipend || "Unpaid"}</p>
        <div class="internship-buttons">
          <button class="btn apply">Apply Now</button>
          <button class="btn view">View</button>
        </div>
      </div>
    `).join('');
  }

  // ✅ Initial load from Python data
  displayInternships(internships);

  // Sidebar navigation click handling
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const section = item.getAttribute('data-section');
      if (section === 'profile') {
        window.location.href = '/profile';
        return;
      }
      if (section === 'logout') {
        fetch('/logout').then(() => window.location.href = '/login');
        return;
      }

      contentSection.innerHTML = `<h2>${item.textContent.trim()}</h2>
        <p>This is the content area for the ${item.textContent.trim()} section.</p>`;
    });
  });

  // Search functionality
  searchBtn.addEventListener('click', () => {
    const query = internshipSearch.value.toLowerCase().trim();
    const filtered = internships.filter(i =>
      (i.title || i.job_title).toLowerCase().includes(query) ||
      (i.company || "").toLowerCase().includes(query) ||
      (i.location || "").toLowerCase().includes(query)
    );
    displayInternships(filtered);
  });
});
</script>
