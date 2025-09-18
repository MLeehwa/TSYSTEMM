// 공통 Supabase 설정
const SUPABASE_URL = 'https://wfnihtmmaebgjtdmazmo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndmbmlodG1tYWViZ2p0ZG1hem1vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk3NTY3NTcsImV4cCI6MjA2NTMzMjc1N30.FYfdgSvOT1qUvANGlqXCEGvSR2JujggU7T_Sjzys3HQ';

// Supabase 클라이언트 생성
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 연결 상태 확인 함수
async function checkSupabaseConnection() {
    try {
        const { data, error } = await sb.from('vwtm_list_data').select('count', { count: 'exact', head: true });
        if (error) {
            console.error('Supabase 연결 오류:', error);
            return false;
        }
        console.log('✅ Supabase 연결 성공');
        return true;
    } catch (error) {
        console.error('Supabase 연결 실패:', error);
        return false;
    }
}

// 페이지 로드 시 연결 확인
document.addEventListener('DOMContentLoaded', function() {
    if (typeof supabase !== 'undefined') {
        checkSupabaseConnection();
    } else {
        console.error('Supabase 라이브러리가 로드되지 않았습니다.');
    }
});

// 전역에서 사용할 수 있도록 window 객체에 할당
window.sb = sb;
window.checkSupabaseConnection = checkSupabaseConnection;
