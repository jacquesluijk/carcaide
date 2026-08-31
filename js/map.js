// ============================================
// Inter-France - Map Module
// Uses Leaflet.js for interactive France map
// ============================================

const InterFranceMap = {
    map: null,
    markers: [],
    regionLayers: [],
    currentRegionLayer: null,
    
    // France bounding box
    franceBounds: [[41.35, -5.15], [51.1, 9.6]],
    
    // Initialize map
    init(mapId, campings, regions) {
        // Create map centered on France
        this.map = L.map(mapId, {
            center: [46.6034, 1.8883], // Center of France
            zoom: 6,
            minZoom: 5,
            maxZoom: 12,
            scrollWheelZoom: true,
            zoomControl: true,
            attributionControl: false
        });
        
        // Add OpenStreetMap base layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 18
        }).addTo(this.map);
        
        // Add France boundary (simplified)
        this.addFranceBoundary();
        
        // Add region boundaries
        this.addRegionBoundaries(regions);
        
        // Add camping markers
        this.addCampingMarkers(campings);
        
        // Fit map to France
        this.map.fitBounds(this.franceBounds);
        
        // Add zoom control
        L.control.zoom({
            position: 'topright'
        }).addTo(this.map);
        
        // Add scale control
        L.control.scale({
            position: 'bottomleft',
            metric: true,
            imperial: false
        }).addTo(this.map);
        
        // Add custom attribution
        const attribution = L.control.attribution({
            position: 'bottomright'
        });
        attribution.addAttribution('<a href="https://inter-france.nl">Inter-France</a>');
        attribution.addTo(this.map);
        
        console.log('Inter-France Map initialized');
    },
    
    // Add France boundary
    addFranceBoundary() {
        // Simplified France polygon (mainland only)
        const francePolygon = L.polygon([
            [51.1, -5.15], [51.1, 2.6], [50.9, 4.8], [50.7, 6.4],
            [50.5, 8.2], [50.1, 9.6], [49.5, 9.6], [48.7, 8.2],
            [48.1, 7.2], [47.5, 6.1], [47.3, 5.0], [46.8, 4.0],
            [46.3, 3.0], [45.8, 2.0], [45.5, 1.0], [45.0, 0.0],
            [44.5, -0.5], [44.3, -1.5], [44.0, -2.0], [43.6, -1.8],
            [43.3, -1.0], [43.0, 0.5], [42.8, 1.5], [42.5, 2.5],
            [42.3, 3.5], [42.0, 4.5], [41.8, 5.5], [41.5, 6.0],
            [41.3, 6.5], [41.3, 7.5], [41.5, 8.2], [41.8, 9.0],
            [42.0, 9.6], [42.5, 9.6], [42.8, 8.5], [43.0, 7.5],
            [43.2, 6.5], [43.5, 5.5], [43.8, 4.5], [44.0, 3.5],
            [44.3, 2.5], [44.5, 1.5], [44.8, 0.5], [45.0, -0.5],
            [45.5, -1.5], [46.0, -2.5], [46.5, -3.0], [47.0, -3.5],
            [47.5, -4.0], [48.0, -4.5], [48.5, -5.15], [49.0, -5.15],
            [49.5, -5.15], [50.0, -5.15], [50.5, -5.15], [51.1, -5.15]
        ], {
            color: '#1a365d',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.05,
            fillColor: '#1a365d'
        }).addTo(this.map);
    },
    
    // Add region boundaries
    addRegionBoundaries(regions) {
        // Simplified region polygons (approximate)
        const regionPolygons = {
            'Île-de-France': [[48.8, 1.8], [48.8, 2.8], [49.0, 2.8], [49.0, 1.8]],
            'Provence-Alpes-Côte d\'Azur': [[43.0, 5.0], [43.0, 7.0], [44.0, 7.0], [44.0, 5.0]],
            'Nouvelle-Aquitaine': [[44.0, -1.5], [44.0, 1.0], [46.0, 1.0], [46.0, -1.5]],
            'Occitanie': [[42.5, 1.0], [42.5, 4.0], [44.5, 4.0], [44.5, 1.0]],
            'Auvergne-Rhône-Alpes': [[44.5, 3.0], [44.5, 7.0], [46.5, 7.0], [46.5, 3.0]],
            'Bretagne': [[47.5, -3.0], [47.5, -1.0], [48.8, -1.0], [48.8, -3.0]],
            'Normandie': [[48.8, -1.5], [48.8, 1.0], [50.0, 1.0], [50.0, -1.5]],
            'Pays de la Loire': [[46.5, -2.0], [46.5, 0.0], [48.0, 0.0], [48.0, -2.0]],
            'Grand Est': [[47.5, 4.0], [47.5, 8.0], [49.5, 8.0], [49.5, 4.0]],
            'Hauts-de-France': [[49.5, 1.0], [49.5, 4.0], [50.8, 4.0], [50.8, 1.0]],
            'Centre-Val de Loire': [[46.5, 0.0], [46.5, 3.0], [48.0, 3.0], [48.0, 0.0]],
            'Bourgogne-Franche-Comté': [[46.0, 4.0], [46.0, 7.0], [48.0, 7.0], [48.0, 4.0]],
            'Corse': [[41.3, 8.0], [41.3, 9.6], [43.0, 9.6], [43.0, 8.0]]
        };
        
        regions.forEach(region => {
            if (regionPolygons[region.name]) {
                const polygon = L.polygon(regionPolygons[region.name], {
                    color: '#c9a86c',
                    weight: 1,
                    opacity: 0.5,
                    fillOpacity: 0.1,
                    fillColor: '#c9a86c'
                });
                
                // Add hover effect
                polygon.on('mouseover', () => {
                    polygon.setStyle({
                        color: '#c9a86c',
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.2
                    });
                });
                
                polygon.on('mouseout', () => {
                    polygon.setStyle({
                        color: '#c9a86c',
                        weight: 1,
                        opacity: 0.5,
                        fillOpacity: 0.1
                    });
                });
                
                // Add click to zoom to region
                polygon.on('click', () => {
                    const coords = region.coordinates || [46.6034, 1.8883];
                    const zoom = region.zoom || 7;
                    this.map.setView(coords, zoom);
                });
                
                polygon.addTo(this.map);
                this.regionLayers.push(polygon);
            }
        });
    },
    
    // Add camping markers
    addCampingMarkers(campings) {
        // Clear existing markers
        this.clearMarkers();
        
        this.markers = [];
        
        campings.forEach(camping => {
            if (camping.latitude && camping.longitude) {
                const marker = this.createCampingMarker(camping);
                this.markers.push(marker);
            }
        });
        
        // Create marker cluster group
        if (this.markers.length > 0) {
            const markers = L.featureGroup(this.markers);
            this.map.addLayer(markers);
        }
    },
    
    // Create individual camping marker
    createCampingMarker(camping) {
        const iconUrl = camping.available 
            ? 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-green.png' 
            : 'https://cdn.jsdelivr.net/gh/pointhi/leaflet-color-markers@master/img/marker-icon-2x-grey.png';
        
        const icon = L.icon({
            iconUrl: iconUrl,
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            shadowSize: [41, 41]
        });
        
        const marker = L.marker([camping.latitude, camping.longitude], {
            icon: icon,
            title: camping.title
        });
        
        // Add popup
        const popupContent = this.createPopupContent(camping);
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'camping-popup'
        });
        
        // Add click handler for detail page
        marker.on('click', () => {
            window.location.href = `camping.html?id=${camping.id}`;
        });
        
        return marker;
    },
    
    // Create popup content
    createPopupContent(camping) {
        const price = new Intl.NumberFormat('nl-NL', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0
        }).format(camping.price);
        
        const rating = camping.rating ? `⭐ ${camping.rating}/5 (${camping.reviews} reviews)` : '';
        
        return `
            <div class="popup-content">
                <div class="popup-header">
                    <h4>${camping.title}</h4>
                    <span class="popup-badge ${camping.available ? 'available' : 'sold'}">
                        ${camping.available ? 'Beschikbaar' : 'Verkocht'}
                    </span>
                </div>
                <div class="popup-body">
                    <p class="popup-location">
                        <i class="fas fa-map-marker-alt"></i> ${camping.city}, ${camping.department}
                    </p>
                    <p class="popup-price">${price}</p>
                    <p class="popup-features">
                        <i class="fas fa-cube"></i> ${camping.num_pitches} plaatsen |
                        <i class="fas fa-home"></i> ${camping.num_gites} gîtes
                    </p>
                    ${rating ? `<p class="popup-rating">${rating}</p>` : ''}
                </div>
                <div class="popup-footer">
                    <a href="camping.html?id=${camping.id}" class="popup-link">
                        <i class="fas fa-info-circle"></i> Meer informatie
                    </a>
                </div>
            </div>
        `;
    },
    
    // Clear all markers
    clearMarkers() {
        this.markers.forEach(marker => {
            if (this.map && this.map.hasLayer(marker)) {
                this.map.removeLayer(marker);
            }
        });
        this.markers = [];
    },
    
    // Update markers based on filtered campings
    updateMarkers(campings) {
        this.addCampingMarkers(campings);
        
        // Fit map to show all markers if there are any
        if (campings.length > 0 && campings.length <= 20) {
            const bounds = L.latLngBounds(
                campings.map(c => [c.latitude, c.longitude])
            );
            this.map.fitBounds(bounds, { padding: [50, 50, 50, 50] });
        } else {
            // Reset to France view
            this.map.fitBounds(this.franceBounds);
        }
    },
    
    // Filter markers by region
    filterByRegion(regionName) {
        if (!regionName) {
            // Show all markers
            this.updateMarkers(InterFranceData.campings);
            this.map.fitBounds(this.franceBounds);
            return;
        }
        
        const filtered = InterFranceData.getCampingsByRegion(regionName);
        this.updateMarkers(filtered);
        
        // Zoom to region
        const coords = InterFranceData.getRegionCoordinates(regionName);
        const zoom = InterFranceData.getRegionZoom(regionName);
        this.map.setView(coords, zoom);
    },
    
    // Add custom CSS for popups
    addPopupStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .camping-popup {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            .popup-content {
                padding: 10px;
            }
            .popup-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .popup-header h4 {
                margin: 0;
                font-size: 16px;
                color: #1a365d;
            }
            .popup-badge {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: 600;
            }
            .popup-badge.available {
                background-color: #2d8f5f;
                color: white;
            }
            .popup-badge.sold {
                background-color: #999;
                color: white;
            }
            .popup-location {
                margin: 5px 0;
                font-size: 13px;
                color: #666;
            }
            .popup-price {
                font-size: 16px;
                font-weight: 700;
                color: #c9a86c;
                margin: 5px 0;
            }
            .popup-features {
                font-size: 12px;
                color: #666;
                margin: 5px 0;
            }
            .popup-rating {
                font-size: 12px;
                color: #f7b733;
                margin: 5px 0;
            }
            .popup-footer {
                margin-top: 10px;
                padding-top: 10px;
                border-top: 1px solid #eee;
            }
            .popup-link {
                display: inline-block;
                color: #1a365d;
                text-decoration: none;
                font-size: 13px;
                font-weight: 500;
            }
            .popup-link:hover {
                color: #0f213a;
                text-decoration: underline;
            }
        `;
        document.head.appendChild(style);
    },
    
    // Initialize when data is loaded
    initOnDataLoad(mapId) {
        document.addEventListener('interFranceDataLoaded', () => {
            this.init(mapId, InterFranceData.campings, InterFranceData.regions);
            this.addPopupStyles();
        });
    }
};

// Initialize map when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        const mapElements = document.querySelectorAll('.map-leaflet');
        mapElements.forEach(mapEl => {
            const mapId = mapEl.id;
            if (mapId) {
                InterFranceMap.initOnDataLoad(mapId);
            }
        });
    });
} else {
    const mapElements = document.querySelectorAll('.map-leaflet');
    mapElements.forEach(mapEl => {
        const mapId = mapEl.id;
        if (mapId) {
            InterFranceMap.initOnDataLoad(mapId);
        }
    });
}
