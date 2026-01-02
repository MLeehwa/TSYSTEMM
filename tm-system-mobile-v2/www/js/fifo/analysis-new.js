// Global variables - check if already exists to prevent conflicts
if (typeof window.allData === 'undefined') {
  window.allData = [];
}
if (typeof window.filteredData === 'undefined') {
  window.filteredData = [];
}
if (typeof window.currentSortColumn === 'undefined') {
  window.currentSortColumn = 'palletNo';  // 기본 정렬 컬럼 설정
}
if (typeof window.currentSortDirection === 'undefined') {
  window.currentSortDirection = 'asc';
}
if (typeof window.lastAnalysisResults === 'undefined') {
  window.lastAnalysisResults = [];  // 마지막 분석 결과 저장
}

// Initialize the analysis system
function initializeAnalysisSystem() {
  try {
    console.log('🚀 initializeAnalysisSystem called');
    
    // Clean up any existing state to prevent conflicts
    if (window.analysisNewInitialized && window.analysisNewInitialized.executed) {
      console.log('🧹 Cleaning up previous analysis state...');
      cleanupAnalysisState();
    }

    // Set initialization flag
    if (!window.analysisNewInitialized) {
      window.analysisNewInitialized = {};
    }
    window.analysisNewInitialized.executed = true;
    window.analysisNewInitialized.timestamp = Date.now();
    
    console.log('✅ Analysis system initialized at:', new Date().toISOString());
    
    // Start the analysis system immediately
    console.log('⏰ Starting analysis system...');
    initializeAdvancedAnalysis();
    
  } catch (error) {
    console.error('❌ Error initializing analysis system:', error);
  }
}

// Clean up analysis state to prevent conflicts
function cleanupAnalysisState() {
  try {
    console.log('🧹 Cleaning up analysis state...');
    
    // Clear any existing intervals or timeouts
    if (window.analysisRefreshInterval) {
      clearInterval(window.analysisRefreshInterval);
      delete window.analysisRefreshInterval;
    }
    
    // Reset global variables
    window.allData = [];
    window.filteredData = [];
    window.currentSortColumn = 'palletNo';
    window.currentSortDirection = 'asc';
    window.lastAnalysisResults = [];
    
    // Clear any existing event listeners (if possible)
    const analysisButtons = document.querySelectorAll('[onclick*="performAnalysis"], [onclick*="exportAdvancedShippingPlan"]');
    analysisButtons.forEach(button => {
      button.onclick = null;
    });
    
    console.log('✅ Analysis state cleaned up');
  } catch (error) {
    console.error('⚠️ Error during cleanup:', error);
  }
}

// Call initialization function
console.log('📜 analysis-new.js 파일이 로드되었습니다!');
initializeAnalysisSystem();

// Make all functions globally accessible
window.initializeAdvancedAnalysis = initializeAdvancedAnalysis;
window.initializeAnalysisSystem = initializeAnalysisSystem;
window.cleanupAnalysisState = cleanupAnalysisState;
window.setupEventListeners = setupEventListeners;
window.loadAnalysisData = loadAnalysisData;
window.showLoadingProgress = showLoadingProgress;
window.hideLoadingProgress = hideLoadingProgress;
window.updateLoadingProgress = updateLoadingProgress;
window.updateFilterStatusLoading = updateFilterStatusLoading;
window.updateFilterStatusError = updateFilterStatusError;
window.updateFilterStatusWarning = updateFilterStatusWarning;
window.populateFilterOptions = populateFilterOptions;
window.updateFilterStatus = updateFilterStatus;
window.updateFilterStatusDisplay = updateFilterStatusDisplay;
window.applyFilter = applyFilter;
window.resetFilter = resetFilter;
window.performAnalysis = performAnalysis;
window.displayResults = displayResults;
window.updateSummary = updateSummary;
window.exportAdvancedShippingPlan = exportAdvancedShippingPlan;
window.analyzePalletsByTMCount = analyzePalletsByTMCount;
window.populateReadyToShipSheet = populateReadyToShipSheet;
window.populateTransferNeededSheet = populateTransferNeededSheet;
window.populateSummarySheet = populateSummarySheet;
window.populateDetailedDataSheet = populateDetailedDataSheet;
window.sortTable = sortTable;
window.updateSortIcons = updateSortIcons;
window.showFifoStatus = showStatus;

// Use global variables directly instead of creating local copies
// var allData = window.allData || [];
// var filteredData = window.filteredData || [];
// var currentSortColumn = window.currentSortColumn || '';
// var currentSortDirection = window.currentSortDirection || '';

// Initialize when page loads
function initializeAdvancedAnalysis() {
  try {
    console.log('🚀 initializeAdvancedAnalysis called');
    
    // Remove the blocking logic - always continue
    console.log('🚀 Advanced Analysis page loaded');
    
    // Check if Supabase is ready
    const supabaseClient = window.sb || window.supabase;
    console.log('🔍 Supabase client check in init:', {
      windowSb: !!window.sb,
      windowSupabase: !!window.supabase,
      supabaseClient: !!supabaseClient,
      hasFromMethod: supabaseClient && typeof supabaseClient.from === 'function'
    });
    
    if (supabaseClient && typeof supabaseClient.from === 'function') {
      console.log('✅ Supabase client ready, setting up event listeners...');
      setupEventListeners();
      loadAnalysisData();
    } else {
      console.log('⏳ Supabase client not ready, waiting...');
      // Wait for Supabase to be ready
      setTimeout(() => {
        console.log('🔄 Retrying Supabase connection...');
        initializeAdvancedAnalysis();
      }, 1000);
    }
    
  } catch (error) {
    console.error('❌ Error in initializeAdvancedAnalysis:', error);
  }
}

// Setup event listeners for the analysis page
function setupEventListeners() {
  try {
    console.log('🔧 Setting up event listeners...');
    
    // Apply filter button
    const applyFilterBtn = document.getElementById('applyFilterBtn');
    if (applyFilterBtn) {
      applyFilterBtn.addEventListener('click', applyFilter);
      console.log('✅ Apply filter button listener added');
    }
    
    // Reset filter button
    const resetFilterBtn = document.getElementById('resetFilterBtn');
    if (resetFilterBtn) {
      resetFilterBtn.addEventListener('click', resetFilter);
      console.log('✅ Reset filter button listener added');
    }
    
    // Export Excel button
    const exportExcelBtn = document.getElementById('exportExcelBtn');
    if (exportExcelBtn) {
      exportExcelBtn.addEventListener('click', exportAdvancedShippingPlan);
      console.log('✅ Export Excel button listener added');
    }
    
    // Refresh data button
    const refreshDataBtn = document.getElementById('refreshDataBtn');
    if (refreshDataBtn) {
      refreshDataBtn.addEventListener('click', loadAnalysisData);
      console.log('✅ Refresh data button listener added');
    }
    
    // Filter change events
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
      locationFilter.addEventListener('change', () => {
        updateFilterStatus();
        // 필터 변경 시 자동으로 분석 실행
        setTimeout(() => {
          applyFilter();
        }, 100);
      });
      console.log('✅ Location filter change listener added');
    }
    
    const partNoFilter = document.getElementById('partNoFilter');
    if (partNoFilter) {
      partNoFilter.addEventListener('change', () => {
        updateFilterStatus();
        // 필터 변경 시 자동으로 분석 실행
        setTimeout(() => {
          applyFilter();
        }, 100);
      });
      console.log('✅ Part No filter change listener added');
    }
    
    const holdWhetherFilter = document.getElementById('holdWhetherFilter');
    if (holdWhetherFilter) {
      holdWhetherFilter.addEventListener('change', () => {
        updateFilterStatus();
        // 필터 변경 시 자동으로 분석 실행
        setTimeout(() => {
          applyFilter();
        }, 100);
      });
      console.log('✅ Hold Whether filter change listener added');
    }
    
    // 팔렛 수량 입력 필터
    const palletQuantityInput = document.getElementById('palletQuantityInput');
    if (palletQuantityInput) {
      palletQuantityInput.addEventListener('change', () => {
        updateFilterStatus();
        // 팔렛 수량 변경 시 자동으로 분석 실행
        setTimeout(() => {
          applyFilter();
        }, 100);
      });
      console.log('✅ Pallet quantity input change listener added');
    }
    
    console.log('✅ All event listeners set up successfully');
    
  } catch (error) {
    console.error('❌ Error setting up event listeners:', error);
  }
}

