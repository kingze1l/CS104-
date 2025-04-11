document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkMode = localStorage.getItem("darkMode") === "enabled";
  
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
    }
  
    if (darkModeToggle) {
      darkModeToggle.checked = darkMode;
      darkModeToggle.addEventListener("change", () => {
        if (darkModeToggle.checked) {
          document.body.classList.add("dark-mode");
          document.body.classList.remove("light-mode");
          localStorage.setItem("darkMode", "enabled");
        } else {
          document.body.classList.add("light-mode");
          document.body.classList.remove("dark-mode");
          localStorage.setItem("darkMode", "disabled");
        }
      });
    }
  });