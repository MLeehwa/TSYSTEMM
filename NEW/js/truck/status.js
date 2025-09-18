// Truck Status Module
console.log('🚛 Truck Status module loaded');

// Global variables - ensure they're properly initialized
if (typeof window.refreshCountdown === 'undefined') {
    window.refreshCountdown = 30;
}
if (typeof window.refreshInterval === 'undefined') {
    window.refreshInterval = null;
}

// Check if functions already exist to prevent duplicate declarations
if (typeof window.initializeTruckStatus === 'undefined') {

// Initialize truck status page
function initializeTruckStatus() {
    console.log('🚛 Initializing truck status page...');
    
    // Clear any existing intervals to prevent duplicates
    if (window.refreshInterval) {
        clearInterval(window.refreshInterval);
        window.refreshInterval = null;
    }
    
    // Reset countdown
    window.refreshCountdown = 30;
    
    // Wait for DOM elements to be available with multiple retry strategies
    const waitForElements = (retryCount = 0) => {
        const dateSelector = document.getElementById('dateSelector');
        const statusTableBody = document.getElementById('statusTableBody');
        const refreshTimer = document.getElementById('refreshTimer');
        
        console.log(`🔍 Attempt ${retryCount + 1}: Looking for DOM elements...`);
        console.log('🔍 dateSelector:', dateSelector);
        console.log('🔍 statusTableBody:', statusTableBody);
        console.log('🔍 refreshTimer:', refreshTimer);
        
        if (!dateSelector || !statusTableBody || !refreshTimer) {
            if (retryCount < 20) { // Maximum 20 retries (2 seconds)
                console.log(`⚠️ Waiting for DOM elements to load... (retry ${retryCount + 1}/20)`);
                setTimeout(() => waitForElements(retryCount + 1), 100);
                return;
            } else {
                console.error('❌ Failed to find DOM elements after maximum retries');
                // Try to create elements if they don't exist
                createMissingElements();
                return;
            }
        }
        
        console.log('✅ All DOM elements found, proceeding with initialization');
        
        // Set default date to today
        dateSelector.value = new Date().toISOString().split('T')[0];
        
        // Load initial data
        loadTruckStatus();
        
        // Start auto-refresh
        startAutoRefresh();
        
        // Setup event listeners
        setupTruckStatusEventListeners();
        
        // Check sidebar state
        checkSidebarState();
        
        console.log('✅ Truck status page initialized');
    };
    
    // Start waiting for elements
    waitForElements();
}

// Create missing elements if they don't exist
function createMissingElements() {
    console.log('🔧 Attempting to create missing elements...');
    
    // Try to find the main container
    let container = document.querySelector('.truck-status-page');
    if (!container) {
        console.error('❌ Main container not found, cannot create elements');
        return;
    }
    
    // Create date selector if missing
    if (!document.getElementById('dateSelector')) {
        console.log('🔧 Creating date selector...');
        const dateSelectorDiv = document.querySelector('.date-selector');
        if (dateSelectorDiv) {
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.id = 'dateSelector';
            dateInput.onchange = loadTruckStatus;
            dateSelectorDiv.appendChild(dateInput);
        }
    }
    
    // Create status table body if missing
    if (!document.getElementById('statusTableBody')) {
        console.log('🔧 Creating status table body...');
        const table = container.querySelector('table tbody');
        if (table) {
            table.id = 'statusTableBody';
        }
    }
    
    // Create refresh timer if missing
    if (!document.getElementById('refreshTimer')) {
        console.log('🔧 Creating refresh timer...');
        const autoRefreshDiv = container.querySelector('.auto-refresh');
        if (autoRefreshDiv) {
            const timerSpan = document.createElement('span');
            timerSpan.id = 'refreshTimer';
            timerSpan.textContent = '30';
            autoRefreshDiv.appendChild(timerSpan);
        }
    }
    
    // Try initialization again
    setTimeout(() => {
        const dateSelector = document.getElementById('dateSelector');
        const statusTableBody = document.getElementById('statusTableBody');
        const refreshTimer = document.getElementById('refreshTimer');
        
        if (dateSelector && statusTableBody && refreshTimer) {
            console.log('✅ Elements created successfully, initializing...');
            initializeTruckStatus();
        } else {
            console.error('❌ Still missing elements after creation attempt');
        }
    }, 100);
}

// Start auto-refresh timer
function startAutoRefresh() {
    const intervalId = setInterval(() => {
        window.refreshCountdown--;
        const refreshTimer = document.getElementById('refreshTimer');
        if (refreshTimer) {
            refreshTimer.textContent = window.refreshCountdown;
        } else {
            console.warn('⚠️ Refresh timer element not found');
        }
        
        if (window.refreshCountdown <= 0) {
            loadTruckStatus();
            window.refreshCountdown = 30;
        }
    }, 1000);
    
    // Register interval for cleanup
    if (typeof window.registerInterval === 'function') {
        window.registerInterval(intervalId);
    }
    
    window.refreshInterval = intervalId;
}

// Load truck status data
async function loadTruckStatus() {
    const dateSelector = document.getElementById('dateSelector');
    if (!dateSelector) {
        console.error('❌ Date selector element not found');
        return;
    }
    
    const selectedDate = dateSelector.value;
    if (!selectedDate) {
        console.warn('⚠️ No date selected');
        return;
    }
    
    console.log('📊 Loading truck status for date:', selectedDate);
    
    // Show loading state
    showLoadingState();
    
    try {
        // Check if Supabase is available
        if (typeof sb === 'undefined') {
            throw new Error('Supabase connection not available');
        }
        
        // Query truck management data from database
        const { data, error } = await sb
            .from('vwtm_truck_management')
            .select('*')
            .order('departure_date', { ascending: false })
            .order('departure_time', { ascending: true });
        
        if (error) {
            throw error;
        }
        
        if (!data || data.length === 0) {
            showNoDataMessage();
            return;
        }
        
        // Transform database data to display format
        const sampleData = data.map(item => ({
            etdTime: item.departure_time,
            destination: item.destination,
            deliveryNo: item.delivery_no,
            truck: item.truck_id,
            forzaId: item.forza_id,
            parts: item.parts,
            status: item.status
        }));
        
        // Sort data: completed items go to bottom, others sorted by ETD time
        const sortedData = sortTruckData(sampleData);
        
        displayTruckStatus(sortedData);
        
        hideLoadingState();
    } catch (error) {
        console.error('❌ 데이터 로딩 실패:', error);
        showErrorMessage('데이터를 불러오는데 실패했습니다: ' + error.message);
        hideLoadingState();
    }
}

// Show loading state
function showLoadingState() {
    const tableBody = document.getElementById('statusTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">🔄 Loading truck status...</td>
            </tr>
        `;
    } else {
        console.warn('⚠️ Status table body not found');
        // Try to find the element again after a short delay
        setTimeout(() => {
            const retryTableBody = document.getElementById('statusTableBody');
            if (retryTableBody) {
                retryTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="no-data">🔄 Loading truck status...</td>
                    </tr>
                `;
            }
        }, 100);
    }
}