// Load analysis data from Supabase
async function loadAnalysisData() {
  try {
    console.log('📊 Loading analysis data...');
    showLoadingProgress();
    
    const supabaseClient = window.sb || window.supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not available');
    }
    
    // Get all data from the database with pagination to handle large datasets
    let allData = [];
    let hasMore = true;
    let page = 0;
    const pageSize = 1000; // Supabase default limit
    
    console.log('🔄 Starting data pagination...');
    
    while (hasMore) {
      const { data, error } = await supabaseClient
        .from('vwtm_list_data')
        .select('*')
        .order('upload_time', { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
      if (!data || data.length === 0) {
        hasMore = false;
        break;
      }
      
      allData = allData.concat(data);
      console.log(`📊 Page ${page + 1}: Loaded ${data.length} records (Total: ${allData.length})`);
      
      // If we got less than pageSize, we've reached the end
      if (data.length < pageSize) {
        hasMore = false;
      }
      
      page++;
      
      // Update progress for user
      const progressPercent = Math.round((allData.length / Math.max(allData.length, 1)) * 100);
      updateFilterStatusLoading(`Loading data... Page ${page + 1} (${allData.length} records loaded)`);
      
      // Add small delay to prevent overwhelming the UI
      if (page > 0) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    if (allData.length === 0) {
      console.log('📭 No data found in database');
      window.allData = [];
      window.filteredData = [];
      hideLoadingProgress();
      updateFilterStatus('No data available');
      return;
    }
    
    console.log(`✅ Total data loaded: ${allData.length} records from ${page} pages`);
    window.allData = allData;
    window.filteredData = [...allData];
    
    // Populate filter options
    populateFilterOptions();
    
    // Perform initial analysis with current filters
    console.log('🔄 Performing initial analysis with loaded data...');
    performAnalysis();
    
    hideLoadingProgress();
    updateFilterStatus(`Loaded ${allData.length} records from ${page} pages - Analysis completed`);
    
  } catch (error) {
    console.error('❌ Error loading analysis data:', error);
    hideLoadingProgress();
    updateFilterStatusError(`Failed to load data: ${error.message}`);
  }
}

// Show loading progress
function showLoadingProgress() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.classList.remove('hidden');
    
    // Add loading message
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
      loadingMessage.textContent = 'Loading data from database...';
    }
  }
}

// Hide loading progress
function hideLoadingProgress() {
  const loadingState = document.getElementById('loadingState');
  if (loadingState) {
    loadingState.classList.add('hidden');
    
    // Clear loading message
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
      loadingMessage.textContent = '';
    }
  }
}

// Update loading progress
function updateLoadingProgress(progress) {
  // Implementation for progress bar if needed
  console.log(`📊 Loading progress: ${progress}%`);
}

// Update filter status with loading message
function updateFilterStatusLoading(message) {
  updateFilterStatus(`⏳ ${message}`);
}

// Update filter status with error message
function updateFilterStatusError(message) {
  updateFilterStatus(`❌ ${message}`);
}

// Update filter status with warning message
function updateFilterStatusWarning(message) {
  updateFilterStatus(`⚠️ ${message}`);
}

// Populate filter options based on loaded data
function populateFilterOptions() {
  try {
    console.log('🔧 Populating filter options...');
    
    // Get unique values for filters
    const uniqueLocations = [...new Set(window.allData.map(item => item.location).filter(Boolean))];
    const uniquePartNos = [...new Set(window.allData.map(item => item.part_no).filter(Boolean))];
    
    // Populate location filter
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
      locationFilter.innerHTML = '<option value="">All</option>';
      uniqueLocations.forEach(location => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        locationFilter.appendChild(option);
      });
    }
    
    // Populate part number filter
    const partNoFilter = document.getElementById('partNoFilter');
    if (partNoFilter) {
      partNoFilter.innerHTML = '<option value="">All</option>';
      uniquePartNos.forEach(partNo => {
        const option = document.createElement('option');
        option.value = partNo;
        option.textContent = partNo;
        partNoFilter.appendChild(option);
      });
      
      // Update status
      const partNoStatus = document.getElementById('partNoStatus');
      if (partNoStatus) {
        partNoStatus.textContent = `${uniquePartNos.length} part numbers loaded`;
      }
    }
    
    console.log(`✅ Filter options populated: ${uniqueLocations.length} locations, ${uniquePartNos.length} part numbers`);
    
  } catch (error) {
    console.error('❌ Error populating filter options:', error);
  }
}

// Update filter status display
function updateFilterStatus(message) {
  updateFilterStatusDisplay(message, 'info');
}

// Update filter status display with type
function updateFilterStatusDisplay(message, type = 'info') {
  try {
    const filterStatus = document.getElementById('filterStatus');
    if (filterStatus) {
      const bgColor = {
        'info': 'text-gray-500',
        'success': 'text-green-600',
        'error': 'text-red-600',
        'warning': 'text-yellow-600'
      }[type] || 'text-gray-500';
      
      filterStatus.className = `text-xs ${bgColor}`;
      filterStatus.textContent = message;
    }
  } catch (error) {
    console.error('❌ Error updating filter status:', error);
  }
}

// Apply filters to data
function applyFilter() {
  try {
    console.log('🔍 Applying filters...');
    
    const locationFilter = document.getElementById('locationFilter');
    const partNoFilter = document.getElementById('partNoFilter');
    const holdWhetherFilter = document.getElementById('holdWhetherFilter');
    
    let filtered = [...window.allData];
    
    // Apply filters with progress tracking for large datasets
    const totalRecords = window.allData.length;
    let processedRecords = 0;
    
    // Apply location filter
    if (locationFilter && locationFilter.value) {
      filtered = filtered.filter(item => {
        processedRecords++;
        if (totalRecords > 5000 && processedRecords % 1000 === 0) {
          const progress = Math.round((processedRecords / totalRecords) * 100);
          updateFilterStatusLoading(`Filtering data... ${progress}% complete`);
        }
        return item.location === locationFilter.value;
      });
    }
    
    // Apply part number filter
    if (partNoFilter && partNoFilter.value) {
      filtered = filtered.filter(item => item.part_no === partNoFilter.value);
    }
    
    // Apply hold whether filter
    if (holdWhetherFilter && holdWhetherFilter.value) {
      filtered = filtered.filter(item => item.hold_whether === holdWhetherFilter.value);
    }
    
    window.filteredData = filtered;
    console.log(`🔍 Filter applied: ${filtered.length} records out of ${window.allData.length}`);
    
    // Perform analysis on filtered data
    performAnalysis();
    
    // Update filter status with pallet quantity info
    const palletQuantityInput = document.getElementById('palletQuantityInput');
    const palletCount = palletQuantityInput ? parseInt(palletQuantityInput.value) || 20 : 20;
    const targetQuantity = palletCount * 8;
    updateFilterStatus(`Filter applied: ${filtered.length} records from ${totalRecords} total | Target: ${palletCount} pallets (${targetQuantity} TMs)`);
    
  } catch (error) {
    console.error('❌ Error applying filter:', error);
    updateFilterStatusError(`Filter error: ${error.message}`);
  }
}

