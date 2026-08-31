// ============================================
// Inter-France - Kopen Page JavaScript
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKopenPage);
} else {
    initKopenPage();
}

function initKopenPage() {
    // Initialize modules
    initFilterForm();
    initResultsDisplay();
    initResultsMap();
    initSorting();
    
    // Load URL parameters
    loadUrlParameters();
    
    // Listen for data load event
    document.addEventListener('interFranceDataLoaded', () => {
        // Re-initialize with actual data
        initFilterForm();
        initResultsDisplay();
        initResultsMap();
        populateRegionFilters();
        
        // Re-load URL parameters with actual data
        loadUrlParameters();
    });
}

// ============================================
// Filter Form
// ============================================

function initFilterForm() {
    const filterForm = document.getElementById('filterForm');
    if (!filterForm) return;
    
    // Populate region filter
    populateRegionFilters('filterRegion');
    
    // Add form submit handler
    filterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        applyFilters();
    });
    
    // Add reset button handler
    const resetBtn = document.getElementById('resetFilters');
    if (resetBtn) {
        resetBtn.addEventListener('click', function() {
            filterForm.reset();
            resetDepartmentFilter();
            applyFilters();
            
            // Update URL
            window.history.pushState({}, '', 'kopen.html');
        });
    }
}

function applyFilters() {
    const filterRegion = document.getElementById('filterRegion').value;
    const filterDepartment = document.getElementById('filterDepartment').value;
    const filterPriceMin = document.getElementById('filterPriceMin').value;
    const filterPriceMax = document.getElementById('filterPriceMax').value;
    const filterPitches = document.getElementById('filterPitches').value;
    const filterGites = document.getElementById('filterGites').value;
    const filterRating = document.getElementById('filterRating').value;
    const filterAvailable = document.getElementById('filterAvailable').value;
    const sortBy = document.getElementById('sortBy').value;
    
    // Update current filters
    InterFranceData.currentFilters = {
        region: filterRegion,
        department: filterDepartment,
        city: '',
        priceMin: filterPriceMin,
        priceMax: filterPriceMax,
        pitches: filterPitches,
        gites: filterGites,
        rating: filterRating,
        available: filterAvailable,
        sortBy: sortBy
    };
    
    // Filter and display results
    const filtered = InterFranceData.filterCampings();
    displayResults(filtered);
    
    // Update map
    if (typeof InterFranceMap !== 'undefined' && InterFranceMap.map) {
        InterFranceMap.updateMarkers(filtered);
    }
    
    // Update URL with filters
    updateUrlWithFilters();
}

function resetDepartmentFilter() {
    const departmentSelect = document.getElementById('filterDepartment');
    if (departmentSelect) {
        departmentSelect.innerHTML = '';
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'Selecteer Regio Eerst';
        departmentSelect.appendChild(option);
        departmentSelect.disabled = true;
    }
}

// ============================================
// Results Display
// ============================================

function initResultsDisplay() {
    const resultsGrid = document.getElementById('resultsGrid');
    const totalResults = document.getElementById('totalResults');
    const noResults = document.getElementById('noResults');
    
    if (!resultsGrid) return;
    
    // Initial display with all campings
    const allCampings = InterFranceData.campings.length > 0
        ? InterFranceData.campings
        : getSampleCampings();
    
    displayResults(allCampings, resultsGrid, totalResults, noResults);
}

function displayResults(campings, resultsGrid, totalResultsEl, noResultsEl) {
    // Get elements if not provided
    if (!resultsGrid) resultsGrid = document.getElementById('resultsGrid');
    if (!totalResultsEl) totalResultsEl = document.getElementById('totalResults');
    if (!noResultsEl) noResultsEl = document.getElementById('noResults');
    
    if (!resultsGrid) return;
    
    // Update results count
    if (totalResultsEl) {
        totalResultsEl.textContent = campings.length;
    }
    
    // Show/hide no results message
    if (noResultsEl) {
        if (campings.length === 0) {
            noResultsEl.style.display = 'block';
        } else {
            noResultsEl.style.display = 'none';
        }
    }
    
    // Clear and populate results grid
    resultsGrid.innerHTML = '';
    
    if (campings.length === 0) return;
    
    campings.forEach(camping => {
        const card = createCampingCard(camping);
        resultsGrid.appendChild(card);
    });
}

// ============================================
// Results Map
// ============================================

function initResultsMap() {
    const resultsMap = document.getElementById('resultsMap');
    if (!resultsMap) return;
    
    // Wait for data to be loaded
    if (InterFranceData.campings.length === 0) {
        document.addEventListener('interFranceDataLoaded', () => {
            initResultsMap();
        });
        return;
    }
    
    // Initialize map with all campings
    InterFranceMap.init(resultsMap.id, InterFranceData.campings, InterFranceData.regions);
}

