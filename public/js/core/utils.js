/**
 * TM System Common Utilities
 * Centralized utility functions for all modules
 */

window.TMUtils = {
    // DOM 요소 안전하게 가져오기
    getElement: (id, fallback = null) => {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`⚠️ Element ${id} not found`);
            return fallback;
        }
        return element;
    },

    // 전역 함수 안전하게 등록
    registerGlobalFunction: (name, func) => {
        if (window[name]) {
            console.warn(`⚠️ Global function ${name} already exists, overwriting`);
        }
        window[name] = func;
        console.log(`✅ Global function ${name} registered`);
    },

    // 이벤트 리스너 안전하게 추가
    addSafeEventListener: (element, event, handler) => {
        if (element && typeof handler === 'function') {
            element.addEventListener(event, handler);
            return true;
        }
        console.error(`❌ Failed to add event listener for ${event}`);
        return false;
    },

    // 상태 메시지 표시
    showStatus: (message, type = 'info', elementId = 'status') => {
        try {
            const statusDiv = document.getElementById(elementId);
            if (!statusDiv) {
                console.log(`[${type.toUpperCase()}] ${message}`);
                return;
            }

            const bgColor = {
                'info': 'bg-blue-100 border-blue-400 text-blue-700',
                'success': 'bg-green-100 border-green-400 text-green-700',
                'error': 'bg-red-100 border-red-400 text-red-700',
                'warning': 'bg-yellow-100 border-yellow-400 text-yellow-700'
            }[type] || 'bg-blue-100 border-blue-400 text-blue-700';

            statusDiv.innerHTML = `
                <div class="border rounded-md p-4 ${bgColor}">
                    ${message}
                </div>
            `;

            // Auto-hide success messages
            if (type === 'success') {
                setTimeout(() => {
                    if (statusDiv) statusDiv.innerHTML = '';
                }, 5000);
            }
        } catch (error) {
            console.error('Error in showStatus:', error);
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    },

    // 로딩 상태 표시
    showLoading: (elementId = 'loadingProgress') => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('hidden');
        }
    },

    hideLoading: (elementId = 'loadingProgress') => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('hidden');
        }
    },

    // 배열 안전하게 복사
    safeArrayCopy: (array) => {
        if (!Array.isArray(array)) return [];
        return JSON.parse(JSON.stringify(array));
    },

    // 에러 처리 표준화
    handleError: (error, context = 'Unknown') => {
        console.error(`❌ Error in ${context}:`, error);
        return {
            success: false,
            error: error.message || 'Unknown error occurred',
            context
        };
    }
};

console.log('✅ TM Utils loaded');
