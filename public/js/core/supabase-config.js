/**
 * Supabase Configuration for NEW Architecture
 * Centralized Supabase connection settings with offline fallback
 */

// Supabase 프로젝트 설정
const SUPABASE_URL = 'https://wfnihtmmaebgjtdmazmo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbmlodG1tYWViZ2p0ZG1hem1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY3NTcsImV4cCI6MjA2NTMzMjc1N30.FYfdgSvOT1qUvANGlqXCEGvSR2JujggU7T_Sjzys3HQ';

// Supabase 클라이언트 생성
let supabaseClient = null;
let isOfflineMode = false;
let connectionRetries = 0;
const MAX_RETRIES = 3;

// 오프라인 모드 데이터 저장소
let offlineDataStore = {
    pendingUploads: [],
    lastSyncTime: null
};

// Supabase 클라이언트 초기화
function initializeSupabase() {
    try {
        console.log('🔗 Attempting to initialize Supabase client...');
        
        if (typeof window.supabase !== 'undefined') {
            // Supabase v2 클라이언트 생성
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                },
                realtime: {
                    params: {
                        eventsPerSecond: 10
                    }
                }
            });
            
            console.log('✅ Supabase client initialized successfully');
            
            // 전역 객체에 할당
            window.supabase = supabaseClient;
            window.sb = supabaseClient;
            
            return true;
        } else {
            throw new Error('Supabase library not loaded');
        }
    } catch (error) {
        console.error('❌ Failed to initialize Supabase client:', error);
        enableOfflineMode();
        return false;
    }
}

// 오프라인 모드 활성화
function enableOfflineMode() {
    isOfflineMode = true;
    console.log('⚠️ Supabase connection failed, enabling offline mode');
    
    // 오프라인 모드에서도 기본 기능은 작동하도록
    window.supabase = createOfflineSupabaseClient();
    window.sb = window.supabase;
}

// 오프라인 모드용 가짜 Supabase 클라이언트 생성
function createOfflineSupabaseClient() {
    return {
        from: (table) => ({
            select: () => ({
                data: [],
                error: { message: 'Offline mode - no data available' }
            }),
            insert: (data) => {
                // 오프라인 데이터 저장
                offlineDataStore.pendingUploads.push({
                    table,
                    data,
                    timestamp: new Date().toISOString()
                });
                console.log('📦 Data queued for upload when connection is restored');
                return { data: data.length, error: null };
            }
        }),
        isOffline: () => true
    };
}

// 연결 상태 확인 함수
async function checkSupabaseConnection() {
    try {
        if (!supabaseClient || isOfflineMode) {
            console.error('❌ Supabase client not available');
            return false;
        }

        // 간단한 연결 테스트
        const { data, error } = await supabaseClient
            .from('vwtm_list_data')
            .select('count', { count: 'exact', head: true })
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection error:', error);
            if (connectionRetries < MAX_RETRIES) {
                connectionRetries++;
                console.log(`🔄 Retrying connection (${connectionRetries}/${MAX_RETRIES})...`);
                await new Promise(resolve => setTimeout(resolve, 1000 * connectionRetries));
                return checkSupabaseConnection();
            } else {
                enableOfflineMode();
                return false;
            }
        }

        connectionRetries = 0;
        console.log('✅ Supabase connection successful');
        return true;
        
    } catch (error) {
        console.error('❌ Supabase connection failed:', error);
        
        if (connectionRetries < MAX_RETRIES) {
            connectionRetries++;
            console.log(`🔄 Retrying connection (${connectionRetries}/${MAX_RETRIES})...`);
            await new Promise(resolve => setTimeout(resolve, 1000 * connectionRetries));
            return checkSupabaseConnection();
        } else {
            enableOfflineMode();
            return false;
        }
    }
}

// 연결 복구 시도
async function attemptReconnection() {
    try {
        console.log('🔄 Attempting to reconnect to Supabase...');
        
        if (isOfflineMode) {
            isOfflineMode = false;
            connectionRetries = 0;
            
            if (initializeSupabase()) {
                const isConnected = await checkSupabaseConnection();
                if (isConnected) {
                    console.log('🎉 Reconnection successful!');
                    await syncOfflineData();
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('❌ Reconnection failed:', error);
        enableOfflineMode();
        return false;
    }
}

// 오프라인 데이터 동기화
async function syncOfflineData() {
    if (offlineDataStore.pendingUploads.length === 0) return;
    
    try {
        console.log(`📤 Syncing ${offlineDataStore.pendingUploads.length} pending uploads...`);
        
        for (const pendingUpload of offlineDataStore.pendingUploads) {
            try {
                const { data, error } = await supabaseClient
                    .from(pendingUpload.table)
                    .insert(pendingUpload.data);
                
                if (error) {
                    console.error('❌ Failed to sync pending upload:', error);
                } else {
                    console.log('✅ Pending upload synced successfully');
                }
            } catch (error) {
                console.error('❌ Error syncing pending upload:', error);
            }
        }
        
        // 동기화 완료 후 오프라인 데이터 초기화
        offlineDataStore.pendingUploads = [];
        offlineDataStore.lastSyncTime = new Date().toISOString();
        
        console.log('🎉 Offline data sync completed');
        
    } catch (error) {
        console.error('❌ Offline data sync failed:', error);
    }
}

// Supabase 클라이언트 가져오기
function getSupabaseClient() {
    if (!supabaseClient && !isOfflineMode) {
        throw new Error('Supabase client not initialized');
    }
    return window.supabase;
}

// 연결 상태 확인
function getConnectionStatus() {
    return {
        isConnected: !isOfflineMode && supabaseClient !== null,
        isOffline: isOfflineMode,
        pendingUploads: offlineDataStore.pendingUploads.length,
        lastSyncTime: offlineDataStore.lastSyncTime
    };
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔗 Initializing Supabase configuration...');
    
    // 약간의 지연 후 초기화 (다른 스크립트들이 로드될 시간 확보)
    setTimeout(async () => {
        if (initializeSupabase()) {
            // 연결 확인
            const isConnected = await checkSupabaseConnection();
            if (isConnected) {
                console.log('🎉 Supabase system ready');
            } else {
                console.error('❌ Supabase system failed to connect, using offline mode');
            }
        } else {
            console.log('⚠️ Using offline mode due to initialization failure');
        }
    }, 200);
    
    // 주기적으로 연결 상태 확인 (5분마다)
    setInterval(async () => {
        if (isOfflineMode) {
            await attemptReconnection();
        }
    }, 5 * 60 * 1000);
});

// 전역 함수들 노출
window.initializeSupabase = initializeSupabase;
window.checkSupabaseConnection = checkSupabaseConnection;
window.getSupabaseClient = getSupabaseClient;
window.attemptReconnection = attemptReconnection;
window.getConnectionStatus = getConnectionStatus;
window.syncOfflineData = syncOfflineData;

console.log('✅ Supabase Configuration loaded with offline support');
