document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form-login");

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("email-login");
      const password = document.getElementById("password-login");

      let isValid = true;

      document.querySelectorAll(".error-message-login").forEach((msg) => {
        msg.style.display = "none";
      });
      document.querySelectorAll("input").forEach((input) => {
        input.style.borderColor = "#ccc"; // Reset border color
      });

      if (!email.value || !email.checkValidity()) {
        showError(email);
        isValid = false;
      }

      if (!password.value || password.value.length < 8) {
        showError(password);
        isValid = false;
      }

      if (isValid) {
        document.getElementById("success-popup-login").style.display = "flex";
      }
    });
  }

  function showError(input) {
    const errorMessage = input.parentElement.querySelector(
      ".error-message-login"
    );
    if (errorMessage) {
      errorMessage.style.display = "block";
      input.style.borderColor = "red";
    }
  }

  const closePopupButton = document.getElementById("close-popup-login");
  if (closePopupButton) {
    closePopupButton.addEventListener("click", function () {
      document.getElementById("success-popup-login").style.display = "none";
    });
  }
});