// Reset filters
function resetFilter() {
  try {
    console.log('🔄 Resetting filters...');
    
    // Reset filter values
    const locationFilter = document.getElementById('locationFilter');
    const partNoFilter = document.getElementById('partNoFilter');
    const holdWhetherFilter = document.getElementById('holdWhetherFilter');
    
    if (locationFilter) locationFilter.value = '';
    if (partNoFilter) partNoFilter.value = '';
    if (holdWhetherFilter) holdWhetherFilter.value = '';
    
    // Reset filtered data to all data
    window.filteredData = [...window.allData];
    
    // Perform analysis on all data
    performAnalysis();
    
    // Update filter status
    updateFilterStatus(`Filters reset: ${window.filteredData.length} records`);
    
  } catch (error) {
    console.error('❌ Error resetting filters:', error);
    updateFilterStatusError(`Reset error: ${error.message}`);
  }
}

// Perform analysis on filtered data
function performAnalysis() {
  try {
    console.log('📊 Performing analysis...');
    
    if (!window.filteredData || window.filteredData.length === 0) {
      console.log('📭 No data to analyze');
      displayResults([]);
      updateSummary([]);
      // Clear cached results
      window.lastAnalysisResults = [];
      return;
    }
    
    console.log(`🔍 Analyzing ${window.filteredData.length} records...`);
    
    // Analyze pallets by TM count (팔레트 중심 분석)
    const palletAnalysis = analyzePalletsByTMCount();
    
    // Cache the analysis results for sorting
    window.lastAnalysisResults = palletAnalysis;
    
    console.log(`✅ Analysis completed: ${palletAnalysis.length} pallets analyzed from ${window.filteredData.length} records`);
    
    // Display results
    displayResults(palletAnalysis);
    
    // Update summary
    updateSummary(palletAnalysis);
    
  } catch (error) {
    console.error('❌ Error performing analysis:', error);
    updateFilterStatusError(`Analysis error: ${error.message}`);
  }
}

// Display results
function displayResults(results) {
  try {
    // Check if we're on packaging analysis page
    if (window.location.pathname.includes('packaging-analysis')) {
      console.log('🚫 ANALYSIS-NEW displayResults blocked on packaging analysis page');
      return;
    }
    
    console.log('📋 ===== ANALYSIS-NEW DISPLAY FUNCTION CALLED =====');
    console.log('📋 Function name: displayResults (from analysis-new.js)');
    console.log('📋 Results data structure:', results);
    console.log('📊 Results length:', results ? results.length : 'undefined');
    console.log('📊 First result sample:', results[0]);
    
    const tableBody = document.getElementById('resultsTable');
    const resultCount = document.getElementById('resultCount');
    
    if (!tableBody || !resultCount) {
      console.error('❌ Required DOM elements not found!');
      return;
    }
    
    if (results.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-4 text-center text-gray-500">
            No search results found.
          </td>
        </tr>
      `;
      resultCount.textContent = 'No results found';
      return;
    }
    
    resultCount.textContent = `Found ${results.length} pallets`;
    
    // Create table rows
    const tableRows = results.map(result => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${result.palletNo || 'N/A'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${result.rackNo || 'N/A'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${result.dataCount || 0} items
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          ${result.tmCount || 0} items
        </td>
        <td class="px-6 py-4 text-sm text-gray-900">
          <div class="max-w-xs truncate" title="${result.partNoList || 'N/A'}">
            ${result.partNoList || 'N/A'}
          </div>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            ${result.earliestDate || 'N/A'}
          </span>
        </td>
      </tr>
    `);
    
    // Update table
    tableBody.innerHTML = tableRows.join('');
    
    // Set initial sort state if not set
    if (!window.currentSortColumn || window.currentSortColumn === '') {
      window.currentSortColumn = 'palletNo';
      window.currentSortDirection = 'asc';
    }
    
    // Update sort icons
    updateSortIcons();
    
    console.log(`✅ Results displayed: ${results.length} rows`);
    
  } catch (error) {
    console.error('❌ Error displaying results:', error);
  }
}

// Update summary
function updateSummary(results) {
  try {
    console.log('📊 Updating summary...');
    
    // Ensure results is an array
    if (!Array.isArray(results)) {
      // Set default values
      const summary8 = document.getElementById('summary8');
      const summary7 = document.getElementById('summary7');
      
      if (summary8) {
        summary8.innerHTML = `
          <div class="text-2xl font-bold text-green-600">0</div>
          <div class="text-sm text-gray-500">Ready to ship</div>
        `;
      }
      
      if (summary7) {
        summary7.innerHTML = `
          <div class="text-2xl font-bold text-orange-600">0</div>
          <div class="text-sm text-gray-500">Needs transfer</div>
        `;
      }
      return;
    }
    
    const over8 = results.filter(r => r.tmCount >= 8).length;
    const under8 = results.filter(r => r.tmCount < 8).length;
    
    const summary8 = document.getElementById('summary8');
    const summary7 = document.getElementById('summary7');
    
    if (summary8) {
      summary8.innerHTML = `
        <div class="text-2xl font-bold text-green-600">${over8}</div>
        <div class="text-sm text-gray-500">Ready to ship</div>
      `;
    }
    
    if (summary7) {
      summary7.innerHTML = `
        <div class="text-2xl font-bold text-orange-600">${under8}</div>
        <div class="text-sm text-gray-500">Needs transfer</div>
      `;
    }
    
    console.log(`✅ Summary updated: Ready to ship: ${over8}, Needs transfer: ${under8}`);
    
  } catch (error) {
    console.error('❌ Error updating summary:', error);
  }
}