// ============================================
// Sorting
// ============================================

function initSorting() {
    const sortSelect = document.getElementById('sortBy');
    if (!sortSelect) return;
    
    sortSelect.addEventListener('change', function() {
        InterFranceData.currentFilters.sortBy = this.value;
        const filtered = InterFranceData.filterCampings();
        displayResults(filtered);
    });
}

// ============================================
// URL Parameters
// ============================================

function loadUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if we have data loaded
    if (InterFranceData.campings.length === 0) {
        // Wait for data to load
        document.addEventListener('interFranceDataLoaded', () => {
            loadUrlParameters();
        });
        return;
    }
    
    const filterForm = document.getElementById('filterForm');
    if (!filterForm) return;
    
    // Get parameter values
    const region = urlParams.get('region') || '';
    const city = urlParams.get('city') || '';
    const price = urlParams.get('price') || '';
    
    // Set form values
    if (region) {
        filterForm.elements.filterRegion.value = region;
        updateDepartmentFilter(region, 'filterDepartment');
        
        // Trigger department filter update
        const department = urlParams.get('department') || '';
        if (department) {
            setTimeout(() => {
                filterForm.elements.filterDepartment.value = department;
            }, 100);
        }
    }
    
    if (city) {
        // For city search, redirect to filtered results
        InterFranceData.currentFilters.city = city;
        InterFranceData.currentFilters.region = region;
        
        // Map price range to min/max
        if (price) {
            const priceRanges = {
                '0-500000': { min: '0', max: '500000' },
                '500000-1000000': { min: '500000', max: '1000000' },
                '1000000-2000000': { min: '1000000', max: '2000000' },
                '2000000+': { min: '2000000', max: '' }
            };
            
            const range = priceRanges[price];
            if (range) {
                InterFranceData.currentFilters.priceMin = range.min;
                InterFranceData.currentFilters.priceMax = range.max;
            }
        }
        
        applyFilters();
    } else {
        // Apply region filter if present
        if (region) {
            InterFranceData.currentFilters.region = region;
            if (price) {
                const priceRanges = {
                    '0-500000': { min: '0', max: '500000' },
                    '500000-1000000': { min: '500000', max: '1000000' },
                    '1000000-2000000': { min: '1000000', max: '2000000' },
                    '2000000+': { min: '2000000', max: '' }
                };
                
                const range = priceRanges[price];
                if (range) {
                    InterFranceData.currentFilters.priceMin = range.min;
                    InterFranceData.currentFilters.priceMax = range.max;
                }
            }
            applyFilters();
        }
    }
}

function updateUrlWithFilters() {
    const params = new URLSearchParams();
    
    if (InterFranceData.currentFilters.region) {
        params.set('region', InterFranceData.currentFilters.region);
    }
    if (InterFranceData.currentFilters.department) {
        params.set('department', InterFranceData.currentFilters.department);
    }
    if (InterFranceData.currentFilters.priceMin) {
        params.set('priceMin', InterFranceData.currentFilters.priceMin);
    }
    if (InterFranceData.currentFilters.priceMax) {
        params.set('priceMax', InterFranceData.currentFilters.priceMax);
    }
    if (InterFranceData.currentFilters.pitches) {
        params.set('pitches', InterFranceData.currentFilters.pitches);
    }
    if (InterFranceData.currentFilters.gites) {
        params.set('gites', InterFranceData.currentFilters.gites);
    }
    if (InterFranceData.currentFilters.rating) {
        params.set('rating', InterFranceData.currentFilters.rating);
    }
    if (InterFranceData.currentFilters.available) {
        params.set('available', InterFranceData.currentFilters.available);
    }
    if (InterFranceData.currentFilters.sortBy) {
        params.set('sortBy', InterFranceData.currentFilters.sortBy);
    }
    
    const newUrl = `kopen.html?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
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
            latitude: 43.4167,
            longitude: 6.7333,
            available: true,
            date_listed: "2024-05-15",
            num_pitches: 150,
            num_gites: 10,
            rating: 4.7,
            reviews: 245
        },
        {
            id: 2,
            title: "Camping Le Lac",
            description: "Camping aan het meer",
            price: 1200000,
            region: "Nouvelle-Aquitaine",
            department: "Landes",
            city: "Biscarrosse",
            latitude: 44.3667,
            longitude: -0.9667,
            available: true,
            date_listed: "2024-04-22",
            num_pitches: 200,
            num_gites: 15,
            rating: 4.6,
            reviews: 312
        }
    ];
}
