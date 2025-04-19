// search-fix.js - A comprehensive fix for NASA news search functionality
// Add this script at the end of your HTML file

(function() {
    // Global variables for search
    let newsSearchData = [];
    let searchTimer = null;
    
    // Initialize everything when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Initializing search fix...');
        
        // 1. Fix the search toggle first
        fixSearchToggle();
        
        // 2. Set up the search input handler
        setupSearchInput();
        
        // 3. Build the search index
        buildSearchIndex();
    });
    
    // Fix the search toggle functionality
    function fixSearchToggle() {
        const searchIcons = document.querySelectorAll('.header-icon');
        
        // Find the search icon (the one with 🔍)
        searchIcons.forEach(icon => {
            if (icon.textContent.includes('🔍')) {
                // Replace any existing click handlers
                icon.removeAttribute('onclick');
                
                // Add a new click handler
                icon.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    console.log('Search icon clicked');
                    const searchContainer = document.getElementById('search-container');
                    
                    if (searchContainer) {
                        // Toggle visibility directly with style
                        if (searchContainer.style.display === 'block') {
                            searchContainer.style.display = 'none';
                        } else {
                            searchContainer.style.display = 'block';
                            // Focus the search input
                            const searchInput = document.getElementById('search-input');
                            if (searchInput) {
                                setTimeout(() => {
                                    searchInput.focus();
                                }, 100);
                            }
                        }
                    } else {
                        console.error('Search container not found');
                    }
                });
                
                console.log('Search toggle fixed');
            }
        });
        
        // Add click outside to close
        document.addEventListener('click', function(event) {
            const searchContainer = document.getElementById('search-container');
            const isSearchIcon = event.target.classList.contains('header-icon') && 
                                event.target.textContent.includes('🔍');
            
            if (searchContainer && 
                !searchContainer.contains(event.target) && 
                !isSearchIcon) {
                searchContainer.style.display = 'none';
            }
        });
    }
    
    // Set up the search input handler
    function setupSearchInput() {
        const searchInput = document.getElementById('search-input');
        const autocompleteContainer = document.getElementById('search-autocomplete');
        
        if (!searchInput || !autocompleteContainer) {
            console.error('Search input or autocomplete container not found');
            return;
        }
        
        // Remove any existing handlers
        searchInput.removeEventListener('input', handleSearchInput);
        
        // Add our handler
        searchInput.addEventListener('input', function(e) {
            // Clear previous timer
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
            
            // Set a small delay to avoid too many searches while typing
            searchTimer = setTimeout(() => {
                handleSearchInput(e.target.value);
            }, 300);
        });
        
        console.log('Search input handler set up');
    }
    
    // Handle search input
    function handleSearchInput(searchText) {
        const query = searchText.toLowerCase().trim();
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
        
        // Make sure we have data
        if (newsSearchData.length === 0) {
            console.log('Search data is empty, rebuilding...');
            buildSearchIndex();
            
            // Show loading indicator
            if (autocompleteContainer) {
                autocompleteContainer.style.display = 'block';
                autocompleteContainer.innerHTML = `
                    <div class="autocomplete-category">Loading search data...</div>
                    <div style="padding: 15px; text-align: center;">
                        <div class="loading-spinner" style="display: inline-block; width: 20px; height: 20px;"></div>
                    </div>
                `;
            }
            return;
        }
        
        // Search in news data
        const results = newsSearchData.filter(item => {
            // Search in title, content, and source
            return (
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.content && item.content.toLowerCase().includes(query)) ||
                (item.source && item.source.toLowerCase().includes(query))
            );
        }).slice(0, 5); // Limit to 5 results
        
        // Check if we have any results
        if (results.length === 0) {
            if (autocompleteContainer) {
                autocompleteContainer.style.display = 'block';
                autocompleteContainer.innerHTML = `
                    <div class="autocomplete-category">No results found</div>
                    <div style="padding: 10px; text-align: center; color: #999;">
                        Try different keywords
                    </div>
                `;
            }
            return;
        }
        
        // Display results
        if (autocompleteContainer) {
            autocompleteContainer.style.display = 'block';
            
            // Add news header
            const newsHeader = document.createElement('div');
            newsHeader.className = 'autocomplete-category';
            newsHeader.textContent = 'News Results';
            autocompleteContainer.appendChild(newsHeader);
            
            // Add result items
            results.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'autocomplete-item news-item';
                
                // Format date
                const formattedDate = item.date ? new Date(item.date).toLocaleDateString() : '';
                
                resultItem.innerHTML = `
                    <div class="autocomplete-icon news-icon">📰</div>
                    <div class="autocomplete-content">
                        <div class="autocomplete-title">${item.title}</div>
                        <div class="autocomplete-subtitle">${item.source} - ${formattedDate}</div>
                    </div>
                `;
                
                // Add click handler
                resultItem.addEventListener('click', function() {
                    if (item.url) {
                        // Open news URL in a new tab
                        window.open(item.url, '_blank');
                    }
                    
                    // Clear search and hide results
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    
                    autocompleteContainer.style.display = 'none';
                });
                
                autocompleteContainer.appendChild(resultItem);
            });
            
            // Add "See all results" if we have more than 4 results
            if (results.length > 4) {
                const seeAllItem = document.createElement('div');
                seeAllItem.className = 'autocomplete-item see-all';
                seeAllItem.textContent = 'See all results';
                
                seeAllItem.addEventListener('click', function() {
                    showAllSearchResults(query, newsSearchData);
                    
                    // Clear search and hide results
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) {
                        searchInput.value = '';
                    }
                    
                    autocompleteContainer.style.display = 'none';
                });
                
                autocompleteContainer.appendChild(seeAllItem);
            }
        }
    }
    
    // Build search index from news data
    function buildSearchIndex() {
        console.log('Building search index...');
        
        // Check if we can access the news data from the global scope
        if (window.allNews && Array.isArray(window.allNews) && window.allNews.length > 0) {
            console.log('Using allNews data');
            newsSearchData = window.allNews;
        } else if (window.featuredNews || window.newsReleases || window.humansInSpaceNews) {
            // Try to combine different news arrays
            console.log('Combining news arrays');
            let combinedNews = [];
            
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
                newsSearchData = combinedNews;
            } else {
                // Fallback to fetching news
                fetchNewsData();
            }
        } else {
            // Fallback to fetching news
            fetchNewsData();
        }
    }
    
    // Fetch news data from APIs
    async function fetchNewsData() {
        console.log('Fetching news data for search...');
        
        try {
            let tempNews = [];
            
            // Fetch NASA APOD API
            const nasaApiKey = 'rixHDVgrkkI8Juc24A6pJjpofyo9gpJsqhtAy0bk';
            const nasaResponse = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${nasaApiKey}&count=10`);
            
            if (nasaResponse.ok) {
                const nasaData = await nasaResponse.json();
                tempNews.push(...nasaData.map(item => ({
                    title: item.title,
                    content: item.explanation,
                    image: item.url || '/api/placeholder/180/120',
                    date: new Date(item.date),
                    source: 'NASA',
                    url: item.hdurl || item.url
                })));
            }
            
            // Fetch Spaceflight News API
            const spaceflightResponse = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=15');
            
            if (spaceflightResponse.ok) {
                const spaceflightData = await spaceflightResponse.json();
                tempNews.push(...spaceflightData.results.map(item => ({
                    title: item.title,
                    content: item.summary,
                    image: item.image_url || '/api/placeholder/180/120',
                    date: new Date(item.published_at),
                    source: item.news_site,
                    url: item.url
                })));
            }
            
            // Sort by date (newest first)
            tempNews.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            newsSearchData = tempNews;
            console.log(`Fetched ${newsSearchData.length} news items for search`);
            
        } catch (error) {
            console.error('Error fetching news data:', error);
        }
    }
    
    // Show all search results in a modal
    function showAllSearchResults(query, allData) {
        // Filter all data by query
        const results = allData.filter(item => {
            return (
                (item.title && item.title.toLowerCase().includes(query)) ||
                (item.content && item.content.toLowerCase().includes(query)) ||
                (item.source && item.source.toLowerCase().includes(query))
            );
        });
        
        // Create or get modal
        let modal = document.getElementById('search-results-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'search-results-modal';
            modal.className = 'modal';
            document.body.appendChild(modal);
        }
        
        // Create modal content
        modal.innerHTML = `
            <div class="modal-content search-results-content">
                <span class="close-modal" onclick="closeSearchModal()">&times;</span>
                <div class="modal-header">
                    <h2 style="color: #fc3d21; font-family: 'Orbitron', sans-serif;">Search Results</h2>
                    <div class="search-query">Query: "${query}"</div>
                </div>
                
                <div class="search-results-count">
                    Found ${results.length} results
                </div>
                
                <div class="search-results-sections">
                    ${results.length > 0 ? `
                    <div class="search-section">
                        <h3>Space News (${results.length})</h3>
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
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
        
        // Populate results
        if (results.length > 0) {
            const resultsContainer = document.getElementById('search-news-results');
            
            results.forEach(item => {
                const resultItem = document.createElement('div');
                resultItem.className = 'news-result-item';
                
                // Format date
                const formattedDate = item.date ? new Date(item.date).toLocaleDateString() : '';
                
                resultItem.innerHTML = `
                    <div class="news-result-image">
                        <img src="${item.image}" alt="${item.title}" onerror="this.src='/api/placeholder/120/80'">
                    </div>
                    <div class="news-result-content">
                        <h4>${item.title}</h4>
                        <p>${item.content ? (item.content.substring(0, 100) + (item.content.length > 100 ? '...' : '')) : ''}</p>
                        <div class="news-result-meta">
                            <span>${item.source}</span>
                            <span>${formattedDate}</span>
                        </div>
                    </div>
                `;
                
                // Add click handler
                resultItem.addEventListener('click', function() {
                    if (item.url) {
                        window.open(item.url, '_blank');
                        closeSearchModal();
                    }
                });
                
                resultsContainer.appendChild(resultItem);
            });
        }
    }
    
    // Make closeSearchModal available globally
    window.closeSearchModal = function() {
        const modal = document.getElementById('search-results-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto'; // Re-enable scrolling
        }
    };
    
})();