// Export advanced shipping plan to Excel using ExcelJS
async function exportAdvancedShippingPlan() {
  try {
    console.log('🚛 FIFO ANALYSIS: Exporting shipping plan by quantity and date...');
    
    if (!window.filteredData || window.filteredData.length === 0) {
      console.warn('⚠️ No data available for export');
      return;
    }
    
    // 🆕 사용자 입력 팔렛 개수로 TM 개수 계산
    const palletQuantityInput = document.getElementById('palletQuantityInput');
    const palletCount = palletQuantityInput ? parseInt(palletQuantityInput.value) || 20 : 20;
    const targetQuantity = palletCount * 8; // 팔렛 × 8 = TM 개수
    console.log(`🎯 Target: ${palletCount} pallets = ${targetQuantity} TMs`);
    
    // 🆕 현재 적용된 필터 조건으로 데이터 필터링
    const filteredData = applyCurrentFilters();
    if (!filteredData || filteredData.length === 0) {
      console.warn('⚠️ No data available with current filters. Please adjust your search criteria.');
      return;
    }
    
    // 필터링된 데이터로 팔렛 분석 실행
    const palletAnalysis = analyzePalletsByTMCount(filteredData);
    if (!palletAnalysis || palletAnalysis.length === 0) {
      console.warn('⚠️ No pallet data available for analysis with current filters');
      return;
    }
    
    // 8개 이상과 8개 미만 팔렛 분리
    const readyToShip = palletAnalysis.filter(pallet => pallet.tmCount >= 8);
    const needsTransfer = palletAnalysis.filter(pallet => pallet.tmCount < 8);
    
    // 🆕 prod_date 오래된 순으로 정렬
    const sortedReadyToShip = sortPalletsByDate(readyToShip);
    const sortedNeedsTransfer = sortPalletsByDate(needsTransfer);
    
    // 🆕 Transfer Needed 팔렛들을 8배수로 최적화
    const { combinedPallets, remainingPallets } = combineTransferPallets(sortedNeedsTransfer);
    
    console.log(`🔧 Transfer pallet optimization results:`);
    console.log(`   - Combined pallets (8+): ${combinedPallets.length} pallets`);
    console.log(`   - Remaining pallets (<8): ${remainingPallets.length} pallets`);
    
    // 🆕 수량 기반으로 팔렛 선택 (Ready to Ship + Combined Transfer Pallets)
    const allReadyPallets = [...sortedReadyToShip, ...combinedPallets];
    console.log(`📦 Total ready pallets: ${allReadyPallets.length} (Original: ${sortedReadyToShip.length} + Combined: ${combinedPallets.length})`);
    
    // 🎯 TM 160개에 해당하는 팔렛들 선택
    const selectedReadyToShip = selectPalletsByQuantity(allReadyPallets, targetQuantity);
    const selectedNeedsTransfer = selectPalletsByQuantity(remainingPallets, targetQuantity);
    
    console.log(`🎯 Final selection for ${targetQuantity} TMs:`);
    console.log(`   - Ready to Ship selected: ${selectedReadyToShip.length} pallets`);
    console.log(`   - Transfer Needed selected: ${selectedNeedsTransfer.length} pallets`);
    
    console.log(`📊 Selection results:`);
    console.log(`   - Ready to Ship selected: ${selectedReadyToShip.length} pallets`);
    console.log(`   - Transfer Needed selected: ${selectedNeedsTransfer.length} pallets`);
    
    // 🆕 디버깅: Transfer Needed 시트 생성 조건 확인
    console.log(`🔍 Transfer Needed sheet creation check:`);
    console.log(`   - needsTransfer.length (all <8 TM pallets): ${needsTransfer.length}`);
    console.log(`   - remainingPallets.length (not combined): ${remainingPallets.length}`);
    console.log(`   - selectedNeedsTransfer.length (quantity-based): ${selectedNeedsTransfer.length}`);
    console.log(`   - Will create Transfer Needed sheet: ${needsTransfer.length > 0}`);
    if (needsTransfer.length > 0) {
      console.log(`   - Transfer Needed pallets will be sorted by prod_date (oldest first)`);
    } else {
      console.log(`   - Reason: No pallets with <8 TMs found in current filter`);
    }
    
    // Create Excel workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    
    // Sheet 1: Ready to Ship (8+) - 수량 기반 선택된 것들
    if (selectedReadyToShip.length > 0) {
      const readySheet = workbook.addWorksheet('🚛 FIFO Ready to Ship (8+)');
      await populateReadyToShipSheet(readySheet, selectedReadyToShip);
    }
    
    // Sheet 2: Transfer Needed (<8) - 모든 8개 미만 팔렛들 (출하 수량과 무관, prod_date 오래된 순)
    if (needsTransfer.length > 0) {
      const transferSheet = workbook.addWorksheet('⚠️ FIFO Transfer Needed (<8)');
      // prod_date 오래된 순으로 정렬 (이미 sortPalletsByDate로 정렬되어 있지만 명시적으로 적용)
      const sortedNeedsTransfer = sortPalletsByDate(needsTransfer);
      await populateTransferNeededSheet(transferSheet, sortedNeedsTransfer);
    }
    
    // Sheet 3: Analysis Summary
    const summarySheet = workbook.addWorksheet('📊 FIFO Analysis Summary');
    await populateSummarySheet(summarySheet, palletAnalysis, selectedReadyToShip, needsTransfer);
    
    // Sheet 4: Detailed Data (sorted by prod_date)
    const detailSheet = workbook.addWorksheet('📋 FIFO Detailed Data');
    await populateDetailedDataSheet(detailSheet, window.filteredData);
    
    // 🆕 Sheet 5: Quantity Selection Summary
    const quantitySheet = workbook.addWorksheet('🎯 FIFO Quantity Selection Summary');
    await populateQuantitySelectionSheet(quantitySheet, targetQuantity, selectedReadyToShip, needsTransfer);
    
    // File download
    const fileName = `FIFO_SHIPPING_PLAN_${targetQuantity}_items_${new Date().toISOString().slice(0, 10)}.xlsx`;
    
    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    showFifoStatus(`✅ FIFO Shipping plan Excel export completed: ${targetQuantity} items, ${fileName}`, 'success');
    
  } catch (error) {
    console.error('❌ Error exporting shipping plan:', error);
    showFifoStatus("Error occurred during Excel export: " + error.message, 'error');
  }
}

// Analyze pallets by TM count with optimization
function analyzePalletsByTMCount(dataToAnalyze = null) {
  try {
    console.log('📊 Analyzing pallets by TM count with optimization...');
    
    // 데이터 소스 결정: 매개변수로 받은 데이터 또는 현재 필터링된 데이터
    const sourceData = dataToAnalyze || window.filteredData;
    
    if (!sourceData || sourceData.length === 0) {
      console.log('📭 No data available for analysis');
      return [];
    }
    
    const palletGroups = {};
    
    sourceData.forEach(item => {
      const palletNo = item.pallet_no || '';
      if (!palletNo) return;
      
      if (!palletGroups[palletNo]) {
        palletGroups[palletNo] = {
          palletNo: palletNo,
          rackNo: new Set(),
          tmCount: new Set(),
          partNoList: new Set(),
          earliestDate: null,
          items: []
        };
      }
      
      palletGroups[palletNo].rackNo.add(item.rack_no || '');
      palletGroups[palletNo].tmCount.add(item.tm_no || '');
      palletGroups[palletNo].partNoList.add(item.part_no || '');
      palletGroups[palletNo].items.push(item);
      
      // Calculate earliest prod_date
      if (item.prod_date && item.prod_date.trim() !== '') {
        const currentDate = palletGroups[palletNo].earliestDate;
        if (!currentDate || item.prod_date < currentDate) {
          palletGroups[palletNo].earliestDate = item.prod_date;
        }
      }
    });
    
    // Convert to array
    const result = Object.values(palletGroups).map(group => ({
      palletNo: group.palletNo,
      rackNo: Array.from(group.rackNo).filter(r => r).join(', '),
      dataCount: group.items.length, // 총 데이터 항목 수
      tmCount: group.tmCount.size,   // 고유한 TM 수
      partNoList: Array.from(group.partNoList).filter(p => p).join(', '),
      earliestDate: group.earliestDate || 'N/A',
      items: group.items
    }));
    
    console.log(`✅ Pallet analysis completed: ${result.length} pallets analyzed`);
    return result;
    
  } catch (error) {
    console.error('❌ Error analyzing pallets by TM count:', error);
    return [];
  }
}

