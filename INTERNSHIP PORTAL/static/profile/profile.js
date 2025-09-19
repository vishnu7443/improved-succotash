
// Skill sets data
const SKILL_SETS = {
  business_analyst: {
    hard: [
      "excel", "sql", "tableau", "power bi", "sas", "r", "statistics",
      "financial modeling", "data visualization", "reporting"
    ],
    domain: [
      "finance", "banking", "insurance", "healthcare",
      "supply chain", "marketing", "operations"
    ],
    soft: [
      "communication", "stakeholder management", "problem solving",
      "analytical thinking", "documentation"
    ],
  },
  data_analyst: {
    hard: [
      "sql", "python", "pandas", "numpy", "excel", "tableau",
      "power bi", "looker", "r", "statistics", "data cleaning", "etl"
    ],
    domain: ["retail", "e-commerce", "marketing", "healthcare", "operations"],
    soft: [
      "attention to detail", "visualization storytelling",
      "collaboration", "critical thinking"
    ],
  },
  data_engineer: {
    hard: [
      "python", "sql", "java", "scala", "spark", "hadoop", "kafka",
      "airflow", "dbt", "snowflake", "redshift", "bigquery", "aws",
      "azure", "gcp", "docker", "kubernetes", "etl",
      "data warehouse", "pipelines"
    ],
    domain: [
      "cloud", "streaming", "data pipelines", "big data",
      "healthcare", "finance"
    ],
    soft: [
      "problem solving", "teamwork", "ownership", "documentation"
    ],
  },
  data_scientist: {
    hard: [
      "python", "r", "sql", "machine learning", "deep learning", "nlp",
      "tensorflow", "pytorch", "scikit-learn", "statistics", "probability",
      "optimization", "time series", "computer vision"
    ],
    domain: [
      "ai", "healthcare", "finance", "retail",
      "predictive analytics", "genai"
    ],
    soft: [
      "critical thinking", "research mindset", "communication",
      "problem solving"
    ],
  }
};

// Flatten and deduplicate all skills
const allSkills = Array.from(
  new Set(Object.values(SKILL_SETS).flatMap(role =>
    Object.values(role).flat()
  ))
).sort();

const skillsInput = document.getElementById("skillsInput");
const skillsList = document.getElementById("skillsList");
const suggestionBox = document.getElementById("suggestionBox");

const countrySelect = document.getElementById("countrySelect");
const citySelect = document.getElementById("citySelect");

const countryCodeSelect = document.getElementById("countryCode");
const phoneInput = document.getElementById("inputPhone");

const sidebarEmail = document.getElementById("sidebarEmail");
const sidebarPhone = document.getElementById("sidebarPhone");
const sidebarLocation = document.getElementById("sidebarLocation");
const sidebarUniversity = document.getElementById("sidebarUniversity");

let currentPhotoData = null; // To store photo base64 string

// Skill autocomplete
skillsInput.addEventListener("input", function () {
  const val = this.value.toLowerCase();
  suggestionBox.innerHTML = "";
  if (!val) return;

  const suggestions = allSkills.filter(skill => skill.toLowerCase().startsWith(val)).slice(0, 7);

  suggestions.forEach(skill => {
    const item = document.createElement("div");
    item.innerHTML = skill.replace(new RegExp(val, "i"), "<strong>" + skill.substr(0, val.length) + "</strong>");
    item.className = "suggestion-item";
    item.onclick = function () {
      skillsInput.value = skill;
      suggestionBox.innerHTML = "";
    };
    suggestionBox.appendChild(item);
  });
});

document.addEventListener("click", function (e) {
  if (e.target !== skillsInput) {
    suggestionBox.innerHTML = "";
  }
});

// Add skill with no duplicates
function addSkill() {
  let value = skillsInput.value.trim();
  if (!value) return;

  const skills = Array.from(skillsList.querySelectorAll(".skills-badge")).map(
    badge => badge.getAttribute("data-skill").toLowerCase().trim()
  );
  if (skills.includes(value.toLowerCase())) {
    skillsInput.value = "";
    suggestionBox.innerHTML = "";
    return;
  }

  const badge = document.createElement("span");
  badge.className = "skills-badge";
  badge.setAttribute("data-skill", value);
  badge.textContent = value;

  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.className = "remove-skill-btn";
  removeBtn.innerHTML = "&times;";
  removeBtn.onclick = function (e) {
    e.stopPropagation();
    badge.remove();
  };

  badge.appendChild(removeBtn);
  skillsList.appendChild(badge);

  skillsInput.value = "";
  suggestionBox.innerHTML = "";
}
window.addSkill = addSkill;

// Profile photo upload preview and store base64
document.getElementById("photoUpload").addEventListener("change", function(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      currentPhotoData = e.target.result;
      document.getElementById("profileImg").src = currentPhotoData;
    };
    reader.readAsDataURL(file);
  }
});

// Populate cities based on country
countrySelect.addEventListener("change", () => {
  const country = countrySelect.value;
  citySelect.innerHTML = '<option value="" selected disabled>Select a city</option>';
  if (country && countriesWithCities[country]) {
    countriesWithCities[country].forEach(city => {
      let opt = document.createElement("option");
      opt.value = city;
      opt.textContent = city;
      citySelect.appendChild(opt);
    });
    citySelect.disabled = false;
  } else {
    citySelect.disabled = true;
  }
});

