function toggleMenu() {
    document.querySelector(".mobile-menu").classList.toggle("menu-open");
    document.querySelector(".menu-icon").classList.toggle("open");
    document.querySelector(".menu-overlay").classList.toggle("show");
}

function closeMenu() {
    document.querySelector(".mobile-menu").classList.remove("menu-open");
    document.querySelector(".menu-icon").classList.remove("open");
    document.querySelector(".menu-overlay").classList.remove("show");
}