// 🆕 간단한 팔렛 정렬 함수 - prod date 오래된 순으로 정렬
function sortPalletsByDate(pallets) {
  try {
    console.log('📅 Sorting pallets by prod_date (oldest first)...');
    
    if (!pallets || pallets.length === 0) {
      return [];
    }
    
    // prod_date 오래된 순으로 정렬
    const sortedPallets = [...pallets].sort((a, b) => {
      if (!a.earliestDate && !b.earliestDate) return 0;
      if (!a.earliestDate) return 1;
      if (!b.earliestDate) return -1;
      return new Date(a.earliestDate) - new Date(b.earliestDate);
    });
    
    console.log(`✅ Sorted ${sortedPallets.length} pallets by date`);
    return sortedPallets;
    
  } catch (error) {
    console.error('❌ Error sorting pallets by date:', error);
    return pallets || [];
  }
}

// 🆕 수량 기반 팔렛 선택 함수 (Ready to Ship용)
function selectPalletsByQuantity(pallets, targetQuantity) {
  try {
    console.log(`🎯 Selecting pallets for target quantity: ${targetQuantity}`);
    
    if (!pallets || pallets.length === 0) {
      return [];
    }
    
    const selectedPallets = [];
    let currentTMCount = 0;
    
    // prod_date 오래된 순으로 정렬된 팔렛들에서 수량만큼 선택
    for (const pallet of pallets) {
      if (currentTMCount >= targetQuantity) break;
      
      selectedPallets.push(pallet);
      currentTMCount += pallet.tmCount;
      
      console.log(`📦 Added pallet ${pallet.palletNo}: +${pallet.tmCount} TMs (Total: ${currentTMCount})`);
    }
    
    console.log(`✅ Selected ${selectedPallets.length} pallets with ${currentTMCount} TMs`);
    return selectedPallets;
    
  } catch (error) {
    console.error('❌ Error selecting pallets by quantity:', error);
    return [];
  }
}

// 🆕 Transfer Needed 팔렛들을 8배수로 최적화하는 함수
function combineTransferPallets(transferPallets) {
  try {
    console.log(`🔧 Combining ${transferPallets.length} transfer pallets to 8x multiples...`);
    
    if (!transferPallets || transferPallets.length === 0) {
      return { combinedPallets: [], remainingPallets: [] };
    }
    
    // 날짜 빠른 순으로 정렬 (오래된 제품부터 처리)
    const sortedPallets = sortPalletsByDate(transferPallets);
    
    const combinedPallets = [];
    const remainingPallets = [];
    const usedPallets = new Set();
    
    // 8배수 최적화 알고리즘 (8, 16, 24, 32...)
    for (let i = 0; i < sortedPallets.length; i++) {
      if (usedPallets.has(i)) continue;
      
      const currentPallet = sortedPallets[i];
      let currentTMCount = currentPallet.tmCount;
      let palletsToCombine = [currentPallet];
      usedPallets.add(i);
      
      // 현재 팔렛과 조합 가능한 다른 팔렛들 찾기
      for (let j = i + 1; j < sortedPallets.length; j++) {
        if (usedPallets.has(j)) continue;
        
        const candidatePallet = sortedPallets[j];
        const combinedTMCount = currentTMCount + candidatePallet.tmCount;
        
        // 8배수로 만들 수 있는지 확인 (8, 16, 24, 32...)
        if (combinedTMCount % 8 === 0) {
          currentTMCount = combinedTMCount;
          palletsToCombine.push(candidatePallet);
          usedPallets.add(j);
          
          console.log(`🎯 Perfect 8x multiple created: ${currentTMCount} TMs from ${palletsToCombine.length} pallets`);
          break;
        }
        // 8배수는 아니지만 8 이상이면 계속 시도 (더 큰 8배수를 만들 수 있을 수도)
        else if (combinedTMCount >= 8) {
          currentTMCount = combinedTMCount;
          palletsToCombine.push(candidatePallet);
          usedPallets.add(j);
          
          console.log(`📦 Combined to ${currentTMCount} TMs (${palletsToCombine.length} pallets)`);
        }
      }
      
      // 조합 결과 처리
      if (currentTMCount >= 8) {
        // 8개 이상 완성 팔렛 생성
        const combinedPallet = createCombinedPallet(palletsToCombine);
        if (combinedPallet) {
          combinedPallets.push(combinedPallet);
          console.log(`✅ Created combined pallet: ${combinedPallet.palletNo} with ${currentTMCount} TMs`);
        }
      } else {
        // 8개 미만으로는 합칠 수 없는 팔렛들
        remainingPallets.push(...palletsToCombine);
        console.log(`❌ Could not combine pallet group: ${currentTMCount} TMs (too small)`);
      }
    }
    
    // 사용되지 않은 팔렛들도 Transfer Needed에 포함 (오래된 팔렛 보호)
    sortedPallets.forEach((pallet, index) => {
      if (!usedPallets.has(index)) {
        remainingPallets.push(pallet);
        console.log(`🛡️ Added unused pallet ${pallet.palletNo} to Transfer Needed for protection`);
      }
    });
    
    console.log(`✅ Transfer pallet combination completed:`);
    console.log(`   - Combined pallets (8+): ${combinedPallets.length}`);
    console.log(`   - Remaining pallets (including unused): ${remainingPallets.length}`);
    
    return { combinedPallets, remainingPallets };
    
  } catch (error) {
    console.error('❌ Error combining transfer pallets:', error);
    return { combinedPallets: [], remainingPallets: [] };
  }
}

// 🆕 합쳐진 팔렛 객체 생성
function createCombinedPallet(combinedPallets) {
  try {
    const allItems = [];
    const allTMNos = new Set();
    const allPartNos = new Set();
    let earliestDate = null;
    
    combinedPallets.forEach(pallet => {
      allItems.push(...pallet.items);
      pallet.items.forEach(item => {
        if (item.tm_no) allTMNos.add(item.tm_no);
        if (item.part_no) allPartNos.add(item.part_no);
        
        // 가장 빠른 날짜 찾기
        if (item.prod_date && item.prod_date.trim() !== '') {
          if (!earliestDate || item.prod_date < earliestDate) {
            earliestDate = item.prod_date;
          }
        }
      });
    });
    
    return {
      palletNo: `COMB_${combinedPallets.map(p => p.palletNo).join('_')}`,
      rackNo: combinedPallets[0].rackNo, // 첫 번째 팔렛의 Rack No 사용
      dataCount: allItems.length,
      tmCount: allTMNos.size,
      partNoList: Array.from(allPartNos).filter(p => p).join(', '),
      earliestDate: earliestDate || 'N/A',
      items: allItems,
      originalPallets: combinedPallets.map(p => p.palletNo),
      isCombined: true,
      combinedTMCount: allTMNos.size // 조합된 TM 개수 명시
    };
    
  } catch (error) {
    console.error('❌ Error creating combined pallet:', error);
    return null;
  }
}

// Debug function to check sorting state
function debugSortingState() {
  console.log('🔍 Current Sorting State:');
  console.log('- currentSortColumn:', window.currentSortColumn);
  console.log('- currentSortDirection:', window.currentSortDirection);
  console.log('- lastAnalysisResults:', window.lastAnalysisResults ? window.lastAnalysisResults.length : 'undefined');
  console.log('- filteredData:', window.filteredData ? window.filteredData.length : 'undefined');
}

// Make debug function globally accessible
window.debugSortingState = debugSortingState;

