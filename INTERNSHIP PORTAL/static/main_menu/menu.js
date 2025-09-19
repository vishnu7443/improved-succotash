document.addEventListener('DOMContentLoaded', () => {
  // Display username from global USERNAME variable injected by Flask
  document.getElementById('usernameDisplay').textContent = USERNAME;

  const menuItems = document.querySelectorAll('.sidebar nav ul li');
  const contentSection = document.getElementById('sectionContent');
  const internshipList = document.getElementById('internshipList');
  const searchBtn = document.getElementById('searchBtn');
  const internshipSearch = document.getElementById('internshipSearch');

  const internships = [
    {
      title: "Cyber Security Intern",
      company: "EXTION INFOTECH",
      location: "Remote",
      duration: "2 Months",
      applyBy: "20-Sep-2025",
      stipend: "Unpaid",
      logo: "https://icons.iconarchive.com/icons/papirus-team/papirus-apps/256/security-high-icon.png"
    },
    {
      title: "Content Creator & Graphic Design Intern",
      company: "EXTION INFOTECH",
      location: "Remote",
      duration: "2 Months",
      applyBy: "11-Sep-2025",
      stipend: "Unpaid",
      logo: "https://cdn-icons-png.flaticon.com/512/2111/2111646.png"
    },
    {
      title: "Machine Learning Intern",
      company: "TechVision Labs",
      location: "Remote",
      duration: "3 Months",
      applyBy: "09-Sep-2025",
      stipend: "₹5,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/1055/1055641.png"
    },
    {
      title: "Product Design Intern",
      company: "Pixelcraft Studios",
      location: "Bangalore",
      duration: "2 Months",
      applyBy: "08-Sep-2025",
      stipend: "₹4,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/1903/1903162.png"
    },
    {
      title: "Data Analyst Intern",
      company: "NTTI Aayog",
      location: "New Delhi",
      duration: "3 Months",
      applyBy: "30-Sep-2025",
      stipend: "₹8,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/2910/2910768.png"
    },
    {
      title: "Backend Development Intern",
      company: "Lynkit",
      location: "Delhi (Hybrid)",
      duration: "3 Months",
      applyBy: "15-Oct-2025",
      stipend: "₹10,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/226/226777.png"
    },
    {
      title: "Research & Development Intern",
      company: "Agrex.ai",
      location: "Remote",
      duration: "6 Months",
      applyBy: "25-Oct-2025",
      stipend: "₹15,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/2356/2356780.png"
    },
    {
      title: "Gen AI Machine Learning Intern",
      company: "Seagate",
      location: "Pune",
      duration: "3–6 Months",
      applyBy: "18-Oct-2025",
      stipend: "₹40,000–45,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/1828/1828884.png"
    },
    {
      title: "Hardware Engineering Intern",
      company: "Qualcomm",
      location: "Bangalore / Hyderabad",
      duration: "6–12 Months",
      applyBy: "10-Oct-2025",
      stipend: "₹42,000/month",
      logo: "https://cdn-icons-png.flaticon.com/512/1904/1904425.png"
    },
    {
      title: "Cloud Solutions Architecture Intern",
      company: "AWS",
      location: "Remote",
      duration: "Flexible",
      applyBy: "22-Oct-2025",
      stipend: "Unpaid",
      logo: "https://cdn-icons-png.flaticon.com/512/873/873120.png"
    }
  ];

  function displayInternships(list) {
    if (list.length === 0) {
      internshipList.innerHTML = '<p>No internships found.</p>';
      return;
    }
    internshipList.innerHTML = list.map(i => `
      <div class="internship-card">
        <div class="internship-logo">
          ${i.logo ? `<img src="${i.logo}" alt="Logo" />` : `<i class="fa-solid fa-briefcase"></i>`}
        </div>
        <h3>${i.title}</h3>
        <p><i class="fa-solid fa-building"></i> <strong>Company:</strong> ${i.company}</p>
        <p><i class="fa-solid fa-location-dot"></i> <strong>Location:</strong> ${i.location}</p>
        <p><i class="fa-solid fa-clock"></i> <strong>Duration:</strong> ${i.duration}</p>
        <p><i class="fa-solid fa-calendar"></i> <strong>Apply by:</strong> ${i.applyBy}</p>
        <p><i class="fa-solid fa-coins"></i> <strong>Stipend:</strong> ${i.stipend}</p>
        <div class="internship-buttons">
          <button class="btn apply">Apply Now</button>
          <button class="btn view">View</button>
        </div>
      </div>
    `).join('');
  }

  // Initial load
  displayInternships(internships);

  // Sidebar navigation click handling
  menuItems.forEach(item => {
    item.addEventListener('click', () => {
      menuItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      const section = item.getAttribute('data-section');
       if (section === 'profile') {
      // Navigate to /profile page
      window.location.href = '/profile';
      return;
      }
      if (section === 'logout') {
        fetch('/logout').then(() => window.location.href = '/login');
        return;
      }

      contentSection.innerHTML = `<h2>${item.textContent.trim()}</h2><p>This is the content area for the ${item.textContent.trim()} section.</p>`;
    });
  });

  // Search functionality
  searchBtn.addEventListener('click', () => {
    const query = internshipSearch.value.toLowerCase().trim();
    const filtered = internships.filter(i =>
      i.title.toLowerCase().includes(query) ||
      i.company.toLowerCase().includes(query) ||
      i.location.toLowerCase().includes(query)
    );
    displayInternships(filtered);
  });
});
