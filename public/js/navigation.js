// Enhanced Navigation System with Robust Script Management
console.log('🧭 Enhanced Navigation System Initializing...');

// Global script registry to prevent duplicates
window.scriptRegistry = {
  loaded: new Set(),
  instances: new Map(),
  intervals: new Set()
};

// Enhanced script loader with duplicate prevention
function loadScript(src, options = {}) {
  return new Promise((resolve, reject) => {
    const scriptId = src.replace(/[^a-zA-Z0-9]/g, '_');
    
    // Check if script is already loaded
    if (window.scriptRegistry.loaded.has(scriptId)) {
      console.log(`📜 Script already loaded: ${src}`);
      
      // If force reload is requested, remove existing script
      if (options.forceReload) {
        const existingScript = document.querySelector(`script[data-script-id="${scriptId}"]`);
        if (existingScript) {
          existingScript.remove();
          window.scriptRegistry.loaded.delete(scriptId);
          console.log(`🔄 Force reloading script: ${src}`);
        }
      } else {
        resolve();
        return;
      }
    }
    
    // Create new script element
    const script = document.createElement('script');
    script.src = src;
    script.setAttribute('data-script-id', scriptId);
    
    script.onload = () => {
      console.log(`✅ Script loaded successfully: ${src}`);
      window.scriptRegistry.loaded.add(scriptId);
      resolve();
    };
    
    script.onerror = (error) => {
      console.error(`❌ Failed to load script: ${src}`, error);
      reject(error);
    };
    
    document.body.appendChild(script);
  });
}

// Comprehensive global state cleanup
function cleanupGlobalState() {
  console.log('🧹 Starting comprehensive global state cleanup...');
  
  // Clear all registered intervals
  window.scriptRegistry.intervals.forEach(intervalId => {
    try {
      clearInterval(intervalId);
      console.log(`🔄 Cleared interval: ${intervalId}`);
    } catch (e) {
      console.log(`⚠️ Error clearing interval: ${intervalId}:`, e);
    }
  });
  window.scriptRegistry.intervals.clear();
  
  // Clear all known intervals
  for (let i = 1; i < 1000; i++) {
    try {
      clearInterval(i);
    } catch (e) {
      // Ignore errors for non-existent intervals
    }
  }
  
  // Clear all known timeouts
  for (let i = 1; i < 1000; i++) {
    try {
      clearTimeout(i);
    } catch (e) {
      // Ignore errors for non-existent timeouts
    }
  }
  
  // Clear specific global variables
  const globalVars = [
    'refreshInterval', 'refreshCountdown', 'truckSystem', 'allData', 
    'filteredData', 'currentSortColumn', 'currentSortDirection', 
    'analysisNewInitialized', 'truckManagementLoaded', 'truckStatusLoaded'
  ];
  
  globalVars.forEach(varName => {
    if (window[varName] !== undefined) {
      if (typeof window[varName] === 'object' && window[varName] !== null) {
        // Special handling for objects with destroy methods
        if (window[varName].destroy && typeof window[varName].destroy === 'function') {
          try {
            window[varName].destroy();
            console.log(`🗑️ Destroyed object: ${varName}`);
          } catch (e) {
            console.log(`⚠️ Error destroying ${varName}:`, e);
          }
        }
      }
      delete window[varName];
      console.log(`🗑️ Cleared global variable: ${varName}`);
    }
  });
  
  // Clear script registry instances
  window.scriptRegistry.instances.clear();
  
  console.log('✅ Global state cleanup completed');
}

