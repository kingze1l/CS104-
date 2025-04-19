// search-news.js - Specialized search functionality for the news page

// Global variables to ensure search works specifically with news data
let newsSearchIndex = [];

// Document ready handler for news page specific search initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing news page search...');
    
    // Initialize search functionality
    initializeNewsSearch();
    
    // Ensure the search toggle works
    const searchIcon = document.querySelector('.header-icon[onclick="toggleSearch()"]');
    if (searchIcon) {
        console.log('Search icon found');
        // We don't need to add another event listener since it has onclick attribute
    }
    
    // Make sure search container closes when clicking outside
    document.addEventListener('click', function(event) {
        const searchContainer = document.getElementById('search-container');
        const searchIcon = document.querySelector('.header-icon[onclick="toggleSearch()"]');
        const searchInput = document.getElementById('search-input');
        
        if (searchContainer && 
            searchIcon && 
            event.target !== searchIcon && 
            event.target !== searchInput && 
            !searchContainer.contains(event.target)) {
            searchContainer.classList.remove('show');
        }
    });
});

// Initialize news search functionality
function initializeNewsSearch() {
    // Get the search input and autocomplete container
    const searchInput = document.getElementById('search-input');
    const autocompleteContainer = document.getElementById('search-autocomplete');
    
    if (!searchInput || !autocompleteContainer) {
        console.error('Search elements not found');
        return;
    }
    
    // Add input event listener
    searchInput.addEventListener('input', handleNewsSearchInput);
    
    // Build search index from all available news data
    buildNewsSearchIndex();
    
    console.log('News search initialized');
}

// Build search index from existing news data
function buildNewsSearchIndex() {
    // Check if we have access to the allNews array from news.js
    if (window.allNews && Array.isArray(window.allNews) && window.allNews.length > 0) {
        console.log('Using existing news data for search index');
        newsSearchIndex = window.allNews.map(item => ({
            id: item.title, // Using title as ID since it should be unique enough
            text: `${item.title.toLowerCase()} ${(item.content || '').toLowerCase()} ${item.source.toLowerCase()}`,
            data: item
        }));
    } else {
        // Try accessing news arrays from the global scope
        console.log('No global allNews found, trying to find alternate sources');
        let combinedNews = [];
        
        // Try to access the different news arrays
        if (window.featuredNews && Array.isArray(window.featuredNews)) {
            combinedNews = [...combinedNews, ...window.featuredNews];
        }
        
        if (window.newsReleases && Array.isArray(window.newsReleases)) {
            combinedNews = [...combinedNews, ...window.newsReleases];
        }
        
        if (window.humansInSpaceNews && Array.isArray(window.humansInSpaceNews)) {
            combinedNews = [...combinedNews, ...window.humansInSpaceNews];
        }
        
        if (combinedNews.length > 0) {
            console.log('Found news data in separate arrays');
            newsSearchIndex = combinedNews.map(item => ({
                id: item.title,
                text: `${item.title.toLowerCase()} ${(item.content || '').toLowerCase()} ${item.source.toLowerCase()}`,
                data: item
            }));
        } else {
            // If no existing news data is found, we'll fetch it
            console.log('No existing news data found, will fetch news for search index');
            fetchNewsForSearchIndex();
        }
    }
    
    console.log(`Search index built with ${newsSearchIndex.length} news items`);
}