// Display truck status data
function displayTruckStatus(data) {
    const tableBody = document.getElementById('statusTableBody');
    if (!tableBody) {
        console.error('❌ Status table body not found');
        return;
    }
    
    if (!data || data.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">No truck data found for selected date</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = data.map(item => {
        const isShipped = item.status.toLowerCase() === 'shipped';
        const rowClass = isShipped ? 'row-shipped' : '';
        return `
            <tr class="${rowClass}">
                <td><strong>${item.etdTime}</strong></td>
                <td>${item.destination}</td>
                <td><strong>${item.deliveryNo}</strong></td>
                <td>${item.truck}</td>
                <td>${item.forzaId}</td>
                <td>${item.parts}</td>
                <td><span class="status-badge status-${getStatusClass(item.status)}">${item.status}</span></td>
            </tr>
        `;
    }).join('');
    
    console.log(`✅ Displayed ${data.length} truck status records`);
}

// Get CSS class for status badge
function getStatusClass(status) {
    switch(status.toUpperCase()) {
        case 'DEPARTED': return 'departed';
        case 'ARRIVED': return 'arrived';
        case 'SCHEDULED': return 'scheduled';
        case 'ON SITE': return 'onsite';
        case 'SHIPPED': return 'shipped';
        default: return 'scheduled';
    }
}

// Sidebar toggle function
function toggleSidebar() {
    const toggleIcon = document.getElementById('toggleIcon');
    let sidebar = null;
    
    // Try multiple selectors to find sidebar
    const selectors = [
        '.sidebar',
        '#sidebar',
        '.side-nav',
        '.navigation',
        '.nav-sidebar',
        '.left-panel'
    ];
    
    // Try to find sidebar in parent document first (when loaded in iframe)
    try {
        if (window.parent && window.parent.document) {
            for (let selector of selectors) {
                sidebar = window.parent.document.querySelector(selector);
                if (sidebar) break;
            }
        }
    } catch (e) {
        console.log('Cross-origin error, trying local document');
    }
    
    // If not found in parent, try current document
    if (!sidebar) {
        for (let selector of selectors) {
            sidebar = document.querySelector(selector);
            if (sidebar) break;
        }
    }
    
    if (sidebar) {
        const currentDisplay = sidebar.style.display;
        const computedStyle = window.getComputedStyle(sidebar);
        const isVisible = currentDisplay !== 'none' && computedStyle.display !== 'none';
        
        if (isVisible) {
            sidebar.style.display = 'none';
            toggleIcon.textContent = '▶';
            toggleIcon.title = '사이드바 보이기';
            console.log('Sidebar hidden');
            
            // Store state in localStorage
            localStorage.setItem('sidebarHidden', 'true');
        } else {
            sidebar.style.display = 'block';
            toggleIcon.textContent = '◀';
            toggleIcon.title = '사이드바 숨기기';
            console.log('Sidebar shown');
            
            // Remove state from localStorage
            localStorage.removeItem('sidebarHidden');
        }
    } else {
        console.log('Sidebar not found with any selector');
        // Show feedback to user
        toggleIcon.textContent = '❌';
        toggleIcon.title = '사이드바를 찾을 수 없습니다';
        setTimeout(() => {
            toggleIcon.textContent = '◀';
            toggleIcon.title = '사이드바 토글';
        }, 2000);
    }
}

