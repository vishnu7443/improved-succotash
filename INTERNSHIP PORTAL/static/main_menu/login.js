document.getElementById('loginForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const username = e.target.username.value.trim();
  const password = e.target.password.value.trim();

  if (!username || !password) {
    alert('Please enter both username/email and password.');
    return;
  }

  // TODO: Replace with actual authentication logic (API call)
  if (username === 'user' && password === 'password') {
    // Simulate saving logged in user and redirect
    localStorage.setItem('intern_portal_user', username);
    alert('Login successful! Redirecting...');
    window.location.href = '../main_menu/index.html'; // adjust the path as needed
  } else {
    alert('Invalid credentials. Please try again.');
  }
});

document.getElementById('googleSignInBtn').addEventListener('click', function () {
  alert('Google Sign-In functionality will be added soon.');
});
