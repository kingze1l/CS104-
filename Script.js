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

// menu 
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

function toggleSearch() {
    const container = document.getElementById('search-container');
    if (!container.classList.contains('show')) {
        container.classList.add('show');
    } else {
        container.classList.remove('show');
}
    document.getElementById('search-input').focus();
}

document.getElementById('search-input').addEventListener('input', function () {
const query = this.value.toLowerCase();
const cards = document.querySelectorAll('.cards .card, .hero, .horizontal-news-card');

cards.forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = text.includes(query) ? 'block' : 'none';
});
});

