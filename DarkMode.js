document.addEventListener("DOMContentLoaded", () => {
  // Check for saved theme preference or use dark mode as default
  const savedTheme = localStorage.getItem("theme") || "dark";
  document.body.classList.add(`${savedTheme}-mode`);

  // Update toggle switch state in settings
  const darkModeToggle = document.getElementById("darkModeToggle");
  if (darkModeToggle) {
    darkModeToggle.checked = savedTheme === "dark";
  }

  // Add event listener for theme toggle
  if (darkModeToggle) {
    darkModeToggle.addEventListener("change", () => {
      const newTheme = darkModeToggle.checked ? "dark" : "light";
      document.body.classList.remove("dark-mode", "light-mode");
      document.body.classList.add(`${newTheme}-mode`);
      localStorage.setItem("theme", newTheme);
    });
  }
});