-- Pallet Generate Table for Return TM Management
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 팔렛 생성 테이블 생성
CREATE TABLE IF NOT EXISTS vwtm_pallet_generate (
    id BIGSERIAL PRIMARY KEY,
    pallet_no VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    print_count INTEGER DEFAULT 0,
    created_by VARCHAR(100),
    notes TEXT
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_vwtm_pallet_generate_pallet_no ON vwtm_pallet_generate(pallet_no);
CREATE INDEX IF NOT EXISTS idx_vwtm_pallet_generate_created_at ON vwtm_pallet_generate(created_at);

-- RLS (Row Level Security) 설정
ALTER TABLE vwtm_pallet_generate ENABLE ROW LEVEL SECURITY;

-- RLS 정책 설정 (익명 사용자도 읽기/쓰기 가능)
DROP POLICY IF EXISTS "Allow anonymous read access" ON vwtm_pallet_generate;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON vwtm_pallet_generate;
DROP POLICY IF EXISTS "Allow anonymous update access" ON vwtm_pallet_generate;
DROP POLICY IF EXISTS "Allow anonymous delete access" ON vwtm_pallet_generate;

CREATE POLICY "Allow anonymous read access" ON vwtm_pallet_generate
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON vwtm_pallet_generate
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON vwtm_pallet_generate
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON vwtm_pallet_generate
    FOR DELETE USING (true);
