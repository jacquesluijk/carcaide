// ============================================
// Inter-France - Camping Detail Page JavaScript
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCampingPage);
} else {
    initCampingPage();
}

function initCampingPage() {
    // Get camping ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const campingId = urlParams.get('id');
    
    if (!campingId) {
        // No ID provided, redirect to kopen page
        window.location.href = 'kopen.html';
        return;
    }
    
    // Load camping data
    loadCampingData(campingId);
    
    // Initialize modules
    initGallery();
    initBackToTop();
    initFooterRegions();
    
    // Listen for data load event
    document.addEventListener('interFranceDataLoaded', () => {
        // Re-load camping data with actual data
        loadCampingData(campingId);
        initFooterRegions();
    });
}

// ============================================
// Load Camping Data
// ============================================

function loadCampingData(campingId) {
    // Check if we have data loaded
    if (InterFranceData.campings.length > 0) {
        displayCampingData(campingId);
        return;
    }
    
    // Wait for data to load
    document.addEventListener('interFranceDataLoaded', () => {
        displayCampingData(campingId);
    });
}

function displayCampingData(campingId) {
    const camping = InterFranceData.getCampingById(campingId);
    
    if (!camping) {
        // Camping not found, show error
        document.getElementById('campingPageTitle').textContent = 'Camping Niet Gevonden';
        document.getElementById('campingDescription').innerHTML = '<p>De gevraagde camping bestaat niet of is niet meer beschikbaar.</p>';
        return;
    }
    
    // Update page title
    document.title = `${camping.title} - Inter-France`;
    
    // Update breadcrumb and title
    document.getElementById('campingTitle').textContent = camping.title;
    document.getElementById('campingPageTitle').textContent = camping.title;
    
    // Update description
    const descriptionContainer = document.getElementById('campingDescription');
    if (descriptionContainer) {
        descriptionContainer.innerHTML = `<p>${camping.description}</p>`;
    }
    
    // Update long description (use description again or create more detailed text)
    const longDescriptionContainer = document.getElementById('campingLongDescription');
    if (longDescriptionContainer) {
        longDescriptionContainer.innerHTML = `
            <p>${camping.description}</p>
            <p>Deze prachtige camping is gelegen in het hart van ${camping.region}, in de buurt van ${camping.city}. 
            Met ${camping.num_pitches} standen en ${camping.num_gites} gîtes biedt deze camping ruimte voor 
            zowel gezinnen als groepen.</p>
            <p>De camping beschikt over diverse faciliteiten en is ideaal voor een ontspannen vakantie in Frankrijk.</p>
        `;
    }
    
    // Update details
    updateCampingDetails(camping);
    
    // Update features
    updateCampingFeatures(camping);
    
    // Update gallery
    updateGallery(camping);
    
    // Update map
    updateCampingMap(camping);
    
    // Update similar campings
    updateSimilarCampings(camping);
    
    // Update sidebar info
    updateSidebarInfo(camping);
    
    // Update contact info
    updateContactInfo(camping);
    
    // Update website link
    updateWebsiteLink(camping);
    
    // Add structured data for SEO
    addStructuredData(camping);
}

function updateCampingDetails(camping) {
    // Format price
    const price = InterFranceData.formatPrice(camping.price);
    
    // Format date
    const date = InterFranceData.formatDate(camping.date_listed);
    
    // Format area
    const plotSize = camping.plot_size ? `${InterFranceData.formatNumber(camping.plot_size)} m²` : '-';
    const livingArea = camping.living_area ? `${InterFranceData.formatNumber(camping.living_area)} m²` : '-';
    
    // Update all detail fields
    document.getElementById('campingRegion').textContent = camping.region || '-';
    document.getElementById('campingDepartment').textContent = camping.department || '-';
    document.getElementById('campingCity').textContent = camping.city || '-';
    document.getElementById('campingPrice').textContent = price;
    document.getElementById('campingAvailable').textContent = camping.available ? 'Beschikbaar' : 'Verkocht';
    document.getElementById('campingDate').textContent = date;
    document.getElementById('campingPlotSize').textContent = plotSize;
    document.getElementById('campingLivingArea').textContent = livingArea;
    document.getElementById('campingYearBuilt').textContent = camping.year_built || '-';
    document.getElementById('campingRenovated').textContent = camping.renovated ? camping.renovated : '-';
    document.getElementById('campingNumPitches').textContent = camping.num_pitches ? InterFranceData.formatNumber(camping.num_pitches) : '-';
    document.getElementById('campingNumGites').textContent = camping.num_gites ? InterFranceData.formatNumber(camping.num_gites) : '-';
}

