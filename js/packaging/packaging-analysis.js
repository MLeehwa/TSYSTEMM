// ===== PACKAGING ANALYSIS SYSTEM =====
// 독립적인 포장 분석 시스템 - 다른 스크립트와 완전 분리

console.log('📦 ===== PACKAGING ANALYSIS SYSTEM LOADING =====');

// 전역 변수 정의 (고유한 네임스페이스 사용)
window.PackagingAnalysis = {
  allData: [],
  filteredData: [],
  currentSortColumn: 'partNo',
  currentSortDirection: 'asc',
  lastAnalysisResults: [],
  initialized: false
};

// 포장 전후 구역 정의
const PACKAGING_ZONES = {
  BEFORE: ['LHSAA', 'LHSAB', 'LHSBA', 'LHSBB'],
  AFTER: ['LHSAC', 'LHSAD', 'LHSBC', 'LHSBD']
};

// 포장 상태 판단 함수
function determinePackagingStatus(rackNo, location) {
  const rack = rackNo || '';
  const loc = location || '';
  
  if (rack) {
    const beforeByRack = PACKAGING_ZONES.BEFORE.some(prefix => rack.startsWith(prefix));
    const afterByRack = PACKAGING_ZONES.AFTER.some(prefix => rack.startsWith(prefix));
    
    if (beforeByRack) return 'before';
    if (afterByRack) return 'after';
  }
  
  if (loc) {
    const beforeByLoc = PACKAGING_ZONES.BEFORE.some(prefix => loc.startsWith(prefix));
    const afterByLoc = PACKAGING_ZONES.AFTER.some(prefix => loc.startsWith(prefix));
    
    if (beforeByLoc) return 'before';
    if (afterByLoc) return 'after';
  }
  
  return 'unknown';
}

// 메인 초기화 함수
function initPackagingAnalysis() {
  try {
    console.log('🚀 ===== INITIALIZING PACKAGING ANALYSIS =====');
    console.log('🚀 Current page:', window.location.pathname);
    
    if (window.PackagingAnalysis.initialized) {
      console.log('⚠️ Already initialized, skipping...');
      return;
    }
    
    // 이벤트 리스너 설정
    setupPackagingEventListeners();
    
    // 데이터 로드
    loadPackagingData();
    
    window.PackagingAnalysis.initialized = true;
    console.log('✅ Packaging analysis system initialized');
    
  } catch (error) {
    console.error('❌ Error initializing packaging analysis:', error);
  }
}

// 이벤트 리스너 설정
function setupPackagingEventListeners() {
  try {
    console.log('🔧 Setting up packaging event listeners...');
    
    // 새로고침 버튼
    const refreshBtn = document.getElementById('refreshDataBtn');
    if (refreshBtn) {
      refreshBtn.onclick = loadPackagingData;
      console.log('✅ Refresh button listener added');
    }
    
    // Location 필터
    const locationFilter = document.getElementById('locationFilter');
    if (locationFilter) {
      locationFilter.onchange = applyPackagingFilter;
      console.log('✅ Location filter listener added');
    }
    
    // Excel 내보내기 버튼
    const exportBtn = document.getElementById('exportExcelBtn');
    if (exportBtn) {
      exportBtn.onclick = exportPackagingData;
      console.log('✅ Export button listener added');
    }
    
    console.log('✅ All event listeners set up');
    
  } catch (error) {
    console.error('❌ Error setting up event listeners:', error);
  }
}

// 데이터 로드
async function loadPackagingData() {
  try {
    console.log('📊 ===== LOADING PACKAGING DATA =====');
    
    const supabaseClient = window.sb || window.supabase;
    if (!supabaseClient) {
      throw new Error('Supabase client not available');
    }
    
    console.log('📊 Loading data from Supabase...');
      const { data, error } = await supabaseClient
        .from('vwtm_list_data')
        .select('*')
        .order('upload_time', { ascending: false });
      
      if (error) {
        throw new Error(`Database error: ${error.message}`);
      }
      
    const allData = data || [];
    console.log(`📊 Loaded ${allData.length} records from database`);
    
    if (allData.length === 0) {
      console.log('📭 No data found, creating sample data...');
      // 샘플 데이터 생성
      const sampleData = [
        { part_no: 'TEST001', rack_no: 'LHSAA01', location: 'LHSAA', pallet_no: 'P001', hold_whether: 'N' },
        { part_no: 'TEST002', rack_no: 'LHSAB01', location: 'LHSAB', pallet_no: 'P002', hold_whether: 'N' },
        { part_no: 'TEST003', rack_no: 'LHSAC01', location: 'LHSAC', pallet_no: 'P003', hold_whether: 'N' },
        { part_no: 'TEST004', rack_no: 'LHSAD01', location: 'LHSAD', pallet_no: 'P004', hold_whether: 'N' },
        { part_no: 'TEST005', rack_no: 'LHSBA01', location: 'LHSBA', pallet_no: 'P005', hold_whether: 'N' },
        { part_no: 'TEST006', rack_no: 'LHSBB01', location: 'LHSBB', pallet_no: 'P006', hold_whether: 'N' },
        { part_no: 'TEST007', rack_no: 'LHSBC01', location: 'LHSBC', pallet_no: 'P007', hold_whether: 'N' },
        { part_no: 'TEST008', rack_no: 'LHSBD01', location: 'LHSBD', pallet_no: 'P008', hold_whether: 'N' }
      ];
      window.PackagingAnalysis.allData = sampleData;
    } else {
      window.PackagingAnalysis.allData = allData;
    }
    
    // 필터 옵션 채우기
    populateFilterOptions();
    
    // 필터 적용
    applyPackagingFilter();
    
    console.log('✅ Data loading completed');
    
  } catch (error) {
    console.error('❌ Error loading packaging data:', error);
    updateStatus('데이터 로딩 실패: ' + error.message, 'error');
  }
}

