// news.js - JavaScript for the NASA app news page

// Global variables to store news data
let allNews = [];
let featuredNews = [];
let newsReleases = [];
let humansInSpaceNews = [];
let currentCategory = 'all';

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize news tabs
    initNewsTabs();
    
    // Fetch and display news
    fetchAllNewsCategories();
    
    // Hide the news modal (we won't be using it)
    const newsModal = document.getElementById('news-modal');
    if (newsModal) {
        newsModal.style.display = 'none';
    }
});

// Initialize news category tabs
function initNewsTabs() {
    const tabs = document.querySelectorAll('.news-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Update active tab
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            // Update current category
            currentCategory = this.dataset.category;
            
            // Filter news by category
            filterNewsByCategory(currentCategory);
        });
    });
}

// Fetch all news categories
async function fetchAllNewsCategories() {
    try {
        // Show loading spinners
        document.querySelector('.featured-news-container').innerHTML = createLoadingHTML();
        document.querySelectorAll('.news-grid').forEach(grid => {
            grid.innerHTML = createLoadingHTML();
        });
        
        // Fetch all news
        await fetchNewsData();
        
        // Display news in different sections
        displayFeaturedNews();
        displayNewsReleases();
        displayHumansInSpaceNews();
        
    } catch (error) {
        console.error('Error fetching news categories:', error);
        displayErrorMessage('Unable to load news. Please try again later.');
    }
}

// Create loading spinner HTML
function createLoadingHTML() {
    return `
        <div class="loading-container">
            <div class="loading-spinner"></div>
        </div>
    `;
}

// Display error message
function displayErrorMessage(message) {
    const errorHTML = `<p class="error-message">${message}</p>`;
    document.querySelector('.featured-news-container').innerHTML = errorHTML;
    document.querySelectorAll('.news-grid').forEach(grid => {
        grid.innerHTML = errorHTML;
    });
}

