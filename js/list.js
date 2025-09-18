// Supabase 설정은 supabase-config.js에서 가져옴

// 데이터 설정 (페이지네이션 제거)
let currentPage = 1;
const itemsPerPage = 100; // 한 페이지당 100개로 증가 (더 많은 데이터 표시)
let allData = [];
let filteredData = [];
let totalCount = 0;
let isAdvancedFilterActive = false;

// 안전한 DOM 요소 접근 함수
function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with id '${id}' not found`);
        return null;
    }
    return element;
}

// 페이지 로드 시 데이터 불러오기
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing list functionality...');
    
    // Supabase 연결 확인
    if (typeof sb === 'undefined') {
        console.error('Supabase client not found!');
        return;
    }
    
    console.log('Supabase client found, proceeding with initialization...');
    
    // 약간의 지연 후 초기화 (DOM이 완전히 준비되도록)
    setTimeout(() => {
        loadData();
        setupSearch();
        setupAdvancedFilter();
        setupButtonListeners();
    }, 100);
});

// 버튼 이벤트 리스너 설정 (onclick 방식으로 변경되어 불필요)
function setupButtonListeners() {
    console.log('Button listeners not needed - using onclick attributes');
}

// 검색 기능 제거 - 고급 필터만 사용
function setupSearch() {
    console.log('Search functionality removed - using advanced filter only');
}

// 고급 필터 설정
function setupAdvancedFilter() {
    // Enter 키로 필터 적용
    const filterInputs = ['filterPalletNo', 'filterLocation', 'filterRackNo', 'filterTmNo', 'filterPartNo', 'filterHoldWhether'];
    filterInputs.forEach(id => {
        const element = getElement(id);
        if (element) {
            element.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    applyAdvancedFilter();
                }
            });
        }
    });
    
    console.log('Advanced filter functionality initialized');
}

// 고급 필터 패널 토글
function toggleAdvancedFilter() {
    console.log('toggleAdvancedFilter called');
    const panel = getElement('advancedFilterPanel');
    const btn = getElement('filterToggleBtn');
    
    if (!panel || !btn) {
        console.error('Filter panel or button not found');
        return;
    }
    
    if (panel.classList.contains('hidden')) {
        panel.classList.remove('hidden');
        btn.textContent = '🔧 필터 숨기기';
        btn.classList.remove('bg-gray-600', 'hover:bg-gray-700');
        btn.classList.add('bg-blue-600', 'hover:bg-blue-700');
        console.log('Filter panel shown');
    } else {
        panel.classList.add('hidden');
        btn.textContent = '🔧 고급 필터';
        btn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
        btn.classList.add('bg-gray-600', 'hover:bg-gray-700');
        console.log('Filter panel hidden');
    }
}

// 고급 필터 적용
async function applyAdvancedFilter() {
    console.log('Applying advanced filter...');
    showLoading(true);
    isAdvancedFilterActive = true;
    
    try {
        let query = sb.from('vwtm_list_data').select('*');
        
        // PALLET NO 필터
        const palletNoInput = getElement('filterPalletNo');
        if (palletNoInput && palletNoInput.value.trim()) {
            const palletNo = palletNoInput.value.trim();
            query = query.ilike('pallet_no', `%${palletNo}%`);
            console.log('Filtering by PALLET NO:', palletNo);
        }
        
        // Location 필터
        const locationInput = getElement('filterLocation');
        if (locationInput && locationInput.value) {
            const location = locationInput.value;
            query = query.eq('location', location);
            console.log('Filtering by Location:', location);
        }
        
        // Rack No 필터
        const rackNoInput = getElement('filterRackNo');
        if (rackNoInput && rackNoInput.value.trim()) {
            const rackNo = rackNoInput.value.trim();
            query = query.ilike('rack_no', `%${rackNo}%`);
            console.log('Filtering by Rack No:', rackNo);
        }
        
        // TM No 필터
        const tmNoInput = getElement('filterTmNo');
        if (tmNoInput && tmNoInput.value.trim()) {
            const tmNo = tmNoInput.value.trim();
            query = query.ilike('tm_no', `%${tmNo}%`);
            console.log('Filtering by TM No:', tmNo);
        }
        
        // Part No 필터
        const partNoInput = getElement('filterPartNo');
        if (partNoInput && partNoInput.value.trim()) {
            const partNo = partNoInput.value.trim();
            query = query.ilike('part_no', `%${partNo}%`);
            console.log('Filtering by Part No:', partNo);
        }
        
        // Hold Whether 필터
        const holdWhetherInput = getElement('filterHoldWhether');
        if (holdWhetherInput && holdWhetherInput.value) {
            const holdWhether = holdWhetherInput.value;
            query = query.eq('hold_whether', holdWhether);
            console.log('Filtering by Hold Whether:', holdWhether);
        }
        
        // 모든 데이터를 가져오기 위해 여러 번 나누어 조회
        let allFilteredData = [];
        let hasMore = true;
        let offset = 0;
        const batchSize = 1000; // 한 번에 1000개씩
        
        while (hasMore) {
            const { data, error } = await query
                .order('upload_time', { ascending: false })
                .range(offset, offset + batchSize - 1);
            
            if (error) {
                console.error('고급 필터 오류:', error);
                showError('필터 적용 중 오류가 발생했습니다.');
                return;
            }
            
            if (data && data.length > 0) {
                allFilteredData = allFilteredData.concat(data);
                offset += batchSize;
                console.log(`Loaded batch: ${data.length} records, total: ${allFilteredData.length}`);
            } else {
                hasMore = false;
            }
            
            // 너무 많은 데이터를 가져오는 것을 방지 (선택사항)
            if (allFilteredData.length >= 50000) {
                console.log('Reached maximum limit of 50,000 records');
                break;
            }
        }
        
        console.log('Total filter results:', allFilteredData.length, 'records');
        allData = allFilteredData;
        filteredData = [...allData];
        currentPage = 1;
        displayData();
        
        // 필터 결과 표시
        showFilterResult();
        
    } catch (error) {
        console.error('고급 필터 오류:', error);
        showError('필터 적용 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 필터 초기화
function clearAdvancedFilter() {
    console.log('Clearing advanced filter...');
    
    // 필터 입력값 초기화
    const filterElements = [
        'filterPalletNo', 'filterLocation', 'filterRackNo', 'filterTmNo', 'filterPartNo', 'filterHoldWhether'
    ];
    
    filterElements.forEach(id => {
        const element = getElement(id);
        if (element) {
            element.value = '';
        }
    });
    
    // 필터 비활성화
    isAdvancedFilterActive = false;
    
    // 전체 데이터 다시 로드
    loadData();
}

// 필터 결과 표시
function showFilterResult() {
    const resultDiv = document.createElement('div');
    resultDiv.id = 'filterResult';
    resultDiv.className = 'mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg';
    
    // 필터 조건 표시
    const filterConditions = [];
    const palletNo = getElement('filterPalletNo')?.value.trim() || '';
    const location = getElement('filterLocation')?.value.trim() || '';
    const rackNo = getElement('filterRackNo')?.value.trim() || '';
    const tmNo = getElement('filterTmNo')?.value.trim() || '';
    const partNo = getElement('filterPartNo')?.value.trim() || '';
    const holdWhether = getElement('filterHoldWhether')?.value || '';
    
    if (palletNo) filterConditions.push(`PALLET NO: ${palletNo}`);
    if (location) filterConditions.push(`Location: ${location}`);
    if (rackNo) filterConditions.push(`Rack No: ${rackNo}`);
    if (tmNo) filterConditions.push(`TM No: ${tmNo}`);
    if (partNo) filterConditions.push(`Part No: ${partNo}`);
    if (holdWhether) filterConditions.push(`Hold Whether: ${holdWhether}`);
    
    resultDiv.innerHTML = `
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <span class="text-blue-600 mr-2">🔍</span>
                <div>
                    <span class="text-sm text-blue-800">
                        필터 결과: <strong>${filteredData.length}</strong>개 데이터
                    </span>
                    ${filterConditions.length > 0 ? `
                        <div class="text-xs text-blue-600 mt-1">
                            조건: ${filterConditions.join(', ')}
                        </div>
                    ` : ''}
                </div>
            </div>
            <button onclick="clearAdvancedFilter()" class="text-blue-600 hover:text-blue-800 text-sm">
                필터 해제
            </button>
        </div>
    `;
    
    // 기존 결과 제거 후 새로 추가
    const existingResult = document.getElementById('filterResult');
    if (existingResult) {
        existingResult.remove();
    }
    
    const filterPanel = getElement('advancedFilterPanel');
    if (filterPanel) {
        filterPanel.parentNode.insertBefore(resultDiv, filterPanel.nextSibling);
    }
}

// 일반 검색 기능 제거됨 - 고급 필터만 사용

// 데이터 불러오기 (서버 사이드 페이지네이션)
async function loadData() {
    console.log('Loading data...');
    showLoading(true);
    isAdvancedFilterActive = false;
    
    try {
        // 전체 개수 먼저 가져오기
        const { count, error: countError } = await sb
            .from('vwtm_list_data')
            .select('*', { count: 'exact', head: true });
        
        if (countError) {
            console.error('개수 조회 오류:', countError);
            showError('데이터를 불러오는 중 오류가 발생했습니다.');
            return;
        }
        
        totalCount = count || 0;
        console.log('Total records:', totalCount);
        
        // 모든 데이터를 가져오기 위해 여러 번 나누어 조회
        let allDataArray = [];
        let hasMore = true;
        let offset = 0;
        const batchSize = 1000; // 한 번에 1000개씩
        
        while (hasMore) {
            const { data, error } = await sb
                .from('vwtm_list_data')
                .select('*')
                .order('upload_time', { ascending: false })
                .range(offset, offset + batchSize - 1);
            
            if (error) {
                console.error('데이터 불러오기 오류:', error);
                showError('데이터를 불러오는 중 오류가 발생했습니다.');
                return;
            }
            
            if (data && data.length > 0) {
                allDataArray = allDataArray.concat(data);
                offset += batchSize;
                console.log(`Loaded batch: ${data.length} records, total: ${allDataArray.length}`);
            } else {
                hasMore = false;
            }
            
            // 너무 많은 데이터를 가져오는 것을 방지 (선택사항)
            if (allDataArray.length >= 50000) {
                console.log('Reached maximum limit of 50,000 records');
                break;
            }
        }
        
        console.log('Loaded data:', allDataArray?.length || 0, 'records');
        allData = allDataArray || [];
        filteredData = [...allData];
        displayData();
        
        // 필터 결과 제거
        const filterResult = document.getElementById('filterResult');
        if (filterResult) {
            filterResult.remove();
        }
        
    } catch (error) {
        console.error('데이터 불러오기 오류:', error);
        showError('데이터를 불러오는 중 오류가 발생했습니다.');
    } finally {
        showLoading(false);
    }
}

// 데이터 표시
function displayData() {
    const tableBody = getElement('dataTableBody');
    const emptyState = getElement('emptyState');
    const pagination = getElement('pagination');
    
    if (!tableBody) {
        console.error('Table body not found');
        return;
    }
    
    if (filteredData.length === 0) {
        tableBody.innerHTML = '';
        if (emptyState) emptyState.classList.remove('hidden');
        if (pagination) pagination.classList.add('hidden');
        return;
    }
    
    if (emptyState) emptyState.classList.add('hidden');
    if (pagination) pagination.classList.remove('hidden');
    
    // 페이지네이션 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageData = filteredData.slice(startIndex, endIndex);
    
    console.log('Displaying data:', pageData.length, 'records on page', currentPage);
    
    // 테이블 데이터 생성
    tableBody.innerHTML = pageData.map(item => `
        <tr class="hover:bg-gray-50">
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${formatDateTime(item.upload_time)}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm font-medium text-gray-900">
                ${item.pallet_no || '-'}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${item.location || '-'}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${item.rack_no || '-'}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${item.tm_no || '-'}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${item.part_no || '-'}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${item.hold_whether || '-'}
            </td>
            <td class="border border-gray-200 px-4 py-3 text-sm text-gray-600">
                ${item.prod_date || '-'}
            </td>
        </tr>
    `).join('');
    
    // 페이지네이션 업데이트
    updatePagination();
    
    // 초기 정렬 아이콘 설정
    updateSortIcons(currentSortColumn);
}

// 페이지네이션 업데이트
function updatePagination() {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const totalCount = getElement('totalCount');
    const itemsPerPageSpan = getElement('itemsPerPage');
    const pageInfo = getElement('pageInfo');
    const prevBtn = getElement('prevBtn');
    const nextBtn = getElement('nextBtn');
    
    if (totalCount) totalCount.textContent = filteredData.length;
    if (itemsPerPageSpan) itemsPerPageSpan.textContent = itemsPerPage;
    if (pageInfo) pageInfo.textContent = `${currentPage} / ${totalPages}`;
    
    if (prevBtn) {
        prevBtn.disabled = currentPage === 1;
        // 기존 이벤트 리스너 제거 후 새로 추가
        prevBtn.replaceWith(prevBtn.cloneNode(true));
        const newPrevBtn = getElement('prevBtn');
        if (newPrevBtn) {
            newPrevBtn.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    displayData();
                }
            });
        }
    }
    
    if (nextBtn) {
        nextBtn.disabled = currentPage === totalPages;
        // 기존 이벤트 리스너 제거 후 새로 추가
        nextBtn.replaceWith(nextBtn.cloneNode(true));
        const newNextBtn = getElement('nextBtn');
        if (newNextBtn) {
            newNextBtn.addEventListener('click', () => {
                if (currentPage < totalPages) {
                    currentPage++;
                    displayData();
                }
            });
        }
    }
}

// 날짜/시간 포맷팅
function formatDateTime(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// 로딩 상태 표시
function showLoading(show) {
    const loadingState = getElement('loadingState');
    const tableBody = getElement('dataTableBody');
    
    if (show) {
        if (loadingState) loadingState.classList.remove('hidden');
        if (tableBody) tableBody.innerHTML = '';
    } else {
        if (loadingState) loadingState.classList.add('hidden');
    }
}

// 오류 메시지 표시
function showError(message) {
    const tableBody = getElement('dataTableBody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="border border-gray-200 px-4 py-8 text-center text-red-600">
                    ❌ ${message}
                </td>
            </tr>
        `;
    }
}

