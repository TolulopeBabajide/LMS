document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const form = event.target;
  const formData = new FormData(form);

  // Get form values
  const username = formData.get('username');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');

  // Basic validation
  if (!username || !email || !password || !confirmPassword) {
      alert('All fields are required');
      return;
  }

  // Validate password match
  if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
  }

  // Validate password length
  if (password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
  }

  // Convert form data to JSON
  const data = {
      username,
      email,
      password,
  };

  try {
      // Send a POST request to the registration endpoint
      const response = await fetch('/auth/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
          // Show the success popup
          const popup = document.getElementById('success-popup');
          popup.style.display = 'flex';
          
          // Add event listener to close button
          document.getElementById('close-popup').addEventListener('click', () => {
              popup.style.display = 'none';
              window.location.href = '/login'; // Redirect to login page
          });
      } else {
          // Handle specific error messages from the server
          const errorMessage = result.error || result.errors?.[0]?.msg || 'Registration failed. Please try again.';
          alert(errorMessage);
      }
  } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again.');
  }
});

// Close the success popup
document.getElementById('close-popup').addEventListener('click', () => {
  document.getElementById('success-popup').style.display = 'none';
});