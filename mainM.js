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

//fucntion to search 
function toggleSearch() {
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    if (searchContainer) {
        searchContainer.classList.toggle('show');
        if (searchContainer.classList.contains('show')) {
            searchInput.focus();
            document.getElementById('search-results').classList.add('hidden');
        }
    }
}

// Modified function to handle direct news article navigation
function handleNewsClick(event, url) {
    event.stopPropagation(); // Prevent any parent handlers from being executed
    
    if (url) {
        // Open the URL in a new tab
        window.open(url, '_blank');
    } else {
        // If no URL is available, show a message
        alert('Article link unavailable. Please try another news item.');
    }
}

// Modified function to fetch latest news from NASA and Spaceflight News API
async function fetchLatestNews() {
    const newsContainer = document.getElementById('news-container');
    if (!newsContainer) return;
    
    try {
        let allNews = [];
        
        // Fetch NASA news (APOD)
        const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk'; // Replace with your NASA API key for production
        const nasaResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=3`);
        if (nasaResponse.ok) {
            const nasaData = await nasaResponse.json();
            allNews.push(...nasaData.map(item => ({
                title: item.title,
                content: item.explanation,
                image: item.url || '/api/placeholder/180/120',
                date: new Date(item.date),
                source: 'NASA',
                url: item.hdurl || item.url
            })));
        } else {
            console.warn('NASA API request failed:', nasaResponse.status);
        }
        
        // Fetch additional news from Spaceflight News API
        const spaceflightResponse = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=3');
        if (spaceflightResponse.ok) {
            const spaceflightData = await spaceflightResponse.json();
            allNews.push(...spaceflightData.results.map(item => ({
                title: item.title,
                content: item.summary,
                image: item.image_url || '/api/placeholder/180/120',
                date: new Date(item.published_at),
                source: item.news_site,
                url: item.url
            })));
        } else {
            console.warn('Spaceflight News API request failed:', spaceflightResponse.status);
        }
        
        // Sort by date (newest first) and limit to 5
        allNews.sort((a, b) => b.date - a.date);
        allNews = allNews.slice(0, 5);
        
        // If no news retrieved, display a message
        if (allNews.length === 0) {
            newsContainer.innerHTML = '<p>No news available at this time. Please try again later.</p>';
            return;
        }
        
        // Generate news HTML - MODIFIED to use direct links instead of modals
        let newsHtml = '';
        allNews.forEach((item, index) => {
            const formattedDate = item.date.toLocaleDateString();
            // Changes here - now the entire card is a direct link to the article URL
            newsHtml += `
                <div class="horizontal-news-card" onclick="handleNewsClick(event, '${item.url}')">
                    <div class="news-source-tag">${item.source}</div>
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='/api/placeholder/180/120'">
                    <div class="card-content">
                        <h3>${item.title}</h3>
                        <p>${item.content.substring(0, 60)}${item.content.length > 60 ? '...' : ''}</p>
                        <div class="news-date">${formattedDate}</div>
                    </div>
                </div>
            `;
        });
        
        // Update news container
        newsContainer.innerHTML = newsHtml;
        
    } catch (error) {
        console.error('Error fetching news:', error);
        newsContainer.innerHTML = '<p>Unable to load news. Please try again later.</p>';
    }
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

// Modal functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Populate launches modal if opened
        if (modalId === 'launches-modal') {
            populateLaunchesModal();
        }
        
        // Ensure close buttons are clickable
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.style.zIndex = '20';
            button.addEventListener('click', function() {
                const modalId = this.closest('.modal').id;
                closeModal(modalId);
            });
        });
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// We're no longer using this function since we go directly to URLs
// But we'll keep it for backward compatibility
function openNewsModal(modalId) {
    openModal(modalId);
}

/* 
 * REMOVED the viewISSLocation function and the event listener that was
 * attaching it to the ISS location buttons. 
 * This allows the buttons to function normally as links.
 */