// 필터 옵션 채우기
function populateFilterOptions() {
  try {
    console.log('🔧 Populating filter options...');
    
    const uniqueLocations = [...new Set(window.PackagingAnalysis.allData.map(item => item.location).filter(Boolean))];
    
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
    
    console.log(`✅ Filter options populated: ${uniqueLocations.length} locations`);
    
  } catch (error) {
    console.error('❌ Error populating filter options:', error);
  }
}

// 필터 적용
function applyPackagingFilter() {
  try {
    console.log('🔍 ===== APPLYING PACKAGING FILTER =====');
    
    const locationFilter = document.getElementById('locationFilter');
    let filtered = [...window.PackagingAnalysis.allData];
    
    // Location 필터 적용
    if (locationFilter && locationFilter.value) {
      filtered = filtered.filter(item => item.location === locationFilter.value);
    }
    
    // Hold Whether 'N' 필터 적용
    filtered = filtered.filter(item => item.hold_whether === 'N');
    
    window.PackagingAnalysis.filteredData = filtered;
    console.log(`🔍 Filter applied: ${filtered.length} records`);
    
    // 분석 수행
    performPackagingAnalysis();
    
    updateStatus(`필터 적용됨: ${filtered.length}개 레코드`);
    
  } catch (error) {
    console.error('❌ Error applying filter:', error);
    updateStatus('필터 적용 실패: ' + error.message, 'error');
  }
}

// 포장 분석 수행
function performPackagingAnalysis() {
  try {
    console.log('📊 ===== PERFORMING PACKAGING ANALYSIS =====');
    
    const data = window.PackagingAnalysis.filteredData;
    if (!data || data.length === 0) {
      console.log('📭 No data to analyze');
      displayPackagingResults([]);
      updatePackagingSummary([]);
      return;
    }
    
    // Part No별로 그룹화
    const partGroups = {};
    
    data.forEach(item => {
      const partNo = item.part_no;
      if (!partNo) return;
      
      if (!partGroups[partNo]) {
        partGroups[partNo] = {
          partNo: partNo,
          beforePackaging: 0,
          afterPackaging: 0,
          total: 0,
          items: []
        };
      }
      
      const packagingStatus = determinePackagingStatus(item.rack_no, item.location);
      const isBefore = packagingStatus === 'before';
      const isAfter = packagingStatus === 'after';
      
      partGroups[partNo].items.push({
        palletNo: item.pallet_no,
        rackNo: item.rack_no,
        location: item.location,
        isBeforePackaging: isBefore,
        isAfterPackaging: isAfter
      });
      
      if (isBefore) {
        partGroups[partNo].beforePackaging++;
      } else if (isAfter) {
        partGroups[partNo].afterPackaging++;
      }
      
      partGroups[partNo].total++;
    });
    
    const results = Object.values(partGroups).sort((a, b) => a.partNo.localeCompare(b.partNo));
    
    console.log(`✅ Analysis completed: ${results.length} part numbers`);
    
    // 결과 표시
    displayPackagingResults(results);
    updatePackagingSummary(results);
    
    // 결과 캐시
    window.PackagingAnalysis.lastAnalysisResults = results;
    
  } catch (error) {
    console.error('❌ Error performing packaging analysis:', error);
    updateStatus('분석 실패: ' + error.message, 'error');
  }
}