// Table sorting functionality
function sortTable(column) {
  try {
    console.log(`🔍 Sorting by column: ${column}`);
    
    // Toggle sort direction
    if (window.currentSortColumn === column) {
      window.currentSortDirection = window.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      window.currentSortColumn = column;
      window.currentSortDirection = 'asc';
    }
    
    console.log(`📊 Sort direction: ${window.currentSortDirection}`);
    
    // Get current pallet analysis results - use cached results if available
    let currentResults = window.lastAnalysisResults;
    if (!currentResults || currentResults.length === 0) {
      currentResults = analyzePalletsByTMCount();
      // Cache the results for future sorting
      window.lastAnalysisResults = currentResults;
    }
    
    if (!currentResults || currentResults.length === 0) {
      console.log('📭 No results to sort - please apply filters first');
      showFifoStatus('정렬할 데이터가 없습니다. 필터를 먼저 적용해주세요.', 'warning');
      return;
    }
    
    // Sort the pallet analysis results
    const sortedResults = [...currentResults].sort((a, b) => {
      let aVal = a[column] || '';
      let bVal = b[column] || '';
      
      // Handle numeric values
      if (['dataCount', 'tmCount'].includes(column)) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else if (column === 'earliestDate') {
        // Handle date values
        if (aVal === 'N/A') aVal = '9999-12-31';
        if (bVal === 'N/A') bVal = '9999-12-31';
        aVal = new Date(aVal || '1900-01-01');
        bVal = new Date(bVal || '1900-01-01');
      } else {
        // Handle string values
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      
      if (aVal < bVal) return window.currentSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return window.currentSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    console.log(`✅ Sorted ${sortedResults.length} results by ${column} (${window.currentSortDirection})`);
    
    // Update sort icons
    updateSortIcons();
    
    // Display sorted results directly (without re-analyzing)
    displayResults(sortedResults);
    updateSummary(sortedResults);
    
    // Show success message
    showFifoStatus(`${column} 기준으로 ${window.currentSortDirection === 'asc' ? '오름차순' : '내림차순'} 정렬되었습니다.`, 'success');
    
  } catch (error) {
    console.error('❌ Error sorting table:', error);
    showFifoStatus('정렬 중 오류가 발생했습니다.', 'error');
  }
}

// Update sort icons
function updateSortIcons() {
  try {
    const columns = ['palletNo', 'rackNo', 'dataCount', 'tmCount', 'partNoList', 'earliestDate'];
    
    columns.forEach(col => {
      const icon = document.getElementById(`sort-${col}`);
      if (icon) {
        if (col === window.currentSortColumn) {
          // 현재 정렬 컬럼 표시
          icon.textContent = window.currentSortDirection === 'asc' ? '↑' : '↓';
          icon.className = 'ml-1 text-blue-600 font-bold';
          icon.title = `${col} 기준 ${window.currentSortDirection === 'asc' ? '오름차순' : '내림차순'} 정렬됨`;
        } else {
          // 정렬되지 않은 컬럼 표시
          icon.textContent = '↕';
          icon.className = 'ml-1 text-gray-400';
          icon.title = `${col} 클릭하여 정렬`;
        }
      } else {
        console.warn(`⚠️ Sort icon not found for column: ${col}`);
      }
    });
    
    console.log(`✅ Sort icons updated - Current: ${window.currentSortColumn} (${window.currentSortDirection})`);
    
  } catch (error) {
    console.error('❌ Error updating sort icons:', error);
  }
}

// Show status message
function showStatus(message, type = 'info') {
  try {
    // Create or update status element
    let statusElement = document.getElementById('fifoStatusMessage');
    if (!statusElement) {
      statusElement = document.createElement('div');
      statusElement.id = 'fifoStatusMessage';
      statusElement.className = 'fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg';
      document.body.appendChild(statusElement);
    }
    
    // Set message and styling
    const bgColor = {
      'info': 'bg-blue-500',
      'success': 'bg-green-500',
      'error': 'bg-red-500',
      'warning': 'bg-yellow-500'
    }[type] || 'bg-blue-500';
    
    statusElement.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor}`;
    statusElement.textContent = message;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (statusElement) {
        statusElement.remove();
      }
    }, 5000);
    
  } catch (error) {
    console.error('❌ Error showing status:', error);
  }
}

// Export pallet data function using ExcelJS
async function exportPartData(palletNo) {
  try {
    console.log(`📊 Exporting data for pallet: ${palletNo}`);
    
    // Filter data for specific pallet
    const palletData = window.filteredData.filter(item => item.pallet_no === palletNo);
    
    if (palletData.length === 0) {
      console.warn('⚠️ No data found for this pallet number');
      return;
    }
    
    // Create workbook using ExcelJS
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(palletNo);
    
    // Add headers
    const headers = ['Pallet No', 'Location', 'Rack No', 'TM No', 'Part No', 'Hold Whether', 'Prod Date', 'Upload Time'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    palletData.forEach(item => {
      const row = worksheet.addRow([
        item.pallet_no || '',
        item.location || '',
        item.rack_no || '',
        item.tm_no || '',
        item.part_no || '',
        item.hold_whether || '',
        item.prod_date || '',
        item.upload_time || ''
      ]);
      
      // Add borders to each cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // Auto-adjust column widths
    worksheet.columns.forEach(column => {
      column.width = 18;
    });
    
    // Export
    const fileName = `Pallet_${palletNo}_data_${new Date().toISOString().split('T')[0]}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log(`✅ Pallet data exported: ${fileName}`);
    showFifoStatus(`Pallet ${palletNo} data exported successfully!`, 'success');
    
  } catch (error) {
    console.error('❌ Error exporting pallet data:', error);
    showFifoStatus(`Export failed: ${error.message}`, 'error');
  }
}

// ========================================
// ExcelJS Sheet Population Functions
// ========================================

// Populate Ready to Ship sheet
async function populateReadyToShipSheet(worksheet, readyToShip) {
  try {
    // 🆕 1행: 필터 조건 표시 (A1 셀)
    const filterConditions = getCurrentFilterConditions();
    const filterRow = worksheet.addRow([filterConditions, '', '', '', '']);
    filterRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF0000FF' } }; // 파란색
    filterRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' } // 연한 노란색 배경
    };
    filterRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    
    // 🆕 2행: 빈 행 (여백)
    worksheet.addRow([]);
    
    // 🆕 3행: 실제 데이터 컬럼 헤더 (Part No List 제거 - 4개 컬럼만)
    const headers = ['Pallet No', 'Rack No', 'TM Count', 'Prod Date'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows (4행부터)
    readyToShip.forEach(pallet => {
      const row = worksheet.addRow([
        pallet.palletNo,
        pallet.rackNo,
        pallet.tmCount,
        pallet.earliestDate
      ]);
      
      // 조합된 팔렛인 경우 배경색 변경
      if (pallet.isCombined) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB3B' } // 노란색으로 조합된 팔렛 표시
        };
        console.log(`🎨 Styled combined pallet: ${pallet.palletNo} with ${pallet.tmCount} TMs`);
      }
      
      // Add borders to each cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // 🆕 컬럼별 넓이 조정 - 4개 컬럼만 (Part No List 제거)
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 40;      // Pallet No + 필터 조건 표시
      else if (index === 1) column.width = 12; // Rack No  
      else if (index === 2) column.width = 10; // TM Count
      else if (index === 3) column.width = 12; // Prod Date
    });
    
    console.log(`✅ Ready to Ship sheet populated with ${readyToShip.length} rows (3행 구조, 필터 조건 포함)`);
    
  } catch (error) {
    console.error('❌ Error populating Ready to Ship sheet:', error);
    throw error;
  }
}

