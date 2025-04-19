// planet-search-complete-fix.js - A complete solution for planet search

// Create a self-contained solution that doesn't depend on external variables
(function() {
    // Global variables for this script
    let planetsSearchData = [];
    let searchTimer = null;
    let isInitialized = false;
    
    // Initialize when the page is fully loaded
    window.addEventListener('load', function() {
        console.log('Window fully loaded, initializing planet search...');
        initializePlanetSearch();
    });
    
    function initializePlanetSearch() {
        if (isInitialized) return; // Prevent multiple initializations
        
        console.log('Initializing planet search...');
        
        // 1. Fix the search toggle
        fixSearchToggle();
        
        // 2. Create/ensure the autocomplete container exists
        createAutocompleteContainer();
        
        // 3. Set up the search input handler
        setupSearchInput();
        
        // 4. Build the planets search data - delay this to ensure planets are loaded
        setTimeout(buildPlanetSearchData, 1000);
        
        isInitialized = true;
    }
    
    // Fix the search toggle
    function fixSearchToggle() {
        const searchIcon = document.querySelector('.header-icon');
        if (!searchIcon) {
            console.error('Search icon not found');
            return;
        }
        
        // Remove existing click handler
        searchIcon.removeAttribute('onclick');
        
        // Add new click handler
        searchIcon.addEventListener('click', function() {
            console.log('Search icon clicked');
            const searchContainer = document.getElementById('search-container');
            if (!searchContainer) {
                console.error('Search container not found');
                return;
            }
            
            // Toggle visibility
            if (searchContainer.style.display === 'block') {
                searchContainer.style.display = 'none';
            } else {
                searchContainer.style.display = 'block';
                const searchInput = document.getElementById('search-input');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
            }
        });
        
        // Click outside to close
        document.addEventListener('click', function(event) {
            const searchContainer = document.getElementById('search-container');
            const isSearchIcon = event.target.classList.contains('header-icon');
            
            if (searchContainer && 
                !searchContainer.contains(event.target) && 
                !isSearchIcon) {
                searchContainer.style.display = 'none';
            }
        });
    }
    
    // Create/ensure the autocomplete container
    function createAutocompleteContainer() {
        const searchContainer = document.getElementById('search-container');
        if (!searchContainer) {
            console.error('Search container not found');
            return;
        }
        
        // Check if autocomplete already exists
        let autocompleteContainer = document.getElementById('search-autocomplete');
        if (!autocompleteContainer) {
            autocompleteContainer = document.createElement('div');
            autocompleteContainer.id = 'search-autocomplete';
            autocompleteContainer.className = 'search-autocomplete';
            searchContainer.appendChild(autocompleteContainer);
            
            // Add necessary styling
            const style = document.createElement('style');
            style.textContent = `
                .search-autocomplete {
                    position: absolute;
                    top: calc(100% + 5px);
                    left: 0;
                    width: 100%;
                    background-color: #1a1a1a;
                    border-radius: 8px;
                    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.5);
                    z-index: 1001;
                    max-height: 320px;
                    overflow-y: auto;
                    display: none;
                }
                
                .autocomplete-category {
                    background-color: #1a1a1a;
                    color: #fc3d21;
                    font-weight: bold;
                    padding: 8px 15px;
                    font-size: 0.85rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    border-bottom: 1px solid #333;
                }
                
                .autocomplete-item {
                    padding: 10px 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    cursor: pointer;
                    transition: background-color 0.2s ease;
                    border-bottom: 1px solid #333;
                }
                
                .autocomplete-item:last-child {
                    border-bottom: none;
                }
                
                .autocomplete-item:hover {
                    background-color: #2a2a2a;
                }
                
                .autocomplete-icon {
                    font-size: 1.5rem;
                    color: #fc3d21;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .autocomplete-content {
                    flex: 1;
                }
                
                .autocomplete-title {
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: #fff;
                }
                
                .autocomplete-subtitle {
                    font-size: 0.8rem;
                    color: #aaa;
                }
                
                .autocomplete-item.planet-item {
                    border-left: 3px solid #e67e22;
                }
                
                .autocomplete-icon.planet-icon {
                    color: #e67e22;
                }
                
                .loading-spinner {
                    width: 20px;
                    height: 20px;
                    border: 3px solid rgba(255, 255, 255, 0.1);
                    border-left-color: #fc3d21;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 10px auto;
                }
                
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Set up the search input handler
    function setupSearchInput() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) {
            console.error('Search input not found');
            return;
        }
        
        // Add input handler
        searchInput.addEventListener('input', function(e) {
            if (searchTimer) {
                clearTimeout(searchTimer);
            }
            
            searchTimer = setTimeout(() => {
                handlePlanetSearch(e.target.value);
            }, 300);
        });
    }
    
    // Handle planet search input
    function handlePlanetSearch(query) {
        query = query.toLowerCase().trim();
        const autocompleteContainer = document.getElementById('search-autocomplete');
        
        if (!autocompleteContainer) {
            console.error('Autocomplete container not found');
            return;
        }
        
        // Clear previous results
        autocompleteContainer.innerHTML = '';
        
        // If query is too short, hide results
        if (query.length < 2) {
            autocompleteContainer.style.display = 'none';
            return;
        }
        
        // If no planet data, try to rebuild and show loading
        if (planetsSearchData.length === 0) {
            console.log('No planet data available, rebuilding...');
            autocompleteContainer.style.display = 'block';
            autocompleteContainer.innerHTML = `
                <div class="autocomplete-category">Loading Planets...</div>
                <div style="text-align: center; padding: 15px;">
                    <div class="loading-spinner"></div>
                </div>
            `;
            
            // Try to rebuild data and search again
            buildPlanetSearchData().then(() => {
                // If we have data now, search again
                if (planetsSearchData.length > 0) {
                    handlePlanetSearch(query);
                } else {
                    // Still no data, show error
                    autocompleteContainer.innerHTML = `
                        <div class="autocomplete-category">Error</div>
                        <div style="padding: 15px; text-align: center; color: #ccc;">
                            Could not load planet data
                        </div>
                    `;
                }
            });
            
            return;
        }
        
        // Filter planets based on query
        const results = planetsSearchData.filter(planet => 
            planet.name.toLowerCase().includes(query)
        );
        
        // If no results, show message
        if (results.length === 0) {
            autocompleteContainer.style.display = 'block';
            autocompleteContainer.innerHTML = `
                <div class="autocomplete-category">No Results</div>
                <div style="padding: 15px; text-align: center; color: #ccc;">
                    No planets match "${query}"
                </div>
            `;
            return;
        }
        
        // Display results
        autocompleteContainer.style.display = 'block';
        
        // Add header
        const header = document.createElement('div');
        header.className = 'autocomplete-category';
        header.textContent = 'Planets';
        autocompleteContainer.appendChild(header);
        
        // Add planet items
        results.forEach(planet => {
            const item = document.createElement('div');
            item.className = 'autocomplete-item planet-item';
            
            // Choose planet icon
            let planetIcon = '🪐';
            if (planet.name === 'Earth') planetIcon = '🌎';
            else if (planet.name === 'Mars') planetIcon = '🔴';
            else if (planet.name === 'Jupiter') planetIcon = '🟠';
            else if (planet.name === 'Saturn') planetIcon = '💫';
            
            // Format temperature
            const temperatureCelsius = (planet.temperature - 273.15).toFixed(2);
            
            item.innerHTML = `
                <div class="autocomplete-icon planet-icon">${planetIcon}</div>
                <div class="autocomplete-content">
                    <div class="autocomplete-title">${planet.name}</div>
                    <div class="autocomplete-subtitle">T: ${temperatureCelsius}°C | Mass: ${planet.mass} Earth masses</div>
                </div>
            `;
            
            // Add click handler to open modal
            item.addEventListener('click', function() {
                if (typeof openModal === 'function') {
                    // Call the original openModal function
                    openModal(
                        planet.name, 
                        planet.mass,
                        planet.radius,
                        temperatureCelsius,
                        planet.period,
                        planet.semi_major_axis,
                        planet.distance_light_year,
                        planet.host_star_mass,
                        planet.host_star_temperature
                    );
                    
                    // Clear and hide search
                    const searchInput = document.getElementById('search-input');
                    if (searchInput) searchInput.value = '';
                    
                    autocompleteContainer.style.display = 'none';
                    
                    const searchContainer = document.getElementById('search-container');
                    if (searchContainer) searchContainer.style.display = 'none';
                } else {
                    console.error('openModal function not found');
                }
            });
            
            autocompleteContainer.appendChild(item);
        });
    }
    
    // Build planet search data
    async function buildPlanetSearchData() {
        console.log('Building planet search data...');
        
        // First try to get data from the global variable
        if (window.planetsData && Array.isArray(window.planetsData) && window.planetsData.length > 0) {
            console.log('Using existing planets data from window.planetsData');
            planetsSearchData = window.planetsData.filter(planet => planet != null);
            console.log(`Planet search data built with ${planetsSearchData.length} planets`);
            return;
        }
        
        // Next try to access original planetsData (not window.planetsData)
        if (typeof planetsData !== 'undefined' && Array.isArray(planetsData) && planetsData.length > 0) {
            console.log('Using existing planets data from planetsData');
            planetsSearchData = planetsData.filter(planet => planet != null);
            console.log(`Planet search data built with ${planetsSearchData.length} planets`);
            return;
        }
        
        // If all else fails, fetch directly
        console.log('No existing planets data found, fetching planets directly');
        await fetchPlanetsDirectly();
    }
    
    // Fetch planets directly from API
    async function fetchPlanetsDirectly() {
        try {
            console.log('Fetching planets directly from API...');
            const apiKey = "COjts7snVqyUL9OD04ukQA==sHTQPO0uLGRS46bQ";
            const planetNames = [
                "Mercury", "Venus", "Earth", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune"
            ];
            
            const promises = planetNames.map(planetName => 
                fetch(`https://api.api-ninjas.com/v1/planets?name=${planetName}`, {
                    headers: { "X-Api-Key": apiKey }
                })
                .then(response => response.json())
                .then(data => data[0] || null)
                .catch(() => null)
            );
            
            const planets = await Promise.all(promises);
            planetsSearchData = planets.filter(planet => planet != null);
            
            console.log(`Fetched ${planetsSearchData.length} planets directly from API`);
            
            // Store it globally for later use
            window.planetsData = planetsSearchData;
            
        } catch (error) {
            console.error('Error fetching planets directly:', error);
            
            
        }
    }
    
    // Expose key functions globally if needed
    window.handlePlanetSearch = handlePlanetSearch;
    window.buildPlanetSearchData = buildPlanetSearchData;
})();