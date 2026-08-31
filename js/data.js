// ============================================
// Inter-France - Data Module
// ============================================

// Global Data Store
const InterFranceData = {
    campings: [],
    regions: [],
    popularRegions: [],
    departments: [],
    currentFilters: {
        region: '',
        department: '',
        city: '',
        priceMin: '',
        priceMax: '',
        pitches: '',
        gites: '',
        rating: '',
        available: '',
        sortBy: 'date-desc'
    },
    
    // Initialize data
    async init() {
        try {
            // Load campings data
            const campingsResponse = await fetch('data/campings.json');
            this.campings = await campingsResponse.json();
            
            // Load regions data
            const regionsResponse = await fetch('data/regions.json');
            const regionsData = await regionsResponse.json();
            this.regions = regionsData.regions;
            this.popularRegions = regionsData.popular_regions;
            
            // Extract all departments
            this.departments = [];
            this.regions.forEach(region => {
                region.departments.forEach(dept => {
                    if (!this.departments.includes(dept)) {
                        this.departments.push(dept);
                    }
                });
            });
            
            // Sort campings by date (newest first)
            this.campings.sort((a, b) => {
                const dateA = new Date(a.date_listed);
                const dateB = new Date(b.date_listed);
                return dateB - dateA;
            });
            
            console.log('Inter-France Data initialized successfully');
            
            // Dispatch event that data is loaded
            document.dispatchEvent(new Event('interFranceDataLoaded'));
            
        } catch (error) {
            console.error('Error loading data:', error);
            // Fallback data if fetch fails
            this.campings = this.getFallbackCampings();
            this.regions = this.getFallbackRegions();
            this.popularRegions = this.regions.slice(0, 8).map(r => r.name);
        }
    },
    
    // Fallback data if fetch fails
    getFallbackCampings() {
        return [
            {
                id: 1,
                title: "Camping Les Pins - Provence",
                description: "Prachtige camping in de Provence",
                price: 850000,
                region: "Provence-Alpes-Côte d'Azur",
                department: "Var",
                city: "Fréjus",
                latitude: 43.4167,
                longitude: 6.7333,
                available: true,
                date_listed: "2024-05-15",
                plot_size: 25000,
                living_area: 120,
                year_built: 1995,
                num_pitches: 150,
                num_gites: 10,
                images: [],
                features: ["Zwembad", "Restaurant"],
                rating: 4.7,
                reviews: 245
            },
            {
                id: 2,
                title: "Camping Le Lac - Aquitaine",
                description: "Camping aan het meer",
                price: 1200000,
                region: "Nouvelle-Aquitaine",
                department: "Landes",
                city: "Biscarrosse",
                latitude: 44.3667,
                longitude: -0.9667,
                available: true,
                date_listed: "2024-04-22",
                plot_size: 35000,
                living_area: 150,
                year_built: 1988,
                num_pitches: 200,
                num_gites: 15,
                images: [],
                features: ["Privaat strand", "Zwembad"],
                rating: 4.6,
                reviews: 312
            }
        ];
    },
    
    getFallbackRegions() {
        return [
            { name: "Provence-Alpes-Côte d'Azur", coordinates: [43.9352, 6.0688], zoom: 7 },
            { name: "Nouvelle-Aquitaine", coordinates: [45.7073, 0.6367], zoom: 6 },
            { name: "Bretagne", coordinates: [48.0167, -2.5333], zoom: 7 },
            { name: "Auvergne-Rhône-Alpes", coordinates: [45.7640, 4.8357], zoom: 7 }
        ];
    },
    
    // Get all regions
    getAllRegions() {
        return this.regions.map(region => region.name);
    },
    
    // Get departments for a specific region
    getDepartmentsForRegion(regionName) {
        const region = this.regions.find(r => r.name === regionName);
        return region ? region.departments : [];
    },
    
    // Get region coordinates
    getRegionCoordinates(regionName) {
        const region = this.regions.find(r => r.name === regionName);
        return region ? region.coordinates : [46.6034, 1.8883]; // Default to France center
    },
    
    // Get region zoom level
    getRegionZoom(regionName) {
        const region = this.regions.find(r => r.name === regionName);
        return region ? region.zoom : 6;
    },
    
    // Get camping by ID
    getCampingById(id) {
        return this.campings.find(c => c.id === parseInt(id));
    },
    
    // Filter campings based on current filters
    filterCampings() {
        let filtered = [...this.campings];
        
        // Apply filters
        if (this.currentFilters.region) {
            filtered = filtered.filter(c => c.region === this.currentFilters.region);
        }
        
        if (this.currentFilters.department) {
            filtered = filtered.filter(c => c.department === this.currentFilters.department);
        }
        
        if (this.currentFilters.city) {
            const searchTerm = this.currentFilters.city.toLowerCase();
            filtered = filtered.filter(c => 
                c.city.toLowerCase().includes(searchTerm) ||
                c.department.toLowerCase().includes(searchTerm)
            );
        }
        
        // Price filters
        if (this.currentFilters.priceMin) {
            const minPrice = parseInt(this.currentFilters.priceMin);
            filtered = filtered.filter(c => c.price >= minPrice);
        }
        
        if (this.currentFilters.priceMax) {
            const maxPrice = parseInt(this.currentFilters.priceMax);
            filtered = filtered.filter(c => c.price <= maxPrice);
        }
        
        // Pitches filter
        if (this.currentFilters.pitches) {
            const [min, max] = this.currentFilters.pitches.split('-');
            if (max === '+') {
                filtered = filtered.filter(c => c.num_pitches >= parseInt(min));
            } else {
                filtered = filtered.filter(c => 
                    c.num_pitches >= parseInt(min) && 
                    c.num_pitches <= parseInt(max)
                );
            }
        }
        
        // Gites filter
        if (this.currentFilters.gites) {
            const [min, max] = this.currentFilters.gites.split('-');
            if (max === '+') {
                filtered = filtered.filter(c => c.num_gites >= parseInt(min));
            } else if (min === '0') {
                filtered = filtered.filter(c => c.num_gites === 0);
            } else {
                filtered = filtered.filter(c => 
                    c.num_gites >= parseInt(min) && 
                    c.num_gites <= parseInt(max)
                );
            }
        }
        
        // Rating filter
        if (this.currentFilters.rating) {
            const minRating = parseFloat(this.currentFilters.rating);
            filtered = filtered.filter(c => c.rating >= minRating);
        }
        
        // Availability filter
        if (this.currentFilters.available !== '') {
            const isAvailable = this.currentFilters.available === 'true';
            filtered = filtered.filter(c => c.available === isAvailable);
        }
        
        // Sort results
        filtered = this.sortCampings(filtered, this.currentFilters.sortBy);
        
        return filtered;
    },
    
    // Sort campings
    sortCampings(campings, sortBy) {
        const sorted = [...campings];
        
        switch (sortBy) {
            case 'price-asc':
                return sorted.sort((a, b) => a.price - b.price);
            case 'price-desc':
                return sorted.sort((a, b) => b.price - a.price);
            case 'rating-desc':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'pitches-desc':
                return sorted.sort((a, b) => b.num_pitches - a.num_pitches);
            case 'date-desc':
            default:
                return sorted.sort((a, b) => {
                    const dateA = new Date(a.date_listed);
                    const dateB = new Date(b.date_listed);
                    return dateB - dateA;
                });
        }
    },
    
    // Get price range options
    getPriceRangeOptions() {
        return [
            { value: '0-500000', label: '€0 - €500.000' },
            { value: '500000-1000000', label: '€500.000 - €1.000.000' },
            { value: '1000000-2000000', label: '€1.000.000 - €2.000.000' },
            { value: '2000000+', label: '€2.000.000+' }
        ];
    },
    
    // Format price
    formatPrice(price) {
        return new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    },
    
    // Format number
    formatNumber(num) {
        return new Intl.NumberFormat('nl-NL').format(num);
    },
    
    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(date);
    },
    
    // Get campings by region
    getCampingsByRegion(regionName) {
        return this.campings.filter(c => c.region === regionName);
    },
    
    // Get campings count by region
    getCampingsCountByRegion() {
        const counts = {};
        this.campings.forEach(camping => {
            if (camping.available) {
                counts[camping.region] = (counts[camping.region] || 0) + 1;
            }
        });
        return counts;
    },
    
    // Get all cities
    getAllCities() {
        const cities = new Set();
        this.campings.forEach(c => cities.add(c.city));
        return Array.from(cities).sort();
    },
    
    // Get all departments
    getAllDepartments() {
        const depts = new Set();
        this.campings.forEach(c => depts.add(c.department));
        return Array.from(depts).sort();
    },
    
    // Get price range for filter
    getPriceRange() {
        if (this.campings.length === 0) return { min: 0, max: 0 };
        
        const prices = this.campings.map(c => c.price);
        return {
            min: Math.min(...prices),
            max: Math.max(...prices)
        };
    }
};

// Initialize data when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        InterFranceData.init();
    });
} else {
    InterFranceData.init();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InterFranceData;
}