// Fetch news data from APIs
async function fetchNewsData() {
    // Use the existing fetchLatestNews function from Script.js but modify to return the data
    // instead of directly updating the DOM
    try {
        let tempAllNews = [];
        
        // NASA APOD API (using your API key from script.js)
        const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk';
        const nasaResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=5`);
        if (nasaResponse.ok) {
            const nasaData = await nasaResponse.json();
            tempAllNews.push(...nasaData.map(item => ({
                title: item.title,
                content: item.explanation,
                image: item.url || 'https://via.placeholder.com/500x300?text=NASA+Image',
                date: new Date(item.date),
                source: 'NASA',
                url: item.hdurl || item.url,
                category: assignRandomCategory(),
                featured: Math.random() > 0.7 // Randomly mark some as featured
            })));
        }
        
        // Spaceflight News API
        const spaceflightResponse = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=15');
        if (spaceflightResponse.ok) {
            const spaceflightData = await spaceflightResponse.json();
            tempAllNews.push(...spaceflightData.results.map(item => ({
                title: item.title,
                content: item.summary,
                image: item.image_url || 'https://via.placeholder.com/500x300?text=Space+News',
                date: new Date(item.published_at),
                source: item.news_site,
                url: item.url,
                category: assignRandomCategory(),
                featured: Math.random() > 0.7 // Randomly mark some as featured
            })));
        }
        
        // Sort by date (newest first)
        tempAllNews.sort((a, b) => b.date - a.date);
        
        // Update global variables
        allNews = tempAllNews;
        
        // Separate news into categories
        featuredNews = allNews.filter(item => item.featured).slice(0, 3);
        
        // Ensure we have at least one featured item
        if (featuredNews.length === 0 && allNews.length > 0) {
            featuredNews = [allNews[0]];
        }
        
        // Filter for humans in space category
        humansInSpaceNews = allNews.filter(item => 
            item.category === 'people' || 
            item.title.toLowerCase().includes('astronaut') || 
            item.title.toLowerCase().includes('crew') ||
            item.content.toLowerCase().includes('astronaut')
        ).slice(0, 4);
        
        // Other news releases
        newsReleases = allNews.filter(item => 
            !featuredNews.includes(item) && 
            !humansInSpaceNews.includes(item)
        ).slice(0, 4);
        
    } catch (error) {
        console.error('Error in fetchNewsData:', error);
        throw error;
    }
}

// Assign a random category for demo purposes
function assignRandomCategory() {
    const categories = ['mission', 'research', 'people'];
    return categories[Math.floor(Math.random() * categories.length)];
}

// Display featured news
function displayFeaturedNews() {
    const container = document.querySelector('.featured-news-container');
    
    if (featuredNews.length === 0) {
        container.innerHTML = '<p>No featured news available at this time.</p>';
        return;
    }
    
    let html = '';
    featuredNews.forEach(item => {
        const formattedDate = item.date.toLocaleDateString();
        // Changed to directly open the URL like your home screen
        html += `
            <div class="featured-news-card" onclick="handleNewsClick(event, '${item.url || '#'}')">
                <div class="news-source-tag">${item.source}</div>
                <img src="${item.image}" alt="${item.title}" 
                     onerror="this.onerror=null; this.src='/api/placeholder/500/300'">
                <div class="featured-news-content">
                    <h3>${item.title}</h3>
                    <p>${truncateText(item.content, 100)}</p>
                    <div class="featured-news-meta">
                        <span class="category-tag">${item.category}</span>
                        <span class="news-date">${formattedDate}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Display news releases
function displayNewsReleases() {
    const container = document.querySelector('.news-releases .news-grid');
    
    if (newsReleases.length === 0) {
        container.innerHTML = '<p>No news releases available at this time.</p>';
        return;
    }
    
    container.innerHTML = createNewsGridHTML(newsReleases);
}

// Display humans in space news
function displayHumansInSpaceNews() {
    const container = document.querySelector('.humans-space .news-grid');
    
    if (humansInSpaceNews.length === 0) {
        container.innerHTML = '<p>No humans in space news available at this time.</p>';
        return;
    }
    
    container.innerHTML = createNewsGridHTML(humansInSpaceNews);
}

// Create HTML for news grid items
function createNewsGridHTML(newsItems) {
    let html = '';
    
    newsItems.forEach(item => {
        const formattedDate = item.date.toLocaleDateString();
        // Changed to directly open the URL like your home screen
        html += `
            <div class="news-card" onclick="handleNewsClick(event, '${item.url || '#'}')">
                <div class="news-source-tag">${item.source}</div>
                <img src="${item.image}" alt="${item.title}" 
                     onerror="this.onerror=null; this.src='/api/placeholder/180/120'">
                <div class="news-card-content">
                    <h3>${item.title}</h3>
                    <span class="news-date">${formattedDate}</span>
                </div>
            </div>
        `;
    });
    
    return html;
}

// Filter news by category
function filterNewsByCategory(category) {
    // Filter all news arrays by category
    if (category !== 'all') {
        // Reload with filtered data
        const filteredFeatured = featuredNews.filter(item => item.category === category);
        const filteredReleases = newsReleases.filter(item => item.category === category);
        const filteredHumans = humansInSpaceNews.filter(item => item.category === category);
        
        // Display filtered results
        const featuredContainer = document.querySelector('.featured-news-container');
        const releasesContainer = document.querySelector('.news-releases .news-grid');
        const humansContainer = document.querySelector('.humans-space .news-grid');
        
        if (filteredFeatured.length > 0) {
            let html = '';
            filteredFeatured.forEach(item => {
                const formattedDate = item.date.toLocaleDateString();
                // Changed to directly open the URL like your home screen
                html += `
                    <div class="featured-news-card" onclick="handleNewsClick(event, '${item.url || '#'}')">
                        <div class="news-source-tag">${item.source}</div>
                        <img src="${item.image}" alt="${item.title}" 
                             onerror="this.onerror=null; this.src='/api/placeholder/500/300'">
                        <div class="featured-news-content">
                            <h3>${item.title}</h3>
                            <p>${truncateText(item.content, 100)}</p>
                            <div class="featured-news-meta">
                                <span class="category-tag">${item.category}</span>
                                <span class="news-date">${formattedDate}</span>
                            </div>
                        </div>
                    </div>
                `;
            });
            featuredContainer.innerHTML = html;
        } else {
            featuredContainer.innerHTML = `<p>No featured ${category} news available.</p>`;
        }
        
        if (filteredReleases.length > 0) {
            releasesContainer.innerHTML = createNewsGridHTML(filteredReleases);
        } else {
            releasesContainer.innerHTML = `<p>No ${category} news releases available.</p>`;
        }
        
        if (filteredHumans.length > 0) {
            humansContainer.innerHTML = createNewsGridHTML(filteredHumans);
        } else {
            humansContainer.innerHTML = `<p>No ${category} humans in space news available.</p>`;
        }
    } else {
        // Show all news
        displayFeaturedNews();
        displayNewsReleases();
        displayHumansInSpaceNews();
    }
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Handle news click to open article in new tab
function handleNewsClick(event, url) {
    event.stopPropagation(); // Prevent any parent handlers from being executed
    
    if (url && url !== '#') {
        // Open the URL in a new tab
        window.open(url, '_blank');
    } else {
        // If no URL is available, show a message
        console.log('Article link unavailable. Please try another news item.');
        // You could also show a small toast notification here
    }
}

// These functions are no longer used but kept for reference/compatibility
function openNewsModalWithData(item) {
    // Instead of opening modal, just open the URL
    if (item && item.url) {
        window.open(item.url, '_blank');
    }
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}