function updateCampingFeatures(camping) {
    const featuresContainer = document.getElementById('campingFeatures');
    if (!featuresContainer) return;
    
    if (!camping.features || camping.features.length === 0) {
        featuresContainer.innerHTML = '<p>Geen faciliteiten gespecificeerd</p>';
        return;
    }
    
    featuresContainer.innerHTML = '';
    
    camping.features.forEach(feature => {
        const featureItem = document.createElement('div');
        featureItem.className = 'feature-item';
        
        // Map feature names to icons
        const featureIcons = {
            'Zwembad': 'fa-swimming-pool',
            'Restaurant': 'fa-utensils',
            'Bar': 'fa-glass-martini',
            'Speeltuin': 'fa-child',
            'WiFi': 'fa-wifi',
            'Sanitaire gebouwen': 'fa-restroom',
            'Wasserette': 'fa-tshirt',
            'Supermarkt': 'fa-shopping-cart',
            'Animatieteam': 'fa-users',
            'Kinderenclub': 'fa-child',
            'Sportfaciliteiten': 'fa-dumbbell',
            'Spa/Wellness': 'fa-spa',
            'Natuurcamping': 'fa-tree',
            'Boswandelingen': 'fa-hiking',
            'Vistocht': 'fa-fish',
            'Fietsverhuur': 'fa-bicycle',
            'Ecologische sanitaire': 'fa-leaf',
            'Zonne-energie': 'fa-solar-panel',
            'Privaat strand': 'fa-umbrella-beach',
            'Watersport': 'fa-ship',
            'Klimfaciliteiten': 'fa-mountain',
            'Sauna': 'fa-hot-tub',
            'Wellness': 'fa-spa',
            'Conferentieruimtes': 'fa-chalkboard',
            'Wijnproeverijen': 'fa-wine-glass',
            'Wijngaard': 'fa-glass-cheers',
            'Wijnbar': 'fa-wine-glass-alt',
            'Ski-in ski-out': 'fa-skiing',
            'Verwarmde accommodaties': 'fa-thermometer-half',
            'Skiopslag': 'fa-skiing-nordic',
            'Skiverhuur': 'fa-skiing',
            'Golfbaan': 'fa-golf-ball',
            'Kasteelterrein': 'fa-landmark',
            'Historische sfeer': 'fa-monument',
            'Zeezicht': 'fa-ship',
            'Strandtoegang': 'fa-umbrella-beach',
            'Familiaal': 'fa-users',
            'Rustig': 'fa-volume-mute',
            'Grotbezoeken': 'fa-archway',
            'Lokale markten': 'fa-store',
            'Berguitzicht': 'fa-mountain',
            'Wandelpaden': 'fa-hiking'
        };
        
        const icon = featureIcons[feature] || 'fa-check-circle';
        
        featureItem.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${feature}</span>
        `;
        
        featuresContainer.appendChild(featureItem);
    });
}

function updateGallery(camping) {
    const mainImage = document.getElementById('mainImage');
    const thumbnailGrid = document.getElementById('thumbnailGrid');
    
    if (!mainImage || !thumbnailGrid) return;
    
    // Check if we have images
    if (!camping.images || camping.images.length === 0) {
        mainImage.src = 'https://via.placeholder.com/800x500?text=Camping';
        thumbnailGrid.innerHTML = '<p>Geen foto\'s beschikbaar</p>';
        return;
    }
    
    // Set main image
    mainImage.src = camping.images[0];
    mainImage.alt = `${camping.title} - Hoofdfoto`;
    
    // Create thumbnails
    thumbnailGrid.innerHTML = '';
    
    camping.images.forEach((image, index) => {
        const thumbnail = document.createElement('img');
        thumbnail.src = image;
        thumbnail.alt = `${camping.title} - Foto ${index + 1}`;
        thumbnail.className = 'thumbnail';
        if (index === 0) {
            thumbnail.classList.add('active');
        }
        
        thumbnail.addEventListener('click', function() {
            // Update main image
            mainImage.src = image;
            mainImage.alt = this.alt;
            
            // Update active class
            document.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
        });
        
        thumbnailGrid.appendChild(thumbnail);
    });
    
    // Initialize LightGallery
    setTimeout(() => {
        if (typeof lightGallery !== 'undefined') {
            lightGallery(document.getElementById('thumbnailGrid'), {
                selector: '.thumbnail',
                download: false,
                counter: false,
                zoomFromOrigin: false
            });
        }
    }, 500);
}

function updateCampingMap(camping) {
    const campingMap = document.getElementById('campingMap');
    if (!campingMap) return;
    
    // Check if map already exists
    if (campingMap.hasChildNodes() && campingMap.querySelector('.leaflet-container')) {
        return;
    }
    
    // Initialize map centered on camping location
    const map = L.map(campingMap, {
        center: [camping.latitude, camping.longitude],
        zoom: 12,
        scrollWheelZoom: false,
        zoomControl: true
    });
    
    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    
    // Add marker for camping location
    const iconUrl = camping.available 
        ? 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png' 
        : 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-grey.png';
    
    const icon = L.icon({
        iconUrl: iconUrl,
        iconSize: [32, 50],
        iconAnchor: [16, 50],
        popupAnchor: [0, -50]
    });
    
    L.marker([camping.latitude, camping.longitude], {
        icon: icon,
        title: camping.title
    }).addTo(map)
    .bindPopup(`<b>${camping.title}</b><br>${camping.city}, ${camping.department}<br>${camping.region}`);
    
    // Add zoom control
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
}

function updateSimilarCampings(camping) {
    const similarGrid = document.getElementById('similarCampingsGrid');
    if (!similarGrid) return;
    
    // Find similar campings (same region, excluding current camping)
    const similarCampings = InterFranceData.campings.filter(c => 
        c.region === camping.region && 
        c.id !== camping.id
    ).slice(0, 4);
    
    if (similarCampings.length === 0) {
        similarGrid.innerHTML = '<p>Geen soortgelijke campings in deze regio.</p>';
        return;
    }
    
    similarGrid.innerHTML = '';
    
    similarCampings.forEach(similarCamping => {
        const card = createSimilarCampingCard(similarCamping);
        similarGrid.appendChild(card);
    });
}

function createSimilarCampingCard(camping) {
    const card = document.createElement('div');
    card.className = 'camping-card';
    
    const price = InterFranceData.formatPrice(camping.price);
    const imageUrl = camping.images && camping.images.length > 0 
        ? camping.images[0] 
        : 'https://via.placeholder.com/300x200?text=Camping';
    
    card.innerHTML = `
        <div class="camping-image" style="height: 180px; background-image: url('${imageUrl}')"></div>
        <div class="camping-content">
            <h3 class="camping-title" style="font-size: 1rem; margin-bottom: 0.5rem;">${camping.title}</h3>
            <div class="camping-location" style="font-size: 0.875rem;">
                <i class="fas fa-map-marker-alt"></i>
                <span>${camping.city}</span>
            </div>
            <div class="camping-price" style="font-size: 1.125rem; margin: 0.5rem 0;">${price}</div>
            <a href="camping.html?id=${camping.id}" class="btn btn-card btn-sm">
                <i class="fas fa-info-circle"></i> Details
            </a>
        </div>
    `;
    
    return card;
}

function updateSidebarInfo(camping) {
    const sidebarRating = document.getElementById('sidebarRating');
    const sidebarReviews = document.getElementById('sidebarReviews');
    const sidebarPitches = document.getElementById('sidebarPitches');
    const sidebarGites = document.getElementById('sidebarGites');
    
    if (sidebarRating) {
        sidebarRating.textContent = camping.rating ? `${camping.rating}/5` : 'Niet beoordeeld';
    }
    
    if (sidebarReviews) {
        sidebarReviews.textContent = camping.reviews ? `${camping.reviews} reviews` : '0 reviews';
    }
    
    if (sidebarPitches) {
        sidebarPitches.textContent = camping.num_pitches ? `${camping.num_pitches} plaatsen` : '-';
    }
    
    if (sidebarGites) {
        sidebarGites.textContent = camping.num_gites ? `${camping.num_gites} gîtes` : '0 gîtes';
    }
}

function updateContactInfo(camping) {
    const campingPhone = document.getElementById('campingPhone');
    const campingEmail = document.getElementById('campingEmail');
    
    if (campingPhone) {
        campingPhone.innerHTML = camping.phone ? `<a href="tel:${camping.phone.replace(/\s/g, '')}">${camping.phone}</a>` : '-';
    }
    
    if (campingEmail) {
        campingEmail.innerHTML = camping.email ? `<a href="mailto:${camping.email}">${camping.email}</a>` : '-';
    }
}

function updateWebsiteLink(camping) {
    const campingWebsite = document.getElementById('campingWebsite');
    if (!campingWebsite) return;
    
    if (camping.website) {
        campingWebsite.innerHTML = `<a href="${camping.website}" target="_blank">${camping.website.replace(/^https?:\/\//, '')}</a>`;
    } else {
        campingWebsite.textContent = '-';
    }
}

function addStructuredData(camping) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Accommodation",
        "name": camping.title,
        "description": camping.description,
        "address": {
            "@type": "PostalAddress",
            "addressLocality": camping.city,
            "addressRegion": camping.department,
            "addressCountry": "FR"
        },
        "geo": {
            "@type": "GeoCoordinates",
            "latitude": camping.latitude,
            "longitude": camping.longitude
        },
        "telephone": camping.phone,
        "email": camping.email,
        "url": camping.website,
        "priceRange": {
            "@type": "PriceSpecification",
            "currency": "EUR",
            "price": camping.price
        },
        "numberOfRooms": camping.num_gites,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": camping.rating || 0,
            "reviewCount": camping.reviews || 0
        },
        "openingHours": "Mo-Fr 09:00-17:00",
        "sameAs": camping.website
    };
    
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);
}

// ============================================
// Gallery
// ============================================

function initGallery() {
    const mainImage = document.getElementById('mainImage');
    const thumbnailGrid = document.getElementById('thumbnailGrid');
    
    if (!mainImage || !thumbnailGrid) return;
    
    // Add click handler for main image to open gallery
    mainImage.addEventListener('click', function() {
        if (typeof lightGallery !== 'undefined') {
            const gallery = lightGallery(thumbnailGrid, {
                selector: '.thumbnail',
                download: false,
                counter: false
            });
            
            // Find index of current main image
            const activeThumbnail = thumbnailGrid.querySelector('.thumbnail.active');
            if (activeThumbnail) {
                const thumbnails = thumbnailGrid.querySelectorAll('.thumbnail');
                const index = Array.from(thumbnails).indexOf(activeThumbnail);
                gallery.openGallery(index);
            }
        }
    });
}

// ============================================
// Back to Top
// ============================================

function initBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    if (!backToTopBtn) return;
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    
    backToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ============================================
// Footer Regions
// ============================================

function initFooterRegions() {
    const footerLinks = [
        document.getElementById('footerRegionsLinksCamping')
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