// Fetch news data specifically for the search index if needed
async function fetchNewsForSearchIndex() {
    try {
        // Try to use the API keys already defined in your code
        const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk';
        let tempNewsIndex = [];
        
        // Fetch NASA APOD news
        const nasaResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=10`);
        if (nasaResponse.ok) {
            const nasaData = await nasaResponse.json();
            tempNewsIndex.push(...nasaData.map(item => ({
                id: `nasa-${item.date}`,
                text: `${item.title.toLowerCase()} ${item.explanation.toLowerCase()} nasa`,
                data: {
                    title: item.title,
                    content: item.explanation,
                    image: item.url || '/api/placeholder/180/120',
                    date: new Date(item.date),
                    source: 'NASA',
                    url: item.hdurl || item.url,
                    type: 'news'
                }
            })));
        }
        
        // Fetch Spaceflight News API data
        const spaceflightResponse = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=15');
        if (spaceflightResponse.ok) {
            const spaceflightData = await spaceflightResponse.json();
            tempNewsIndex.push(...spaceflightData.results.map(item => ({
                id: `sf-${item.id}`,
                text: `${item.title.toLowerCase()} ${item.summary.toLowerCase()} ${item.news_site.toLowerCase()}`,
                data: {
                    title: item.title,
                    content: item.summary,
                    image: item.image_url || '/api/placeholder/180/120',
                    date: new Date(item.published_at),
                    source: item.news_site,
                    url: item.url,
                    type: 'news'
                }
            })));
        }
        
        newsSearchIndex = tempNewsIndex;
        console.log(`Search index built with ${newsSearchIndex.length} fetched news items`);
    } catch (error) {
        console.error('Error fetching news for search index:', error);
    }
}

// Handle search input for news
function handleNewsSearchInput(event) {
    const query = event.target.value.toLowerCase().trim();
    const autocompleteContainer = document.getElementById('search-autocomplete');
    
    // Clear previous results
    if (autocompleteContainer) {
        autocompleteContainer.innerHTML = '';
    }
    
    if (query.length < 2) {
        if (autocompleteContainer) {
            autocompleteContainer.style.display = 'none';
        }
        return;
    }
    
    // Make sure we have items in our index
    if (newsSearchIndex.length === 0) {
        console.log('Search index is empty, rebuilding...');
        buildNewsSearchIndex();
        
        // If still empty, show a message and return
        if (newsSearchIndex.length === 0) {
            if (autocompleteContainer) {
                autocompleteContainer.style.display = 'block';
                autocompleteContainer.innerHTML = '<div class="autocomplete-category">No news data available</div>';
            }
            return;
        }
    }
    
    // Search in news index
    const newsResults = newsSearchIndex.filter(item => 
        item.text.includes(query)
    ).slice(0, 6); // Show more results since this is the news page
    
    // Check if we have any results
    if (newsResults.length === 0 || !autocompleteContainer) {
        if (autocompleteContainer) {
            autocompleteContainer.style.display = 'none';
        }
        return;
    }
    
    // Display autocomplete results
    autocompleteContainer.style.display = 'block';
    
    // Add news results with category header
    const newsHeader = document.createElement('div');
    newsHeader.className = 'autocomplete-category';
    newsHeader.textContent = 'Space News';
    autocompleteContainer.appendChild(newsHeader);
    
    // Add news items
    newsResults.forEach(result => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item news-item';
        
        // Format date nicely
        const formattedDate = result.data.date ? new Date(result.data.date).toLocaleDateString() : '';
        
        item.innerHTML = `
            <div class="autocomplete-icon news-icon">📰</div>
            <div class="autocomplete-content">
                <div class="autocomplete-title">${result.data.title}</div>
                <div class="autocomplete-subtitle">${result.data.source} - ${formattedDate}</div>
            </div>
        `;
        
        item.addEventListener('click', () => {
            if (result.data.url) {
                window.open(result.data.url, '_blank');
            } else {
                console.log('No URL available for this news item');
            }
            document.getElementById('search-input').value = '';
            autocompleteContainer.style.display = 'none';
        });
        
        autocompleteContainer.appendChild(item);
    });
    
    // Add "See all results" option
    if (newsResults.length > 5) {
        const seeAllItem = document.createElement('div');
        seeAllItem.className = 'autocomplete-item see-all';
        seeAllItem.textContent = 'See all results';
        seeAllItem.addEventListener('click', () => {
            showAllNewsResults(query);
            document.getElementById('search-input').value = '';
            autocompleteContainer.style.display = 'none';
        });
        autocompleteContainer.appendChild(seeAllItem);
    }
}

// Show all news search results in a modal
function showAllNewsResults(query) {
    // Search all results
    const allResults = newsSearchIndex.filter(item => 
        item.text.includes(query)
    );
    
    // Create search results modal
    let searchResultsModal = document.getElementById('search-results-modal');
    
    if (!searchResultsModal) {
        searchResultsModal = document.createElement('div');
        searchResultsModal.id = 'search-results-modal';
        searchResultsModal.className = 'modal';
        document.body.appendChild(searchResultsModal);
    }
    
    // Create modal content
    searchResultsModal.innerHTML = `
        <div class="modal-content search-results-content">
            <span class="close-modal" onclick="closeModal('search-results-modal')">&times;</span>
            <div class="modal-header">
                <h2 style="color: #fc3d21; font-family: 'Orbitron', sans-serif;">News Search Results</h2>
                <div class="search-query">Query: "${query}"</div>
            </div>
            
            <div class="search-results-count">
                Found ${allResults.length} news items
            </div>
            
            <div class="search-results-sections">
                ${allResults.length > 0 ? `
                <div class="search-section">
                    <h3>Space News</h3>
                    <div class="search-news-list" id="search-news-results"></div>
                </div>
                ` : `
                <div class="no-results">
                    <p>No results found for "${query}".</p>
                    <p>Try different keywords or check your spelling.</p>
                </div>
                `}
            </div>
        </div>
    `;
    
    // Display the modal
    openModal('search-results-modal');
    
    // Populate news results
    const newsResultsContainer = document.getElementById('search-news-results');
    if (newsResultsContainer && allResults.length > 0) {
        allResults.forEach(result => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-result-item';
            
            // Format date nicely
            const formattedDate = result.data.date ? new Date(result.data.date).toLocaleDateString() : '';
            
            newsItem.innerHTML = `
                <div class="news-result-image">
                    <img src="${result.data.image}" alt="${result.data.title}" onerror="this.src='/api/placeholder/120/80'">
                </div>
                <div class="news-result-content">
                    <h4>${result.data.title}</h4>
                    <p>${result.data.content ? (result.data.content.substring(0, 100) + (result.data.content.length > 100 ? '...' : '')) : 'No description available'}</p>
                    <div class="news-result-meta">
                        <span>${result.data.source}</span>
                        <span>${formattedDate}</span>
                    </div>
                </div>
            `;
            
            newsItem.addEventListener('click', () => {
                if (result.data.url) {
                    window.open(result.data.url, '_blank');
                    closeModal('search-results-modal');
                } else {
                    console.log('No URL available for this news item');
                }
            });
            
            newsResultsContainer.appendChild(newsItem);
        });
    }
}

// Make sure these functions are available globally
window.handleNewsSearchInput = handleNewsSearchInput;
window.showAllNewsResults = showAllNewsResults;

// Make sure the modal functions are defined
if (typeof openModal !== 'function') {
    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    }
    window.openModal = openModal;
}

if (typeof closeModal !== 'function') {
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
    }
    window.closeModal = closeModal;
}

// Redefine toggleSearch if it's not already defined
if (typeof toggleSearch !== 'function') {
    function toggleSearch() {
        document.getElementById('search-container').classList.toggle('show');
        if (document.getElementById('search-container').classList.contains('show')) {
            document.getElementById('search-input').focus();
        }
    }
    window.toggleSearch = toggleSearch;
}