// Populate Transfer Needed sheet
async function populateTransferNeededSheet(worksheet, needsTransfer) {
  try {
    // 🆕 1행: 필터 조건 표시 (A1 셀)
    const filterConditions = getCurrentFilterConditions();
    const filterRow = worksheet.addRow([filterConditions, '', '', '', '']);
    filterRow.getCell(1).font = { bold: true, size: 12, color: { argb: 'FF0000FF' } }; // 파란색
    filterRow.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFFF2CC' } // 연한 노란색 배경
    };
    filterRow.getCell(1).alignment = { horizontal: 'left', vertical: 'middle' };
    
    // 🆕 2행: PARTNO 별도 표시 (D열)
    const partNoHeader = worksheet.addRow(['', '', '', 'PARTNO', '']);
    partNoHeader.getCell(4).font = { bold: true, size: 14 };
    partNoHeader.getCell(4).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' } // 파란색으로 강조
    };
    partNoHeader.getCell(4).alignment = { horizontal: 'center' };
    
    // 🆕 3행: 빈 행 (여백)
    worksheet.addRow([]);
    
    // 🆕 4행: 실제 데이터 컬럼 헤더 (Part No List 제거 - 4개 컬럼만)
    const headers = ['Pallet No', 'Rack No', 'TM Count', 'Prod Date'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows (5행부터)
    needsTransfer.forEach(pallet => {
      const row = worksheet.addRow([
        pallet.palletNo,
        pallet.rackNo,
        pallet.tmCount,
        pallet.earliestDate || 'N/A'
      ]);
      
      // Add borders to each cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // 🆕 컬럼별 넓이 조정 - 4개 컬럼만 (Part No List 제거)
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 40;      // Pallet No + 필터 조건 표시
      else if (index === 1) column.width = 12; // Rack No  
      else if (index === 2) column.width = 10; // TM Count
      else if (index === 3) column.width = 12; // Prod Date
    });
    
    console.log(`✅ Transfer Needed sheet populated with ${needsTransfer.length} rows (4행 구조, 필터 조건 포함)`);
    
  } catch (error) {
    console.error('❌ Error populating Transfer Needed sheet:', error);
    throw error;
  }
}

// Populate Summary sheet
async function populateSummarySheet(worksheet, palletAnalysis, readyToShip, needsTransfer) {
  try {
    // Add headers - 컬럼명을 줄임
    const headers = ['Summary Type', 'Count', 'TM Count', 'Details'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Calculate totals
    const totalTMReady = readyToShip.reduce((sum, p) => sum + p.tmCount, 0);
    const totalTMNeeded = needsTransfer.reduce((sum, p) => sum + p.tmCount, 0);
    
    // Add data rows
    const data = [
      ['Total Pallets', palletAnalysis.length, '', ''],
      ['Ready to Ship (8+)', readyToShip.length, totalTMReady, 'Immediate shipping possible'],
      ['Needs Transfer (<8)', needsTransfer.length, totalTMNeeded, 'Requires worker transfer'],
      ['Total TM Count', '', totalTMReady + totalTMNeeded, 'Combined TM count']
    ];
    
    data.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      
      // Add borders to each cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // 컬럼별 넓이 조정
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 20;      // Summary Type
      else if (index === 1) column.width = 12; // Count
      else if (index === 2) column.width = 10; // TM Count - 좁게
      else if (index === 3) column.width = 30; // Details - 넓게
    });
    
    console.log(`✅ Summary sheet populated`);
    
  } catch (error) {
    console.error('❌ Error populating Summary sheet:', error);
    throw error;
  }
}

// Populate Detailed Data sheet
async function populateDetailedDataSheet(worksheet, data) {
  try {
    // Sort by prod_date (oldest first)
    const sortedData = [...data].sort((a, b) => {
      if (!a.prod_date && !b.prod_date) return 0;
      if (!a.prod_date) return 1;
      if (!b.prod_date) return -1;
      return a.prod_date.localeCompare(b.prod_date);
    });
    
    // 🆕 1행: PARTNO 별도 표시 (A열 - Part No가 첫 번째 컬럼이므로)
    const partNoHeader = worksheet.addRow(['PARTNO', '', '', '', '', '', '']);
    partNoHeader.getCell(1).font = { bold: true, size: 14 };
    partNoHeader.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' } // 파란색으로 강조
    };
    partNoHeader.getCell(1).alignment = { horizontal: 'center' };
    
    // 🆕 2행: 빈 행 (여백)
    worksheet.addRow([]);
    
    // 🆕 3행: 실제 데이터 컬럼 헤더 (Part No List 제거 - 4개 컬럼만)
    const headers = ['Pallet No', 'Rack No', 'TM Count', 'Prod Date'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows (4행부터) - 4개 컬럼만 (Part No List 제거)
    sortedData.forEach(item => {
      const row = worksheet.addRow([
        item.pallet_no || '',
        item.rack_no || '',
        item.tm_no || '',        // TM Count로 사용
        item.prod_date || ''
      ]);
      
      // Add borders to each cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // Auto-adjust column widths
    worksheet.columns.forEach(column => {
      column.width = 18;
    });
    
    console.log(`✅ Detailed Data sheet populated with ${sortedData.length} rows (3행 구조)`);
    
  } catch (error) {
    console.error('❌ Error populating Detailed Data sheet:', error);
    throw error;
  }
}

// 🆕 Populate Optimized Shipping Plan sheet
async function populateOptimizedShippingSheet(worksheet, optimizedPallets) {
  try {
    console.log(`📊 Populating Optimized Shipping Plan sheet with ${optimizedPallets.length} pallets...`);
    
    // 🆕 1행: PARTNO 별도 표시 (D열 - Part No List가 4번째 컬럼이므로)
    const partNoHeader = worksheet.addRow(['', '', '', 'PARTNO', '', '', '']);
    partNoHeader.getCell(4).font = { bold: true, size: 14 };
    partNoHeader.getCell(4).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' } // 파란색으로 강조
    };
    partNoHeader.getCell(4).alignment = { horizontal: 'center' };
    
    // 🆕 2행: 빈 행 (여백)
    worksheet.addRow([]);
    
    // 🆕 3행: 실제 데이터 컬럼 헤더 (Part No List 제거 - 4개 컬럼만)
    const headers = ['Pallet No', 'Rack No', 'TM Count', 'Prod Date'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' } // Green for optimized
    };
    
    // Add data rows (4행부터) - 4개 컬럼만 (Part No List 제거)
    optimizedPallets.forEach(pallet => {
      const row = worksheet.addRow([
        pallet.palletNo,
        pallet.rackNo,
        pallet.tmCount,
        pallet.earliestDate
      ]);
      
      // Style optimized pallets differently
      if (pallet.isOptimized) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFFEB3B' } // Yellow for optimized
        };
      }
      
      // Add borders to each cell
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // 컬럼별 넓이 조정 (4개 컬럼만)
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 20;      // Pallet No
      else if (index === 1) column.width = 12; // Rack No  
      else if (index === 2) column.width = 10; // TM Count
      else if (index === 3) column.width = 12; // Prod Date
    });
    
    console.log(`✅ Optimized Shipping Plan sheet populated with ${optimizedPallets.length} rows (3행 구조)`);
    
  } catch (error) {
    console.error('❌ Error populating Optimized Shipping Plan sheet:', error);
    throw error;
  }
}