// 결과 표시
function displayPackagingResults(results) {
  try {
    console.log('📋 ===== DISPLAYING PACKAGING RESULTS =====');
    console.log('📋 Results:', results);
    
    const tableBody = document.getElementById('resultsTable');
    const resultCount = document.getElementById('resultCount');
    
    if (!tableBody || !resultCount) {
      console.error('❌ Required DOM elements not found');
      return;
    }
    
    if (results.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="4" class="px-6 py-4 text-center text-gray-500">
            분석 결과가 없습니다.
          </td>
        </tr>
      `;
      resultCount.textContent = '결과 없음';
      return;
    }
    
    resultCount.textContent = `Found ${results.length} part numbers`;
    
    const tableRows = results.map(result => `
      <tr class="hover:bg-gray-50">
        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
          ${result.partNo || 'N/A'}
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
            ${result.beforePackaging || 0}개
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
            ${result.afterPackaging || 0}개
          </span>
        </td>
        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
          <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
            ${result.total || 0}개
          </span>
        </td>
      </tr>
    `);
    
    tableBody.innerHTML = tableRows.join('');
    
    console.log(`✅ Results displayed: ${results.length} rows`);
    
  } catch (error) {
    console.error('❌ Error displaying results:', error);
  }
}

// 요약 업데이트
function updatePackagingSummary(results) {
  try {
    console.log('📊 Updating packaging summary...');
    
    const totalBefore = results.reduce((sum, r) => sum + (r.beforePackaging || 0), 0);
    const totalAfter = results.reduce((sum, r) => sum + (r.afterPackaging || 0), 0);
    const totalItems = results.reduce((sum, r) => sum + (r.total || 0), 0);
    
    const summaryBefore = document.getElementById('summaryBefore');
    const summaryAfter = document.getElementById('summaryAfter');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summaryBefore) {
      summaryBefore.innerHTML = `
        <div class="text-2xl font-bold text-orange-600">${totalBefore}</div>
        <div class="ml-3">
          <div class="text-sm text-gray-500">포장 전</div>
        </div>
      `;
    }
    
    if (summaryAfter) {
      summaryAfter.innerHTML = `
        <div class="text-2xl font-bold text-green-600">${totalAfter}</div>
        <div class="ml-3">
          <div class="text-sm text-gray-500">포장 후</div>
        </div>
      `;
    }
    
    if (summaryTotal) {
      summaryTotal.innerHTML = `
        <div class="text-2xl font-bold text-blue-600">${totalItems}</div>
        <div class="ml-3">
          <div class="text-sm text-gray-500">합계</div>
        </div>
      `;
    }
    
    console.log(`✅ Summary updated: Before: ${totalBefore}, After: ${totalAfter}, Total: ${totalItems}`);
    
  } catch (error) {
    console.error('❌ Error updating summary:', error);
  }
}

// 상태 업데이트
function updateStatus(message, type = 'info') {
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
    console.error('❌ Error updating status:', error);
  }
}

// Excel 내보내기
async function exportPackagingData() {
  try {
    console.log('📦 Exporting packaging data...');
    
    const results = window.PackagingAnalysis.lastAnalysisResults;
    if (!results || results.length === 0) {
      console.warn('⚠️ 내보낼 데이터가 없습니다.');
      return;
    }
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('포장 분석 결과');
    
    // 헤더 추가
    const headers = ['Part No', '포장 전', '포장 후', '합계'];
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // 데이터 추가
    results.forEach(result => {
      worksheet.addRow([
        result.partNo,
        result.beforePackaging,
        result.afterPackaging,
        result.total
      ]);
    });
    
    // 파일 다운로드
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `포장분석결과_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('✅ Export completed');
    updateStatus('Excel 내보내기 완료', 'success');
    
  } catch (error) {
    console.error('❌ Error exporting data:', error);
    updateStatus('내보내기 실패: ' + error.message, 'error');
  }
}

// 테이블 정렬
function sortPackagingTable(column) {
  try {
    console.log(`🔍 Sorting by column: ${column}`);
    
    if (window.PackagingAnalysis.currentSortColumn === column) {
      window.PackagingAnalysis.currentSortDirection = 
        window.PackagingAnalysis.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      window.PackagingAnalysis.currentSortColumn = column;
      window.PackagingAnalysis.currentSortDirection = 'asc';
    }
    
    const results = [...window.PackagingAnalysis.lastAnalysisResults];
    results.sort((a, b) => {
      let aVal = a[column] || '';
      let bVal = b[column] || '';
      
      if (['beforePackaging', 'afterPackaging', 'total'].includes(column)) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      
      if (aVal < bVal) return window.PackagingAnalysis.currentSortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return window.PackagingAnalysis.currentSortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    displayPackagingResults(results);
    updatePackagingSummary(results);
    
    console.log(`✅ Sorted by ${column} (${window.PackagingAnalysis.currentSortDirection})`);
    
  } catch (error) {
    console.error('❌ Error sorting table:', error);
  }
}

// 전역 함수로 등록 (고유한 이름 사용)
window.initPackagingAnalysis = initPackagingAnalysis;
window.loadPackagingData = loadPackagingData;
window.applyPackagingFilter = applyPackagingFilter;
window.displayPackagingResults = displayPackagingResults;
window.exportPackagingData = exportPackagingData;
window.sortPackagingTable = sortPackagingTable;

// DOM 로드 후 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPackagingAnalysis);
} else {
  initPackagingAnalysis();
}

console.log('📦 ===== PACKAGING ANALYSIS SYSTEM LOADED =====');
