// search-news.js - Specialized search functionality for the news page

// Make sure toggleSearch function is available
if (typeof toggleSearch !== 'function') {
    /**
     * Toggle the search container visibility
     */
    function toggleSearch() {
        const searchContainer = document.getElementById('search-container');
        if (searchContainer) {
            if (searchContainer.style.display === 'block') {
                searchContainer.style.display = 'none';
            } else {
                searchContainer.style.display = 'block';
                document.getElementById('search-input').focus();
            }
        }
    }
    
    // Add to window for global access
    window.toggleSearch = toggleSearch;
}

// This function will be called when opening the modal
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling
    }
}

// This function will be called when closing the modal
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Re-enable scrolling
    }
}

// Make sure these functions are available globally
window.openModal = openModal;
window.closeModal = closeModal;

// Document ready handler for news page specific search initialization
document.addEventListener('DOMContentLoaded', function() {
    // Ensure the search input has an event listener
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        // If handleSearchInput is not defined in this context (could be in search.js)
        // we'll create a minimal version here
        if (typeof handleSearchInput !== 'function') {
            window.handleSearchInput = function(event) {
                console.log('Search input:', event.target.value);
                // The main search.js file should handle the actual search functionality
            };
        }
        
        // Add our event listener if not already added
        searchInput.addEventListener('input', handleSearchInput);
    }
    
    // Initialize search toggle button
    const searchIcon = document.querySelector('.header-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', toggleSearch);
    }
    
    // Add listener to close search when clicking outside
    document.addEventListener('click', function(event) {
        const searchContainer = document.getElementById('search-container');
        const searchIcon = document.querySelector('.header-icon');
        
        if (searchContainer && searchIcon) {
            if (!searchContainer.contains(event.target) && 
                event.target !== searchIcon &&
                !searchIcon.contains(event.target)) {
                searchContainer.style.display = 'none';
            }
        }
    });
    
    console.log('Search functionality initialized for news page');
});

// Enable search results to open news articles directly
function handleNewsSearchResult(newsItem) {
    if (newsItem && newsItem.url) {
        window.open(newsItem.url, '_blank');
        return true;
    }
    return false;
}

// Add this to window object for global access
window.handleNewsSearchResult = handleNewsSearchResult;