// 🆕 Populate Quantity Selection Summary sheet
async function populateQuantitySelectionSheet(worksheet, targetQuantity, selectedReadyToShip, selectedNeedsTransfer) {
  try {
    console.log(`📊 Populating Quantity Selection Summary sheet...`);
    
    // 🆕 1행: PARTNO 별도 표시 (A열 - Selection Type이 첫 번째 컬럼이므로)
    const partNoHeader = worksheet.addRow(['PARTNO', '', '', '', '']);
    partNoHeader.getCell(1).font = { bold: true, size: 14 };
    partNoHeader.getCell(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2196F3' } // 파란색으로 강조
    };
    partNoHeader.getCell(1).alignment = { horizontal: 'center' };
    
    // 🆕 2행: 빈 행 (여백)
    worksheet.addRow([]);
    
    // 🆕 3행: 실제 데이터 컬럼 헤더
    const headers = ['Selection Type', 'Count', 'TM Count', 'Details', 'Date Range'];
    const headerRow = worksheet.addRow(headers);
    
    // Style header row
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4CAF50' } // Green for summary
    };
    
    // Calculate statistics
    const totalReady = selectedReadyToShip.length;
    const totalTransfer = selectedNeedsTransfer.length;
    const totalTMReady = selectedReadyToShip.reduce((sum, p) => sum + p.tmCount, 0);
    const totalTMTransfer = selectedNeedsTransfer.reduce((sum, p) => sum + p.tmCount, 0);
    const totalSelected = totalReady + totalTransfer;
    const totalTMSelected = totalTMReady + totalTMTransfer;
    
    // Add selection summary (4행부터)
    const summaryData = [
      ['🎯 Target Quantity', '', targetQuantity, `Requested: ${targetQuantity} items`, ''],
      ['✅ Ready to Ship (8+)', totalReady, totalTMReady, 'Immediate shipping possible', ''],
      ['⚠️ Transfer Needed (<8)', totalTransfer, totalTMTransfer, 'Requires worker transfer', ''],
      ['📊 Total Selected', totalSelected, totalTMSelected, `Selected: ${totalTMSelected}/${targetQuantity}`, ''],
      ['📈 Efficiency', '', '', `${Math.round((totalTMSelected / targetQuantity) * 100)}%`, '']
    ];
    
    summaryData.forEach(rowData => {
      const row = worksheet.addRow(rowData);
      
      // Style summary rows
      if (rowData[0].includes('Target')) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2196F3' } };
      } else if (rowData[0].includes('Ready')) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4CAF50' } };
      } else if (rowData[0].includes('Transfer')) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFF9800' } };
      } else if (rowData[0].includes('Total')) {
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9C27B0' } };
      }
      
      // Add borders
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    });
    
    // Add date range information
    worksheet.addRow([]); // Empty row for spacing
    
    const dateHeaderRow = worksheet.addRow(['Date Information', 'Earliest Date', 'Latest Date', 'Date Range']);
    dateHeaderRow.font = { bold: true };
    dateHeaderRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Calculate date ranges
    const allSelectedPallets = [...selectedReadyToShip, ...selectedNeedsTransfer];
    const dates = allSelectedPallets
      .map(p => p.earliestDate)
      .filter(d => d && d !== 'N/A')
      .map(d => new Date(d))
      .sort((a, b) => a - b);
    
    if (dates.length > 0) {
      const earliestDate = dates[0];
      const latestDate = dates[dates.length - 1];
      const dateRange = Math.ceil((latestDate - earliestDate) / (1000 * 60 * 60 * 24));
      
      const dateRow = worksheet.addRow([
        'Selected Pallets',
        earliestDate.toISOString().split('T')[0],
        latestDate.toISOString().split('T')[0],
        `${dateRange} days`
      ]);
      
      // Add borders
      dateRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });
    }
    
    // 컬럼별 넓이 조정
    worksheet.columns.forEach((column, index) => {
      if (index === 0) column.width = 25;      // Type
      else if (index === 1) column.width = 15; // Count
      else if (index === 2) column.width = 12; // TM Count
      else if (index === 3) column.width = 35; // Details
      else if (index === 4) column.width = 15; // Date Range
    });
    
    console.log(`✅ Quantity Selection Summary sheet populated (3행 구조)`);
    
  } catch (error) {
    console.error('❌ Error populating Quantity Selection Summary sheet:', error);
    throw error;
  }
}

// 🆕 현재 적용된 필터 조건으로 데이터 필터링하는 함수
function applyCurrentFilters() {
  try {
    console.log('🔍 Applying current filters for export...');
    
    const locationFilter = document.getElementById('locationFilter');
    const partNoFilter = document.getElementById('partNoFilter');
    const holdWhetherFilter = document.getElementById('holdWhetherFilter');
    
    let filtered = [...window.allData];
    
    // Location 필터 적용
    if (locationFilter && locationFilter.value) {
      filtered = filtered.filter(item => item.location === locationFilter.value);
      console.log(`📍 Location filter applied: ${locationFilter.value}`);
    }
    
    // Part No 필터 적용
    if (partNoFilter && partNoFilter.value) {
      filtered = filtered.filter(item => item.part_no === partNoFilter.value);
      console.log(`🔢 Part No filter applied: ${partNoFilter.value}`);
    }
    
    // Hold Whether 필터 적용
    if (holdWhetherFilter && holdWhetherFilter.value) {
      filtered = filtered.filter(item => item.hold_whether === holdWhetherFilter.value);
      console.log(`⏸️ Hold Whether filter applied: ${holdWhetherFilter.value}`);
    }
    
    console.log(`✅ Filters applied: ${filtered.length} records from ${window.allData.length} total`);
    return filtered;
    
  } catch (error) {
    console.error('❌ Error applying current filters:', error);
    return window.allData || [];
  }
}



// 🆕 현재 필터 조건을 가져오는 함수
function getCurrentFilterConditions() {
  try {
    const conditions = [];
    
    // Location 필터
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter && locationFilter.value) {
      conditions.push(`LOCATION: ${locationFilter.value}`);
    }
    
    // Part No 필터
    const partNoFilter = document.getElementById('partNoFilter');
    if (partNoFilter && partNoFilter.value) {
      conditions.push(`PART NO: ${partNoFilter.value}`);
    }
    
    // Hold Whether 필터
    const holdWhetherFilter = document.getElementById('holdWhetherFilter');
    if (holdWhetherFilter && holdWhetherFilter.value) {
      conditions.push(`HOLD WHETHER: ${holdWhetherFilter.value}`);
    }
    
    // 날짜 범위 필터
    const startDateFilter = document.getElementById('startDateFilter');
    const endDateFilter = document.getElementById('endDateFilter');
    if (startDateFilter && endDateFilter && startDateFilter.value && endDateFilter.value) {
      conditions.push(`DATE: ${startDateFilter.value} ~ ${endDateFilter.value}`);
    }
    
    // 팔렛 수량
    const palletQuantityInput = document.getElementById('palletQuantityInput');
    if (palletQuantityInput && palletQuantityInput.value) {
      const targetQuantity = parseInt(palletQuantityInput.value) * 8;
      conditions.push(`TARGET: ${palletQuantityInput.value} pallets (${targetQuantity} items)`);
    }
    
    if (conditions.length === 0) {
      return 'FILTER: All data (no filters applied)';
    }
    
    return `FILTER: ${conditions.join(' | ')}`;
  } catch (error) {
    console.error('❌ Error getting filter conditions:', error);
    return 'FILTER: Error getting conditions';
  }
}

// Make new functions globally accessible
window.populateQuantitySelectionSheet = populateQuantitySelectionSheet;
window.sortPalletsByDate = sortPalletsByDate;
window.selectPalletsByQuantity = selectPalletsByQuantity;

window.applyCurrentFilters = applyCurrentFilters;
window.getCurrentFilterConditions = getCurrentFilterConditions;
