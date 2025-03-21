document.getElementById('signup-form').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent the default form submission

  const form = event.target;
  const formData = new FormData(form);

  // Get form values
  const username = formData.get('username');
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');

  // Validate password match
  if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
  }

  // Convert form data to JSON
  const data = {
      username,
      email,
      password,
  };

  try {
      // Send a POST request to the /register route
      const response = await fetch('/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
      });

      if (response.ok) {
          // Show the success popup
          document.getElementById('success-popup').style.display = 'flex';
      } else {
          // Handle errors (e.g., display error messages)
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
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