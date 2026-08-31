// ============================================
// Inter-France - Verkopen Page JavaScript
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVerkopenPage);
} else {
    initVerkopenPage();
}

function initVerkopenPage() {
    // Initialize modules
    initSellForm();
    initFAQ();
    initPhotoUpload();
    
    // Populate region filters
    populateRegionFilters('sellRegion');
    
    // Listen for data load event
    document.addEventListener('interFranceDataLoaded', () => {
        populateRegionFilters('sellRegion');
    });
}

// ============================================
// Sell Form
// ============================================

function initSellForm() {
    const sellForm = document.getElementById('sellFormForm');
    if (!sellForm) return;
    
    // Populate region filter
    populateRegionFilters('sellRegion');
    
    // Add form submit handler
    sellForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(sellForm);
        const data = Object.fromEntries(formData);
        
        // Collect checkbox values
        const features = [];
        const featureCheckboxes = sellForm.querySelectorAll('input[name="features"]:checked');
        featureCheckboxes.forEach(cb => features.push(cb.value));
        data.features = features;
        
        // Validate
        if (!validateSellForm(data)) {
            alert('Vul alle verplichte velden in.');
            return;
        }
        
        // Show loading state
        const submitBtn = sellForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verzenden...';
        
        // Simulate form submission (in real implementation, send to server)
        setTimeout(() => {
            // Show success message
            alert('Bedankt voor uw aanvraag! Wij nemen binnen 24 uur contact met u op voor een vrijblijvende waardering.');
            
            // Reset form
            sellForm.reset();
            const photoPreview = document.getElementById('photoPreview');
            if (photoPreview) {
                photoPreview.innerHTML = '';
            }
            
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Verzenden';
            
            // Scroll to top of form
            sellForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 1500);
    });
}

function validateSellForm(data) {
    const requiredFields = [
        'name', 'email', 'phone', 'city', 'num_pitches', 
        'plot_size', 'price_expectation', 'available', 'description', 'privacy'
    ];
    
    // Check required fields
    for (const field of requiredFields) {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            return false;
        }
    }
    
    // Check if at least region or department is filled
    if (!data.region && !data.department) {
        return false;
    }
    
    return true;
}

// ============================================
// Photo Upload
// ============================================

function initPhotoUpload() {
    const photoInput = document.getElementById('sellPhotos');
    const photoPreview = document.getElementById('photoPreview');
    
    if (!photoInput || !photoPreview) return;
    
    photoInput.addEventListener('change', function(e) {
        const files = Array.from(e.target.files);
        
        // Limit to 20 photos
        if (files.length > 20) {
            alert('U kunt maximaal 20 foto\'s uploaden.');
            files.splice(20);
        }
        
        // Clear preview
        photoPreview.innerHTML = '';
        
        // Show preview for each file
        files.forEach(file => {
            if (!file.type.match('image.*')) return;
            
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.alt = file.name;
                photoPreview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    });
}

// ============================================
// FAQ
// ============================================

function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        if (!question || !answer || !icon) return;
        
        question.addEventListener('click', function() {
            // Toggle active class
            item.classList.toggle('active');
            
            // Rotate icon
            if (item.classList.contains('active')) {
                icon.style.transform = 'rotate(180deg)';
            } else {
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
}

// ============================================
// Utility Functions
// ============================================

// Update department filter based on region selection
function updateDepartmentFilter(regionName, departmentSelectId = 'sellDepartment') {
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

// Listen for region change in sell form
function setupRegionListener() {
    const regionSelect = document.getElementById('sellRegion');
    if (!regionSelect) return;
    
    regionSelect.addEventListener('change', function() {
        updateDepartmentFilter(this.value, 'sellDepartment');
    });
}

// Initialize when data is loaded
if (typeof InterFranceData !== 'undefined') {
    document.addEventListener('interFranceDataLoaded', () => {
        setupRegionListener();
    });
}

// Call setup function
setupRegionListener();