// 필터된 데이터 내보내기
function exportFilteredData() {
    if (filteredData.length === 0) {
        alert('내보낼 데이터가 없습니다.');
        return;
    }
    
    // CSV 헤더
    const headers = [
        '업로드 시간',
        'PALLET NO',
        'Location',
        'Rack No',
        'TM No',
        'Part No',
        'Hold Whether',
        'Prod Date'
    ];
    
    // CSV 데이터 생성
    const csvData = filteredData.map(item => [
        formatDateTime(item.upload_time),
        item.pallet_no || '',
        item.location || '',
        item.rack_no || '',
        item.tm_no || '',
        item.part_no || '',
        item.hold_whether || '',
        item.prod_date || ''
    ]);
    
    // CSV 문자열 생성
    const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // 파일 다운로드
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `filtered_data_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// 정렬 관련 변수
let currentSortColumn = 'upload_time';
let currentSortDirection = 'desc';

// 테이블 정렬
function sortTable(column) {
    if (filteredData.length === 0) return;
    
    // 정렬 방향 결정
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'asc';
    }
    
    // 데이터 정렬
    filteredData.sort((a, b) => {
        let aVal = a[column] || '';
        let bVal = b[column] || '';
        
        // 날짜 필드인 경우
        if (column === 'upload_time' || column === 'prod_date') {
            aVal = new Date(aVal || '1900-01-01');
            bVal = new Date(bVal || '1900-01-01');
        } else {
            // 문자열 필드인 경우
            aVal = String(aVal).toLowerCase();
            bVal = String(bVal).toLowerCase();
        }
        
        if (aVal < bVal) return currentSortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return currentSortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    // 정렬 아이콘 업데이트
    updateSortIcons(column);
    
    // 페이지 초기화 및 데이터 표시
    currentPage = 1;
    displayData();
}

// 정렬 아이콘 업데이트
function updateSortIcons(activeColumn) {
    const columns = ['upload_time', 'pallet_no', 'location', 'rack_no', 'tm_no', 'part_no', 'hold_whether', 'prod_date'];
    
    columns.forEach(col => {
        const icon = getElement(`sort-${col}`);
        if (icon) {
            if (col === activeColumn) {
                icon.textContent = currentSortDirection === 'asc' ? '↑' : '↓';
                icon.className = 'ml-1 text-blue-600 font-bold';
            } else {
                icon.textContent = '↕';
                icon.className = 'ml-1 text-gray-400';
            }
        }
    });
}

// 전역 함수로 노출 (모든 함수 정의 후에 실행)
window.toggleAdvancedFilter = toggleAdvancedFilter;
window.applyAdvancedFilter = applyAdvancedFilter;
window.clearAdvancedFilter = clearAdvancedFilter;
window.exportFilteredData = exportFilteredData;
window.loadData = loadData;
window.sortTable = sortTable;
