// ============================================
// Inter-France - Main JavaScript
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', main);
} else {
    main();
}

function main() {
    // Initialize all modules
    initNavigation();
    initHeroSearch();
    initCampingsDisplay();
    initPopularRegions();
    initFooterRegions();
    initBackToTop();
    initLeadForm();
    initMobileMenu();
    
    // Listen for data load event
    document.addEventListener('interFranceDataLoaded', () => {
        // Re-initialize modules that depend on data
        initCampingsDisplay();
        initPopularRegions();
        initFooterRegions();
        
        // Populate region filters
        populateRegionFilters();
    });
}

// ============================================
// Navigation
// ============================================

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
}

// ============================================
// Hero Search
// ============================================

function initHeroSearch() {
    const searchForm = document.getElementById('heroSearchForm');
    if (!searchForm) return;
    
    // Populate region filter
    populateRegionFilters();
    
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const region = document.getElementById('regionFilter').value;
        const city = document.getElementById('cityFilter').value;
        const priceRange = document.getElementById('priceFilter').value;
        
        // Build query parameters
        const params = new URLSearchParams();
        if (region) params.set('region', region);
        if (city) params.set('city', city);
        if (priceRange) params.set('price', priceRange);
        
        // Redirect to kopen page with filters
        window.location.href = `kopen.html?${params.toString()}`;
    });
}

// ============================================
// Campings Display
// ============================================

function initCampingsDisplay() {
    const campingsGrid = document.getElementById('campingsGrid');
    if (!campingsGrid) return;
    
    // Get campings (use all if data not loaded yet)
    const campings = InterFranceData.campings.length > 0 
        ? InterFranceData.campings 
        : getSampleCampings();
    
    // Display campings
    displayCampings(campings.slice(0, 6), campingsGrid);
}

function displayCampings(campings, container) {
    container.innerHTML = '';
    
    campings.forEach(camping => {
        const card = createCampingCard(camping);
        container.appendChild(card);
    });
}

function createCampingCard(camping) {
    const card = document.createElement('div');
    card.className = 'camping-card fade-in';
    card.dataset.campingId = camping.id;
    
    const price = InterFranceData.formatPrice(camping.price);
    const date = InterFranceData.formatDate(camping.date_listed);
    const rating = camping.rating ? `⭐ ${camping.rating}/5` : '';
    
    // Create image URL (use placeholder if not available)
    const imageUrl = camping.images && camping.images.length > 0 
        ? camping.images[0] 
        : 'https://via.placeholder.com/400x250?text=Camping';
    
    card.innerHTML = `
        <div class="camping-image" style="background-image: url('${imageUrl}')"></div>
        ${camping.available ? '' : '<div class="camping-badge sold">Verkocht</div>'}
        <div class="camping-content">
            <h3 class="camping-title">${camping.title}</h3>
            <div class="camping-location">
                <i class="fas fa-map-marker-alt"></i>
                <span>${camping.city}, ${camping.department}</span>
            </div>
            <div class="camping-price">${price}</div>
            <div class="camping-features">
                <span class="camping-feature"><i class="fas fa-cube"></i> ${camping.num_pitches} plaatsen</span>
                <span class="camping-feature"><i class="fas fa-home"></i> ${camping.num_gites} gîtes</span>
            </div>
            <div class="camping-footer">
                <div class="camping-rating">${rating}</div>
                <div class="camping-actions">
                    <a href="camping.html?id=${camping.id}" class="btn btn-card">
                        <i class="fas fa-info-circle"></i> Details
                    </a>
                </div>
            </div>
        </div>
    `;
    
    // Add hover effect
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
    });
    
    return card;
}

// Sample campings for fallback
function getSampleCampings() {
    return [
        {
            id: 1,
            title: "Camping Les Pins",
            description: "Prachtige camping in Provence",
            price: 850000,
            region: "Provence-Alpes-Côte d'Azur",
            department: "Var",
            city: "Fréjus",
            available: true,
            date_listed: "2024-05-15",
            num_pitches: 150,
            num_gites: 10,
            rating: 4.7
        },
        {
            id: 2,
            title: "Camping Le Lac",
            description: "Camping aan het meer",
            price: 1200000,
            region: "Nouvelle-Aquitaine",
            department: "Landes",
            city: "Biscarrosse",
            available: true,
            date_listed: "2024-04-22",
            num_pitches: 200,
            num_gites: 15,
            rating: 4.6
        }
    ];
}

// ============================================
// Popular Regions
// ============================================

function initPopularRegions() {
    const regionsGrid = document.getElementById('popularRegionsGrid');
    if (!regionsGrid) return;
    
    const popularRegions = InterFranceData.popularRegions.length > 0
        ? InterFranceData.popularRegions
        : ['Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine', 'Bretagne', 'Occitanie'];
    
    const campingsCount = InterFranceData.getCampingsCountByRegion();
    
    regionsGrid.innerHTML = '';
    
    popularRegions.forEach(region => {
        const count = campingsCount[region] || 0;
        const card = createRegionCard(region, count);
        regionsGrid.appendChild(card);
    });
}

