-- Mapping History 테이블 생성 (UNMAPPING 기록 보관)
CREATE TABLE IF NOT EXISTS vwtm_mapping_history (
    id BIGSERIAL PRIMARY KEY,
    original_id BIGINT, -- 원본 mapping 테이블의 id
    pallet_no VARCHAR(100) NOT NULL,
    tm_no VARCHAR(100) NOT NULL,
    mapping_date TIMESTAMPTZ NOT NULL, -- 원래 맵핑된 날짜
    unmapping_date TIMESTAMPTZ DEFAULT NOW(), -- 언맵핑된 날짜
    shipping_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ, -- 원본의 created_at
    updated_at TIMESTAMPTZ, -- 원본의 updated_at
    unmapped_by VARCHAR(100) -- 언맵핑한 사용자 (선택사항)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_mapping_history_pallet_no ON vwtm_mapping_history(pallet_no);
CREATE INDEX IF NOT EXISTS idx_mapping_history_tm_no ON vwtm_mapping_history(tm_no);
CREATE INDEX IF NOT EXISTS idx_mapping_history_unmapping_date ON vwtm_mapping_history(unmapping_date);
CREATE INDEX IF NOT EXISTS idx_mapping_history_original_id ON vwtm_mapping_history(original_id);

-- RLS (Row Level Security) 활성화
ALTER TABLE vwtm_mapping_history ENABLE ROW LEVEL SECURITY;

-- 익명 접근 정책
DROP POLICY IF EXISTS "Allow anonymous access" ON vwtm_mapping_history;
CREATE POLICY "Allow anonymous access" ON vwtm_mapping_history
FOR ALL USING (true) WITH CHECK (true);
