document.addEventListener('DOMContentLoaded', () => {
    // Create an iOS-like loading screen
    const body = document.body;
    const preloader = document.createElement('div');
    preloader.className = 'preloader';
    preloader.innerHTML = `
        <div class="preloader-content">
            <img src="https://upload.wikimedia.org/wikipedia/commons/e/e5/NASA_logo.svg" alt="NASA Logo" style="width: 120px; height: 120px;">
            <div class="preloader-spinner"></div>
        </div>
    `;
    
    // Add enhanced iOS-like preloader styles
    const style = document.createElement('style');
    style.textContent = `
        .preloader {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: #000;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 9999;
            transition: opacity 0.4s cubic-bezier(0.215, 0.61, 0.355, 1), 
                        visibility 0.4s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .preloader-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 30px;
        }
        .preloader-spinner {
            width: 36px;
            height: 36px;
            border: 3px solid rgba(255, 255, 255, 0.15);
            border-radius: 50%;
            border-top-color: #fc3d21;
            animation: spin 0.8s cubic-bezier(0.42, 0, 0.58, 1) infinite;
            /* iOS spinner has a subtle drop shadow */
            box-shadow: 0 0 10px rgba(252, 61, 33, 0.2);
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .preloader img {
            /* More subtle, iOS-like animation */
            animation: iosScale 1.5s infinite alternate cubic-bezier(0.455, 0.03, 0.515, 0.955);
            /* Add a subtle glow effect */
            filter: drop-shadow(0 0 12px rgba(255, 255, 255, 0.3));
        }
        @keyframes iosScale {
            0% { transform: scale(0.98); opacity: 0.9; }
            100% { transform: scale(1.02); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    body.appendChild(preloader);
    
    // Shorter loading time for a snappier feel
    setTimeout(() => {
        startPageAnimations();
    }, 800);
    
    function startPageAnimations() {
        // Fade out preloader with iOS-like animation
        preloader.style.opacity = '0';
        preloader.style.visibility = 'hidden';
        
        setTimeout(() => {
            preloader.remove();
        }, 400); // Faster removal for snappier feel
        
        // Get all elements to animate
        const navbar = document.querySelector('.navbar');
        const logo = document.querySelector('.logo');
        const hero = document.querySelector('.hero');
        const sectionTitles = document.querySelectorAll('h2');
        const seeAllLinks = document.querySelectorAll('h2 + a');
        const featuredCards = document.querySelectorAll('#featured-missions .card');
        const newsCards = document.querySelectorAll('.horizontal-news-card');
        const navTabs = document.querySelector('.nav-tabs');
        
        // iOS-like animation sequence with refined timing
        
        // First navbar fades in (like iOS status bar)
        if (navbar) {
            navbar.classList.add('animate');
        }
        
        // Then logo scales and fades in (like app icon)
        if (logo) {
            setTimeout(() => {
                logo.classList.add('animate');
            }, 80); // Faster follow-up for iOS feel
        }
        
        // Then hero section
        if (hero) {
            setTimeout(() => {
                hero.classList.add('animate');
            }, 150); // Slightly faster to maintain momentum
        }
        
        // Animate section titles and "See All" links with iOS-like timing
        sectionTitles.forEach(title => {
            setTimeout(() => {
                title.classList.add('animate');
            }, 220);
        });
        
        seeAllLinks.forEach(link => {
            setTimeout(() => {
                link.classList.add('animate');
            }, 240); // Closer timing to create paired animation
        });
        
        // Feature cards animate with iOS-like staggered timing (more fluid, less mechanical)
        featuredCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate');
            }, 260 + (index * 70)); // Shorter 70ms delay for smoother cascade
        });
        
        // News cards animate with iOS springy feeling
        newsCards.forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('animate');
            }, 550 + (index * 50)); // Even shorter 50ms delay between news items
        });
        
        // Finally, navigation tabs slide up (like iOS dock)
        if (navTabs) {
            setTimeout(() => {
                navTabs.classList.add('animate');
            }, 800); // Faster appearance to complete the animation sooner
        }
        
        // No scroll-based animations at all
        // The page will only have the initial load animations
        
        // We'll remove the event listener for scroll to ensure no animation occurs
        window.removeEventListener('scroll', () => {});
    }
    
   // Handle page refresh animation
if (document.visibilityState === 'visible') {
    // If page is already visible, start animations
    startPageAnimations();
} else {
    // If page was in background, wait for it to become visible
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            startPageAnimations();
        }
    }, { once: true }); // Use { once: true } to ensure the listener is removed after firing
}})