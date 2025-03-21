document
  .getElementById("signup-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const firstName = document.getElementById("first-name");
    const otherName = document.getElementById("other-name");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirm-password");

    let isValid = true;

    if (!firstName.value) {
      showError(firstName);
      isValid = false;
    }
    if (!otherName.value) {
      showError(otherName);
      isValid = false;
    }
    if (!email.value || !email.checkValidity()) {
      showError(email);
      isValid = false;
    }
    if (!password.value || password.value.length < 8) {
      showError(password);
      isValid = false;
    }
    if (!confirmPassword.value || confirmPassword.value !== password.value) {
      showError(confirmPassword);
      isValid = false;
    }

    if (isValid) {
      document.getElementById("success-popup").style.display = "flex";
    }
  });

function showError(input) {
  const errorMessage = input.parentElement.querySelector(".error-message");
  errorMessage.style.display = "block";
  input.style.borderColor = "red";
}

document.getElementById("close-popup").addEventListener("click", function () {
  document.getElementById("success-popup").style.display = "none";
});