// Enhanced page loader with proper cleanup
function loadPage(path) {
  console.log('🔄 Loading page:', path);
  
  // Clean up before loading new page
  cleanupGlobalState();
  
  fetch(path)
    .then(res => res.text())
    .then(html => {
      // Update main content
      document.getElementById('mainContent').innerHTML = html;
      
      // Execute inline scripts with error handling
      setTimeout(() => {
        const scripts = document.querySelectorAll('#mainContent script');
        scripts.forEach(script => {
          if (script.textContent && !script.src) {
            try {
              // Wrap in function to prevent global scope pollution
              const scriptFunction = new Function(script.textContent);
              scriptFunction();
            } catch (error) {
              console.error('❌ Error executing inline script:', error);
            }
          }
        });
        
        // Set appropriate layout mode for different pages
        if (path.includes('status.html')) {
          // STATUS 페이지는 전체 화면 모드
          document.body.classList.add('fullscreen-mode');
          console.log('🚛 Fullscreen mode enabled for STATUS page');
        } else {
          // 다른 페이지들은 일반 모드 (사이드바 표시)
          document.body.classList.remove('fullscreen-mode');
          console.log('📱 Normal layout mode for other pages - sidebar visible');
          
          // 사이드바가 항상 표시되도록 보장
          const sidebar = document.getElementById('mainSidebar');
          if (sidebar) {
            sidebar.style.display = 'block';
            sidebar.style.width = '16rem';
          }
        }
        
        // Load page-specific scripts
        if (path.includes('analysis') && !path.includes('packaging')) {
          loadScript('js/fifo/analysis-new.js').then(() => {
            console.log('✅ Analysis script loaded successfully');
            // ANALYSIS 페이지 초기화 함수 호출
            if (typeof window.initializeAnalysisSystem === 'function') {
              console.log('🔄 Initializing analysis system...');
              window.initializeAnalysisSystem();
            } else {
              console.log('⚠️ initializeAnalysisSystem function not found, waiting...');
              // 함수가 로드될 때까지 대기
              setTimeout(() => {
                if (typeof window.initializeAnalysisSystem === 'function') {
                  console.log('🔄 Initializing analysis system (delayed)...');
                  window.initializeAnalysisSystem();
                }
              }, 1000);
            }
          }).catch(error => {
            console.error('❌ Failed to load analysis script:', error);
          });
        } else if (path.includes('packaging-analysis-fixed.html')) {
          console.log('📦 Loading PACKAGING ANALYSIS FIXED page...');
          
          // Packaging Analysis Fixed 페이지는 독립적으로 실행되므로 특별한 처리가 필요 없음
          // 인라인 스크립트가 자동으로 실행됨
          console.log('✅ Packaging Analysis Fixed page loaded - inline scripts will execute automatically');
        } else if (path.includes('status.html')) {
          console.log('📡 Loading STATUS page...');
          
          // STATUS 페이지 전체 화면 모드 활성화
          document.body.classList.add('fullscreen-mode');
          console.log('🚛 Fullscreen mode enabled for STATUS page');
          
          // STATUS 페이지 초기화 함수 호출
          setTimeout(() => {
            if (typeof window.initializeStatusPage === 'function') {
              console.log('🔄 Initializing STATUS page...');
              window.initializeStatusPage();
            } else {
              console.log('⚠️ initializeStatusPage function not found, waiting...');
              // 함수가 로드될 때까지 대기
              setTimeout(() => {
                if (typeof window.initializeStatusPage === 'function') {
                  console.log('🔄 Initializing STATUS page (delayed)...');
                  window.initializeStatusPage();
                }
              }, 1000);
            }
          }, 100);
        }
        
        console.log('✅ Page loaded and scripts executed:', path);
      }, 100);
    })
    .catch(error => {
      console.error('❌ Error loading page:', error);
    });
}

// Centralized script loading logic
function loadPageScripts(path) {
  // This function is deprecated - use inline script loading in loadPage instead
  console.log('⚠️ loadPageScripts is deprecated - using inline loading');
}

// Force load page with complete cleanup (for sidebar navigation)
function forceLoadPage(path) {
  console.log('🔄 Force loading page:', path);
  
  // Complete cleanup of all global state
  cleanupGlobalState();
  
  // 사이드바가 항상 표시되도록 보장
  const sidebar = document.getElementById('mainSidebar');
  if (sidebar) {
    sidebar.style.display = 'block';
    sidebar.style.width = '16rem';
  }
  
  // Force reload the page
  loadPage(path);
}

// Utility function to register intervals for cleanup
function registerInterval(intervalId) {
  window.scriptRegistry.intervals.add(intervalId);
}

// Utility function to unregister intervals
function unregisterInterval(intervalId) {
  window.scriptRegistry.intervals.delete(intervalId);
}

// Initialize navigation system
document.addEventListener('DOMContentLoaded', function() {
  console.log('🧭 Enhanced Navigation System Ready');
  
  // Set up global error handler
  window.addEventListener('error', function(event) {
    console.error('🚨 Global error caught:', event.error || 'Unknown error');
    
    // If it's a duplicate declaration error, try to recover
    if (event.error && event.error.message && 
        event.error.message.includes('has already been declared')) {
      console.log('🔄 Attempting to recover from duplicate declaration error...');
      
      // Force cleanup and reload current page
      const currentPath = window.currentPagePath || 'pages/fifo/upload.html';
      setTimeout(() => {
        forceLoadPage(currentPath);
      }, 100);
    }
  });
});

// Export functions for global access
window.loadPage = loadPage;
window.forceLoadPage = forceLoadPage;
window.registerInterval = registerInterval;
window.unregisterInterval = unregisterInterval;
