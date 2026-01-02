-- Mapping 테이블 생성
CREATE TABLE IF NOT EXISTS vwtm_mapping (
    id BIGSERIAL PRIMARY KEY,
    pallet_no VARCHAR(100) NOT NULL,
    tm_no VARCHAR(100) NOT NULL,
    mapping_date TIMESTAMPTZ DEFAULT NOW(),
    shipping_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(pallet_no, tm_no)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_mapping_pallet_no ON vwtm_mapping(pallet_no);
CREATE INDEX IF NOT EXISTS idx_mapping_tm_no ON vwtm_mapping(tm_no);
CREATE INDEX IF NOT EXISTS idx_mapping_date ON vwtm_mapping(mapping_date);

-- RLS (Row Level Security) 활성화
ALTER TABLE vwtm_mapping ENABLE ROW LEVEL SECURITY;

-- 익명 접근 정책 (필요에 따라 수정)
DROP POLICY IF EXISTS "Allow anonymous access" ON vwtm_mapping;
CREATE POLICY "Allow anonymous access" ON vwtm_mapping
FOR ALL USING (true) WITH CHECK (true);

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
DROP TRIGGER IF EXISTS update_vwtm_mapping_updated_at ON vwtm_mapping;
CREATE TRIGGER update_vwtm_mapping_updated_at
    BEFORE UPDATE ON vwtm_mapping
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
