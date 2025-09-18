-- NEW TM System Database Setup for Supabase
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. FIFO 메인 데이터 테이블 생성
CREATE TABLE IF NOT EXISTS vwtm_list_data (
    id BIGSERIAL PRIMARY KEY,
    pallet_no VARCHAR(100),
    location VARCHAR(100),
    rack_no VARCHAR(100),
    tm_no VARCHAR(100),
    part_no VARCHAR(100),
    hold_whether VARCHAR(10),
    prod_date VARCHAR(50),
    upload_time TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Truck Management 테이블 생성 (수정된 destination 제약조건)
CREATE TABLE IF NOT EXISTS vwtm_truck_management (
    id SERIAL PRIMARY KEY,
    departure_date DATE NOT NULL,
    departure_time VARCHAR(5) NOT NULL, -- Format: HH:MM (07:00, 08:00, etc.)
    delivery_no VARCHAR(100) NOT NULL,
    destination VARCHAR(50) NOT NULL CHECK (destination IN ('VW US', 'VW MX', 'KMX', 'VX US')),
    truck_id VARCHAR(100) NOT NULL,
    forza_id VARCHAR(100) NOT NULL,
    parts TEXT NOT NULL, -- Store parts information like "PartA(5) + PartB(3)"
    pager_no VARCHAR(50) CHECK (pager_no IS NULL OR (pager_no ~ '^[A-Za-z0-9\-_]+$' AND length(pager_no) <= 50)), -- Optional field with validation
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'On Site', 'Shipped', 'Delayed', 'Cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    notes TEXT -- Additional notes field
);

-- 3. 일별 집계 테이블은 제거 (불필요)

-- 4. 월별 집계 테이블은 제거 (불필요)

-- 5. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_upload_time ON vwtm_list_data(upload_time);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_location ON vwtm_list_data(location);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_tm_no ON vwtm_list_data(tm_no);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_part_no ON vwtm_list_data(part_no);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_hold_whether ON vwtm_list_data(hold_whether);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_pallet_no ON vwtm_list_data(pallet_no);

CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_date ON vwtm_truck_management(departure_date);
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_status ON vwtm_truck_management(status);
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_destination ON vwtm_truck_management(destination);
CREATE INDEX IF NOT EXISTS idx_vwtm_truck_management_delivery_no ON vwtm_truck_management(delivery_no);

-- 6. RLS (Row Level Security) 설정
ALTER TABLE vwtm_list_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vwtm_truck_management ENABLE ROW LEVEL SECURITY;

-- 7. RLS 정책 설정 (익명 사용자도 읽기/쓰기 가능)
CREATE POLICY "Allow anonymous read access" ON vwtm_list_data
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON vwtm_list_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON vwtm_list_data
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON vwtm_list_data
    FOR DELETE USING (true);

-- Truck Management 테이블에 대한 정책
CREATE POLICY "Allow anonymous read access" ON vwtm_truck_management
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON vwtm_truck_management
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON vwtm_truck_management
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON vwtm_truck_management
    FOR DELETE USING (true);

-- daily_summary 테이블은 제거됨

-- monthly_summary 테이블은 제거됨

-- 8. Truck Management 테이블 업데이트 트리거
CREATE OR REPLACE FUNCTION update_vwtm_truck_management_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vwtm_truck_management_updated_at 
    BEFORE UPDATE ON vwtm_truck_management 
    FOR EACH ROW 
    EXECUTE FUNCTION update_vwtm_truck_management_updated_at();

-- 9. Truck Status View 생성
CREATE OR REPLACE VIEW vwtm_truck_status_view AS
SELECT 
    id,
    departure_date,
    departure_time,
    delivery_no,
    destination,
    truck_id,
    forza_id,
    parts,
    pager_no,
    status,
    created_at,
    updated_at,
    CASE 
        WHEN status = 'Scheduled' THEN '🕐'
        WHEN status = 'On Site' THEN '🚚'
        WHEN status = 'Shipped' THEN '✅'
        WHEN status = 'Delayed' THEN '⏰'
        WHEN status = 'Cancelled' THEN '❌'
    END as status_icon
FROM vwtm_truck_management 
WHERE departure_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY departure_date DESC, departure_time ASC;

-- 10. 샘플 데이터 삽입 (테스트용)
INSERT INTO vwtm_list_data (pallet_no, location, rack_no, tm_no, part_no, hold_whether, prod_date) VALUES
('PAL001', 'LOC-A', 'RACK-01', 'TM001', 'PART001', 'N', '2024-01-15'),
('PAL002', 'LOC-B', 'RACK-02', 'TM002', 'PART002', 'Y', '2024-01-16'),
('PAL003', 'LOC-C', 'RACK-03', 'TM003', 'PART003', 'N', '2024-01-17')
ON CONFLICT DO NOTHING;

INSERT INTO vwtm_truck_management (
    departure_date, 
    departure_time, 
    delivery_no, 
    destination, 
    truck_id, 
    forza_id, 
    parts, 
    pager_no, 
    status
) VALUES 
    ('2024-01-15', '07:00', 'DEL-001', 'VW US', 'TRUCK-001', 'FORZA-001', 'PartA(5) + PartB(3)', 'PAGER-001', 'Scheduled'),
    ('2024-01-15', '08:00', 'DEL-002', 'KMX', 'TRUCK-002', 'FORZA-002', 'PartC(2)', 'PAGER-002', 'On Site'),
    ('2024-01-15', '09:00', 'DEL-003', 'VX US', 'TRUCK-003', 'FORZA-003', 'PartD(4) + PartE(1)', NULL, 'Shipped'),
    ('2024-01-16', '07:00', 'DEL-004', 'VW MX', 'TRUCK-004', 'FORZA-004', 'PartF(3)', 'PAGER-004', 'Scheduled'),
    ('2024-01-16', '08:00', 'DEL-005', 'VW US', 'TRUCK-005', 'FORZA-005', 'PartG(2) + PartH(5)', NULL, 'On Site')
ON CONFLICT DO NOTHING;

-- 11. 테이블 정보 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('vwtm_list_data', 'vwtm_truck_management')
ORDER BY table_name, ordinal_position;

-- 12. 완료 메시지
SELECT 'NEW VW TM System database setup completed successfully!' as status;
