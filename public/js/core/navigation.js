/**
 * Navigation Manager
 * Handles page loading and navigation in the new architecture
 */

class NavigationManager {
    constructor() {
        this.currentPage = null;
        this.pageModules = new Map();
        this.isInitialized = false;
        this.init();
    }

    async init() {
        try {
            console.log('🧭 Initializing Navigation Manager...');
            
            this.setupEventListeners();
            this.registerPageModules();
            this.isInitialized = true;
            
            console.log('✅ Navigation Manager initialized');
            
        } catch (error) {
            console.error('❌ Navigation Manager init failed:', error);
        }
    }

    setupEventListeners() {
        try {
            console.log('🔗 Setting up navigation event listeners...');
            
            // 사이드바 토글
            const sidebarToggle = TMUtils.getElement('sidebarToggle');
            if (sidebarToggle) {
                console.log('✅ Sidebar toggle button found');
                TMUtils.addSafeEventListener(sidebarToggle, 'click', () => {
                    console.log('🔄 Sidebar toggle clicked');
                    this.toggleSidebar();
                });
            } else {
                console.warn('⚠️ Sidebar toggle button not found');
            }

            // 네비게이션 링크들 - DOM이 로드된 후에 설정
            this.setupNavigationLinks();

            // 시스템 상태 버튼
            const systemStatusBtn = TMUtils.getElement('systemStatusBtn');
            if (systemStatusBtn) {
                console.log('✅ System status button found');
                TMUtils.addSafeEventListener(systemStatusBtn, 'click', () => {
                    console.log('🔄 System status button clicked');
                    this.showSystemStatus();
                });
            } else {
                console.warn('⚠️ System status button not found');
            }
            
            console.log('✅ Event listeners setup completed');
            
        } catch (error) {
            console.error('❌ Error setting up event listeners:', error);
        }
    }

    setupNavigationLinks() {
        try {
            console.log('🔗 Setting up navigation links...');
            
            // 모든 네비게이션 링크 찾기
            const navLinks = document.querySelectorAll('[data-page]');
            console.log(`📋 Found ${navLinks.length} navigation links:`, navLinks);
            
            navLinks.forEach((link, index) => {
                const pageName = link.getAttribute('data-page');
                console.log(`🔗 Setting up link ${index + 1}: ${pageName}`);
                
                // 기존 이벤트 리스너 제거 (중복 방지)
                link.removeEventListener('click', this.handleNavLinkClick);
                
                // 새 이벤트 리스너 추가
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log(`🔄 Navigation link clicked: ${pageName}`);
                    this.loadPage(pageName);
                });
                
                console.log(`✅ Link ${pageName} setup completed`);
            });
            