// Check sidebar state on page load
function checkSidebarState() {
    const toggleIcon = document.getElementById('toggleIcon');
    if (toggleIcon) {
        const isHidden = localStorage.getItem('sidebarHidden') === 'true';
        if (isHidden) {
            toggleIcon.textContent = '▶';
            toggleIcon.title = '사이드바 보이기';
        } else {
            toggleIcon.textContent = '◀';
            toggleIcon.title = '사이드바 숨기기';
        }
    }
}

// Manual refresh function
function manualRefresh() {
    loadTruckStatus();
    window.refreshCountdown = 30;
}

// Setup event listeners
function setupTruckStatusEventListeners() {
    // Date selector change event
    const dateSelector = document.getElementById('dateSelector');
    if (dateSelector) {
        dateSelector.addEventListener('change', loadTruckStatus);
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'r' || e.key === 'R') {
            manualRefresh();
        }
    });
    
    console.log('✅ Truck status event listeners set up');
}

// Cleanup function
function cleanupTruckStatus() {
    if (window.refreshInterval) {
        clearInterval(window.refreshInterval);
        window.refreshInterval = null;
        console.log('🔄 Auto-refresh stopped');
    }
}

// Make functions globally accessible
window.initializeTruckStatus = initializeTruckStatus;
window.loadTruckStatus = loadTruckStatus;
window.toggleSidebar = toggleSidebar;
window.manualRefresh = manualRefresh;
window.setupTruckStatusEventListeners = setupTruckStatusEventListeners;
window.cleanupTruckStatus = cleanupTruckStatus;
window.checkSidebarState = checkSidebarState;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeTruckStatus);
} else {
    initializeTruckStatus();
}

// Also listen for page visibility changes to handle page re-entry
document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
        console.log('🚛 Page became visible, re-initializing truck status...');
        // Small delay to ensure DOM is ready
        setTimeout(initializeTruckStatus, 100);
    }
});

// Listen for navigation events (for SPA-like behavior)
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log('🚛 Page restored from cache, re-initializing truck status...');
        setTimeout(initializeTruckStatus, 100);
    }
});

// Listen for custom navigation events
window.addEventListener('truckStatusPageLoaded', function() {
    console.log('🚛 Custom event: truck status page loaded, initializing...');
    setTimeout(initializeTruckStatus, 100);
});

// Force initialization after a delay as backup
setTimeout(() => {
    if (document.querySelector('.truck-status-page')) {
        console.log('🚛 Backup initialization after delay...');
        initializeTruckStatus();
    }
}, 500);

// Close the conditional check for function definitions
}

// Sort truck data: shipped items to bottom, others by ETD time
function sortTruckData(data) {
    // Separate shipped items from others
    const shippedItems = data.filter(item => 
        item.status.toLowerCase() === 'shipped' || 
        item.status.toLowerCase() === 'arrived'
    );
    
    const activeItems = data.filter(item => 
        item.status.toLowerCase() !== 'shipped' && 
        item.status.toLowerCase() !== 'arrived'
    );
    
    // Sort active items by ETD time
    activeItems.sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.etdTime}`);
        const timeB = new Date(`2000-01-01T${b.etdTime}`);
        return timeA - timeB;
    });
    
    // Sort shipped items by ETD time (most recent first)
    shippedItems.sort((a, b) => {
        const timeA = new Date(`2000-01-01T${a.etdTime}`);
        const timeB = new Date(`2000-01-01T${b.etdTime}`);
        return timeB - timeA;
    });
    
    // Return active items first, then shipped items
    return [...activeItems, ...shippedItems];
}

// Error handling functions
function showErrorMessage(message) {
    const tableBody = document.getElementById('statusTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data error-message">❌ ${message}</td>
            </tr>
        `;
    }
    console.error('❌ Error:', message);
}

function showNoDataMessage() {
    const tableBody = document.getElementById('statusTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="no-data">📭 선택된 날짜에 데이터가 없습니다</td>
            </tr>
        `;
    }
}

function hideLoadingState() {
    // Loading state is automatically hidden when data is displayed
    // This function is called after data loading is complete
    console.log('✅ Loading state hidden');
}
