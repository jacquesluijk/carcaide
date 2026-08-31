// ============================================
// Inter-France - Admin JavaScript
// ============================================

// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAdmin);
} else {
    initAdmin();
}

function initAdmin() {
    // Initialize modules
    initDashboard();
    initModal();
    initSidebarNavigation();
    
    // Load data
    if (typeof InterFranceData !== 'undefined') {
        document.addEventListener('interFranceDataLoaded', function() {
            updateDashboardStats();
        });
    }
}

// ============================================
// Dashboard
// ============================================

function initDashboard() {
    // Update stats when data is loaded
    if (typeof InterFranceData !== 'undefined' && InterFranceData.campings.length > 0) {
        updateDashboardStats();
    }
}

function updateDashboardStats() {
    const totalCampingsEl = document.getElementById('totalCampings');
    const availableCampingsEl = document.getElementById('availableCampings');
    const soldCampingsEl = document.getElementById('soldCampings');
    const newLeadsEl = document.getElementById('newLeads');
    const totalViewsEl = document.getElementById('totalViews');
    
    if (!totalCampingsEl) return;
    
    // Calculate stats
    const totalCampings = InterFranceData.campings.length;
    const availableCampings = InterFranceData.campings.filter(c => c.available).length;
    const soldCampings = totalCampings - availableCampings;
    
    // Update elements
    if (totalCampingsEl) totalCampingsEl.textContent = totalCampings;
    if (availableCampingsEl) availableCampingsEl.textContent = availableCampings;
    if (soldCampingsEl) soldCampingsEl.textContent = soldCampings;
    
    // Mock data for leads and views (in real implementation, this would come from analytics)
    if (newLeadsEl) newLeadsEl.textContent = Math.floor(Math.random() * 10) + 1;
    if (totalViewsEl) totalViewsEl.textContent = Math.floor(Math.random() * 1000) + 500;
}

// ============================================
// Modal
// ============================================

function initModal() {
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    
    if (!modal || !modalClose) return;
    
    // Close modal on button click
    modalClose.addEventListener('click', function() {
        closeModal();
    });
    
    // Close modal on background click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    // Close modal on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openModal(title, content, footerButtons = []) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const modalFooter = document.getElementById('modalFooter');
    
    if (!modal || !modalTitle || !modalBody || !modalFooter) return;
    
    // Set content
    modalTitle.textContent = title;
    modalBody.innerHTML = content;
    
    // Set footer buttons
    modalFooter.innerHTML = '';
    footerButtons.forEach(button => {
        const btn = document.createElement('button');
        btn.className = `btn btn-${button.type || 'secondary'}`;
        btn.innerHTML = button.text;
        if (button.onclick) {
            btn.addEventListener('click', button.onclick);
        }
        modalFooter.appendChild(btn);
    });
    
    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// Sidebar Navigation
// ============================================

function initSidebarNavigation() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar-nav a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            // Remove active class from all links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            // Add active class to clicked link
            this.classList.add('active');
        });
    });
}

// ============================================
// Utility Functions
// ============================================

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('nl-NL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(date);
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('nl-NL', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0
    }).format(price);
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#2d8f5f' : type === 'error' ? '#d64045' : '#1a365d'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// ============================================
// Export for use in other scripts
// ============================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openModal,
        closeModal,
        formatDate,
        formatPrice,
        showNotification
    };
}