            console.log('✅ All navigation links setup completed');
            
        } catch (error) {
            console.error('❌ Error setting up navigation links:', error);
        }
    }

    registerPageModules() {
        // FIFO 시스템 모듈들
        this.pageModules.set('fifo-upload', {
            path: 'pages/fifo/upload.html',
            script: 'js/fifo/upload.js',
            title: 'FIFO Data Upload'
        });

        this.pageModules.set('fifo-list', {
            path: 'pages/fifo/list.html',
            script: 'js/fifo/list.js',
            title: 'FIFO Data List'
        });

        this.pageModules.set('fifo-analysis', {
            path: 'pages/fifo/analysis.html',
            script: 'js/fifo/analysis.js',
            title: 'FIFO Analysis'
        });

        // 트럭 시스템 모듈들
        this.pageModules.set('truck-management', {
            path: 'pages/truck/management.html',
            script: 'js/truck/management.js',
            title: 'Truck Management'
        });

        this.pageModules.set('truck-status', {
            path: 'pages/truck/status.html',
            script: 'js/truck/status.js',
            title: 'Truck Status'
        });
    }

    async loadPage(pageName) {
        try {
            console.log(`🔄 Loading page: ${pageName}`);
            
            const pageModule = this.pageModules.get(pageName);
            if (!pageModule) {
                throw new Error(`Page module ${pageName} not found`);
            }

            // 페이지 로딩 시작
            this.showLoadingState();

            // HTML 콘텐츠 로드
            const htmlContent = await this.fetchPageContent(pageModule.path);
            
            // 메인 콘텐츠 영역 업데이트
            this.updateMainContent(htmlContent, pageModule.title);
            
            // JavaScript 모듈 로드
            await this.loadPageScript(pageModule.script);
            
            // 페이지 로딩 완료
            this.hideLoadingState();
            this.updateActiveNavigation(pageName);
            
            console.log(`✅ Page ${pageName} loaded successfully`);
            
        } catch (error) {
            console.error(`❌ Failed to load page ${pageName}:`, error);
            this.showErrorState(error);
        }
    }

    async fetchPageContent(pagePath) {
        try {
            const response = await fetch(pagePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return await response.text();
        } catch (error) {
            throw new Error(`Failed to fetch page content: ${error.message}`);
        }
    }

    updateMainContent(htmlContent, title) {
        const mainContent = TMUtils.getElement('mainContent');
        if (!mainContent) {
            throw new Error('Main content area not found');
        }

        // 페이지 제목 업데이트
        const pageTitle = document.querySelector('.page-title');
        if (pageTitle) {
            pageTitle.textContent = title;
        }

        // HTML 콘텐츠 삽입
        mainContent.innerHTML = htmlContent;

        // 인라인 스크립트 실행
        this.executeInlineScripts(mainContent);
    }

    async loadPageScript(scriptPath) {
        try {
            // 기존 스크립트 제거
            const existingScript = document.querySelector(`script[src="${scriptPath}"]`);
            if (existingScript) {
                existingScript.remove();
            }

            // FIFO 업로드 모듈의 경우 중복 로딩 방지
            if (scriptPath.includes('fifo/upload.js') && window.fifoUploadModule) {
                console.log('⚠️ FIFO Upload Module already loaded, skipping script load');
                return;
            }

            // 새 스크립트 로드
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = scriptPath;
                script.onload = () => {
                    console.log(`✅ Script loaded: ${scriptPath}`);
                    resolve();
                };
                script.onerror = (error) => {
                    console.error(`❌ Script load failed: ${scriptPath}`, error);
                    reject(error);
                };
                document.body.appendChild(script);
            });
        } catch (error) {
            throw new Error(`Script loading failed: ${error.message}`);
        }
    }

    executeInlineScripts(container) {
        try {
            const scripts = container.querySelectorAll('script');
            scripts.forEach(script => {
                if (script.textContent.trim()) {
                    try {
                        eval(script.textContent);
                    } catch (error) {
                        console.error('❌ Inline script execution failed:', error);
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error executing inline scripts:', error);
        }
    }

    showLoadingState() {
        const loadingIndicator = TMUtils.getElement('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('hidden');
        }
    }

    hideLoadingState() {
        const loadingIndicator = TMUtils.getElement('loadingIndicator');
        if (loadingIndicator) {
            loadingIndicator.classList.add('hidden');
        }
    }

    showErrorState(error) {
        const mainContent = TMUtils.getElement('mainContent');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="error-page">
                    <h2>⚠️ Page Load Error</h2>
                    <p>${error.message}</p>
                    <button onclick="location.reload()" class="btn btn-primary">
                        Refresh Page
                    </button>
                </div>
            `;
        }
    }

    updateActiveNavigation(activePage) {
        // 모든 네비게이션 링크에서 active 클래스 제거
        const navLinks = document.querySelectorAll('[data-page]');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

        // 현재 활성 페이지에 active 클래스 추가
        const activeLink = document.querySelector(`[data-page="${activePage}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    toggleSidebar() {
        const sidebar = TMUtils.getElement('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('collapsed');
        }
    }

    showSystemStatus() {
        const status = {
            navigation: this.isInitialized ? 'ready' : 'initializing',
            database: window.dbManager ? window.dbManager.isReady() ? 'connected' : 'disconnected' : 'not_loaded',
            systems: window.systemManager ? window.systemManager.getAllSystemStatus() : 'not_loaded'
        };

        console.log('📊 System Status:', status);
        
        // 사용자에게 상태 표시
        const statusText = `
            🧭 Navigation: ${status.navigation}
            🔗 Database: ${status.database}
            ⚙️ Systems: ${JSON.stringify(status.systems, null, 2)}
        `;
        
        TMUtils.showStatus(statusText, 'info');
    }

    // 페이지 모듈 상태 확인
    getPageModuleStatus(pageName) {
        const module = this.pageModules.get(pageName);
        return module ? 'registered' : 'not_found';
    }

    // 모든 페이지 모듈 상태 확인
    getAllPageModuleStatus() {
        const status = {};
        for (const [name] of this.pageModules) {
            status[name] = this.getPageModuleStatus(name);
        }
        return status;
    }
}

// 전역 네비게이션 관리자 생성
window.navigationManager = new NavigationManager();

console.log('✅ Navigation Manager loaded');
