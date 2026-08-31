// ============================================
// Inter-France - Contact Page JavaScript
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initContactPage);
} else {
    initContactPage();
}

function initContactPage() {
    // Initialize modules
    initContactForm();
    initContactMap();
    initFooterRegions();
    
    // Listen for data load event
    document.addEventListener('interFranceDataLoaded', () => {
        initFooterRegions();
    });
}

// ============================================
// Contact Form
// ============================================

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        // Validate
        if (!validateContactForm(data)) {
            alert('Vul alle verplichte velden in.');
            return;
        }
        
        // Show loading state
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verzenden...';
        
        // Simulate form submission (in real implementation, send to server)
        setTimeout(() => {
            // Show success message
            alert('Bedankt voor uw bericht! Wij nemen zo snel mogelijk contact met u op.');
            
            // Reset form
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Verzenden';
        }, 1500);
    });
}

function validateContactForm(data) {
    const requiredFields = ['name', 'email', 'subject', 'message', 'privacy'];
    return requiredFields.every(field => data[field] && data[field].trim() !== '');
}

// ============================================
// Contact Map
// ============================================

function initContactMap() {
    const contactMap = document.getElementById('contactMap');
    if (!contactMap) return;
    
    // Check if map already initialized
    if (contactMap.hasChildNodes() && contactMap.querySelector('.leaflet-container')) {
        return;
    }
    
    // Initialize map centered on Amsterdam
    const map = L.map(contactMap, {
        center: [52.3667, 4.8945], // Amsterdam coordinates
        zoom: 12,
        scrollWheelZoom: true,
        zoomControl: true
    });
    
    // Add OpenStreetMap base layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    // Add marker for office location
    L.marker([52.3667, 4.8945], {
        title: 'Inter-France - Amsterdam'
    }).addTo(map)
    .bindPopup('<b>Inter-France</b><br>Keizersgracht 123<br>1015 AC Amsterdam<br>Nederland');
    
    // Add zoom control
    L.control.zoom({
        position: 'topright'
    }).addTo(map);
    
    // Add scale control
    L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
    }).addTo(map);
    
    // Add custom attribution
    const attribution = L.control.attribution({
        position: 'bottomright'
    });
    attribution.addAttribution('<a href="https://inter-france.nl">Inter-France</a>');
    attribution.addTo(map);
}

// ============================================
// Footer Regions
// ============================================

function initFooterRegions() {
    const footerLinks = [
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
