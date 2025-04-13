// mainM.js

function toggleMenu() {
    document.querySelector('.mobile-menu').classList.toggle('menu-open');
    document.querySelector('.menu-overlay').classList.toggle('show');
    document.querySelector('.menu-icon').classList.toggle('open');
}

function closeMenu() {
    document.querySelector('.mobile-menu').classList.remove('menu-open');
    document.querySelector('.menu-overlay').classList.remove('show');
    document.querySelector('.menu-icon').classList.remove('open');
}

function toggleSearch() {
    document.getElementById('search-container').classList.toggle('show');
}

// Initialize the page
window.addEventListener('DOMContentLoaded', () => {
    // Ensure modals start hidden
    const modals = document.getElementsByClassName('modal');
    for (let i = 0; i < modals.length; i++) {
        modals[i].style.display = 'none';
    }
    
    // Fetch API data
    fetchUpcomingLaunches();
    fetchLatestNews();
});