// Adjust and validate phone input length
countryCodeSelect.addEventListener("change", () => {
  const selectedOption = countryCodeSelect.options[countryCodeSelect.selectedIndex];
  const maxLength = selectedOption.getAttribute("data-length") || "10";
  phoneInput.value = "";
  phoneInput.setAttribute("maxlength", maxLength);
  phoneInput.placeholder = `Enter ${maxLength} digit phone number`;
});
phoneInput.addEventListener("input", () => {
  let val = phoneInput.value;
  val = val.replace(/\D/g, "");
  const maxLength = phoneInput.getAttribute("maxlength");
  if (val.length > maxLength) val = val.slice(0, maxLength);
  phoneInput.value = val;
});

// Toast notification display function
function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2200);
}

// Load profile data from backend & fill form, sidebar, photo, skills
document.addEventListener('DOMContentLoaded', () => {
  fetch('/profile_data')
  .then(res => {
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  })
  .then(data => {
    if(!data) return;

    document.getElementById('inputUsername').value = data.username || '';
    document.getElementById('inputEmail').value = data.email || '';
    document.getElementById('inputFirstName').value = data.first_name || '';
    document.getElementById('inputLastName').value = data.last_name || '';
    document.getElementById('countrySelect').value = data.country || '';
    if(data.country) countrySelect.dispatchEvent(new Event('change'));
    document.getElementById('citySelect').value = data.city || '';
    document.getElementById('countryCode').value = data.countryCode || '+91';
    document.getElementById('inputPhone').value = data.phone || '';
    document.getElementById('inputUniversity').value = data.university || '';
    document.getElementById('inputDegree').value = data.degree || '';
    document.getElementById('inputFieldStudy').value = data.field_study || '';
    document.getElementById('inputGraduationYear').value = data.graduation_year || '';
    document.getElementById('inputLinkedIn').value = data.linkedin || '';
    document.getElementById('inputPortfolio').value = data.portfolio || '';
    document.getElementById('inputBio').value = data.bio || '';

    if(data.skills && Array.isArray(data.skills)){
      data.skills.forEach(skill => addSkill(skill));
    }

    if(data.photoData){
      currentPhotoData = data.photoData;
      document.getElementById("profileImg").src = currentPhotoData;
    }

    // Update sidebar info dynamically
    const fullName = ((data.first_name || '') + " " + (data.last_name || '')).trim() || "Unnamed User";
    document.getElementById("profileName").textContent = fullName;
    sidebarEmail.textContent = data.email || "No email provided";
    sidebarPhone.textContent = data.phone ? `${data.countryCode || '+91'} ${data.phone}` : "No phone provided";
    sidebarLocation.textContent = (data.city ? data.city + ", " : "") + (data.country || "No location provided");
    sidebarUniversity.textContent = data.university || "No university provided";
  })
  .catch(err => console.error("Profile load error:", err));
});

// Save profile data to backend and update sidebar dynamically
function saveProfile() {
  const form = document.getElementById("profileForm");

  if(!form.checkValidity()){
    form.reportValidity();
    return;
  }

  const profileData = {
    username: document.getElementById('inputUsername').value.trim(),
    email: document.getElementById('inputEmail').value.trim(),
    first_name: document.getElementById('inputFirstName').value.trim(),
    last_name: document.getElementById('inputLastName').value.trim(),
    country: document.getElementById('countrySelect').value,
    city: document.getElementById('citySelect').value,
    countryCode: document.getElementById('countryCode').value,
    phone: document.getElementById('inputPhone').value.trim(),
    university: document.getElementById('inputUniversity').value.trim(),
    degree: document.getElementById('inputDegree').value.trim(),
    field_study: document.getElementById('inputFieldStudy').value.trim(),
    graduation_year: document.getElementById('inputGraduationYear').value.trim(),
    linkedin: document.getElementById('inputLinkedIn').value.trim(),
    portfolio: document.getElementById('inputPortfolio').value.trim(),
    bio: document.getElementById('inputBio').value.trim(),
    photoData: currentPhotoData,
    skills: Array.from(document.querySelectorAll('.skills-badge')).map(b => b.getAttribute('data-skill'))
  };

  fetch('/profile_data', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profileData)
  })
  .then(res => {
    if(res.ok){
      const fullName = ((profileData.first_name || '') + " " + (profileData.last_name || '')).trim() || "Unnamed User";
      document.getElementById("profileName").textContent = fullName;
      sidebarEmail.textContent = profileData.email || "No email provided";
      sidebarPhone.textContent = profileData.phone ? `${profileData.countryCode} ${profileData.phone}` : "No phone provided";
      sidebarLocation.textContent = (profileData.city ? profileData.city + ", " : "") + (profileData.country || "No location provided");
      sidebarUniversity.textContent = profileData.university || "No university provided";

      showToast("Profile saved and updated!");
    } else {
      alert("Error saving profile.");
    }
  });
}
window.saveProfile = saveProfile;