function createRegionCard(region, count) {
    const card = document.createElement('div');
    card.className = 'region-card';
    card.dataset.region = region;
    
    card.innerHTML = `
        <h3 class="region-name">${region}</h3>
        <p class="region-count">${count} ${count === 1 ? 'camping' : 'campings'} beschikbaar</p>
    `;
    
    // Add click handler
    card.addEventListener('click', function() {
        const params = new URLSearchParams();
        params.set('region', region);
        window.location.href = `kopen.html?${params.toString()}`;
    });
    
    return card;
}

// ============================================
// Footer Regions
// ============================================

function initFooterRegions() {
    const footerLinks = [
        document.getElementById('footerRegionsLinks'),
        document.getElementById('footerRegionsLinksKopen'),
        document.getElementById('footerRegionsLinksVerkopen'),
        document.getElementById('footerRegionsLinksContact')
    ];
    
    footerLinks.forEach(container => {
        if (!container) return;
        
        const popularRegions = InterFranceData.popularRegions.length > 0
            ? InterFranceData.popularRegions
            : ['Provence-Alpes-Côte d\'Azur', 'Nouvelle-Aquitaine', 'Bretagne', 'Occitanie'];
        
        container.innerHTML = '';
        
        popularRegions.forEach(region => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = `kopen.html?region=${encodeURIComponent(region)}`;
            a.textContent = region;
            li.appendChild(a);
            container.appendChild(li);
        });
    });
}

// ============================================
// Back to Top Button
// ============================================

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    // Show/hide button based on scroll position
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    // Scroll to top on click
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Lead Form
// ============================================

function initLeadForm() {
    const leadForm = document.getElementById('leadForm');
    if (!leadForm) return;
    
    // Populate region filter
    populateRegionFilters('leadRegion');
    
    leadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(leadForm);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!validateLeadForm(data)) {
            alert('Vul alle verplichte velden in.');
            return;
        }
        
        // Show loading state
        const submitBtn = leadForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verzenden...';
        
        // Simulate form submission (in real implementation, send to server)
        setTimeout(() => {
            // Show success message
            alert('Bedankt voor uw interesse! Wij nemen binnen 24 uur contact met u op.');
            
            // Reset form
            leadForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Verzenden';
        }, 1500);
    });
}

function validateLeadForm(data) {
    const requiredFields = ['name', 'email', 'interest', 'privacy'];
    return requiredFields.every(field => data[field] && data[field].trim() !== '');
}

// ============================================
// Mobile Menu
// ============================================

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navList = document.querySelector('.nav-list');
    
    if (!mobileMenuBtn || !navList) return;
    
    mobileMenuBtn.addEventListener('click', function() {
        // Toggle mobile menu
        if (navList.style.display === 'flex') {
            navList.style.display = 'none';
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        } else {
            navList.style.display = 'flex';
            mobileMenuBtn.innerHTML = '<i class="fas fa-times"></i>';
        }
    });
}

// ============================================
// Region Filters
// ============================================

function populateRegionFilters(selectId = 'regionFilter') {
    // Get all select elements with the given ID or data-region-filter attribute
    const selectElements = [];
    
    if (selectId) {
        const select = document.getElementById(selectId);
        if (select) selectElements.push(select);
    }
    
    // Also find elements with data-region-filter attribute
    const dataSelects = document.querySelectorAll('[data-region-filter]');
    dataSelects.forEach(select => selectElements.push(select));
    
    const regions = InterFranceData.getAllRegions();
    
    selectElements.forEach(select => {
        if (select.innerHTML.trim() !== '') return; // Already populated
        
        // Clear existing options (except first)
        while (select.options.length > 1) {
            select.remove(1);
        }
        
        // Add regions
        regions.forEach(region => {
            const option = document.createElement('option');
            option.value = region;
            option.textContent = region;
            select.appendChild(option);
        });
        
        // Add event listener for department filter
        if (select.id === 'filterRegion' || select.id === 'sellRegion') {
            select.addEventListener('change', function() {
                updateDepartmentFilter(this.value, this.id.replace('Region', 'Department'));
            });
        }
    });
}

function updateDepartmentFilter(regionName, departmentSelectId) {
    const departmentSelect = document.getElementById(departmentSelectId);
    if (!departmentSelect) return;
    
    departmentSelect.innerHTML = '';
    
    if (!regionName) {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Selecteer Regio Eerst';
        departmentSelect.appendChild(option);
        departmentSelect.disabled = true;
        return;
    }
    
    const departments = InterFranceData.getDepartmentsForRegion(regionName);
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Alle Departementen';
    departmentSelect.appendChild(defaultOption);
    
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        departmentSelect.appendChild(option);
    });
    
    departmentSelect.disabled = false;
}

// ============================================
// Utility Functions
// ============================================

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Initialize when window loads
window.addEventListener('load', function() {
    // Add any window load specific initialization
});
