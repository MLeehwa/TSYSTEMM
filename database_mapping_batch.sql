-- vwtm_mapping 테이블에 배차 정보 컬럼 추가
ALTER TABLE vwtm_mapping 
ADD COLUMN IF NOT EXISTS shipping_batch INTEGER;

-- 배차 정보 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_mapping_shipping_batch ON vwtm_mapping(shipping_batch);
CREATE INDEX IF NOT EXISTS idx_mapping_shipping_date_batch ON vwtm_mapping(shipping_date, shipping_batch);
