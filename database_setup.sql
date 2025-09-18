-- TM System Database Setup for Supabase
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 메인 데이터 테이블 생성
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

-- 2. 일별 집계 테이블 생성
CREATE TABLE IF NOT EXISTS vwtm_daily_summary (
    id BIGSERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    total_pallets INTEGER DEFAULT 0,
    total_locations INTEGER DEFAULT 0,
    hold_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 월별 집계 테이블 생성
CREATE TABLE IF NOT EXISTS vwtm_monthly_summary (
    id BIGSERIAL PRIMARY KEY,
    year_month VARCHAR(7) UNIQUE NOT NULL,
    total_pallets INTEGER DEFAULT 0,
    total_locations INTEGER DEFAULT 0,
    hold_count INTEGER DEFAULT 0,
    avg_pallets_per_day DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_upload_time ON vwtm_list_data(upload_time);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_location ON vwtm_list_data(location);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_tm_no ON vwtm_list_data(tm_no);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_part_no ON vwtm_list_data(part_no);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_hold_whether ON vwtm_list_data(hold_whether);
CREATE INDEX IF NOT EXISTS idx_vwtm_list_data_pallet_no ON vwtm_list_data(pallet_no);

-- 5. RLS (Row Level Security) 설정
ALTER TABLE vwtm_list_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE vwtm_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE vwtm_monthly_summary ENABLE ROW LEVEL SECURITY;

-- 6. RLS 정책 설정 (익명 사용자도 읽기/쓰기 가능)
CREATE POLICY "Allow anonymous read access" ON vwtm_list_data
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON vwtm_list_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON vwtm_list_data
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON vwtm_list_data
    FOR DELETE USING (true);

-- daily_summary 테이블에 대한 정책
CREATE POLICY "Allow anonymous read access" ON vwtm_daily_summary
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON vwtm_daily_summary
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON vwtm_daily_summary
    FOR UPDATE USING (true);

-- monthly_summary 테이블에 대한 정책
CREATE POLICY "Allow anonymous read access" ON vwtm_monthly_summary
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON vwtm_monthly_summary
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON vwtm_monthly_summary
    FOR UPDATE USING (true);

-- 7. 테이블 정보 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('vwtm_list_data', 'vwtm_daily_summary', 'vwtm_monthly_summary')
ORDER BY table_name, ordinal_position;

-- 8. 샘플 데이터 삽입 (테스트용)
INSERT INTO vwtm_list_data (pallet_no, location, rack_no, tm_no, part_no, hold_whether, prod_date) VALUES
('PAL001', 'LOC-A', 'RACK-01', 'TM001', 'PART001', 'N', '2024-01-15'),
('PAL002', 'LOC-B', 'RACK-02', 'TM002', 'PART002', 'Y', '2024-01-16'),
('PAL003', 'LOC-C', 'RACK-03', 'TM003', 'PART003', 'N', '2024-01-17')
ON CONFLICT DO NOTHING;

-- 9. 집계 함수 생성 (선택사항)
CREATE OR REPLACE FUNCTION update_vwtm_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- 일별 집계 업데이트
    INSERT INTO vwtm_daily_summary (date, total_pallets, total_locations, hold_count)
    SELECT 
        DATE(upload_time) as date,
        COUNT(*) as total_pallets,
        COUNT(DISTINCT location) as total_locations,
        COUNT(CASE WHEN hold_whether IN ('Y', 'Yes') THEN 1 END) as hold_count
    FROM vwtm_list_data
    WHERE DATE(upload_time) = DATE(NEW.upload_time)
    GROUP BY DATE(upload_time)
    ON CONFLICT (date) DO UPDATE SET
        total_pallets = EXCLUDED.total_pallets,
        total_locations = EXCLUDED.total_locations,
        hold_count = EXCLUDED.hold_count,
        created_at = NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. 트리거 생성 (선택사항)
CREATE TRIGGER trigger_update_vwtm_daily_summary
    AFTER INSERT OR UPDATE OR DELETE ON vwtm_list_data
    FOR EACH ROW
    EXECUTE FUNCTION update_vwtm_daily_summary();

-- 11. 완료 메시지
SELECT 'Database setup completed successfully!' as status;

-- Truck Management System Table
CREATE TABLE IF NOT EXISTS truck_management (
    id SERIAL PRIMARY KEY,
    departure_date DATE NOT NULL,
    departure_time VARCHAR(5) NOT NULL, -- Format: HH:MM (07:00, 08:00, etc.)
    delivery_no VARCHAR(100) NOT NULL,
    destination VARCHAR(50) NOT NULL CHECK (destination IN ('KMX', 'VX US', 'VW MX')),
    truck_id VARCHAR(100) NOT NULL,
    forza_id VARCHAR(100) NOT NULL,
    parts TEXT NOT NULL, -- Store parts information like "PartA(5) + PartB(3)"
    pager_no VARCHAR(50), -- Optional field
    status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'On Site', 'Shipped')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    notes TEXT -- Additional notes field
);

-- Index for better performance
CREATE INDEX IF NOT EXISTS idx_truck_management_date ON truck_management(departure_date);
CREATE INDEX IF NOT EXISTS idx_truck_management_status ON truck_management(status);
CREATE INDEX IF NOT EXISTS idx_truck_management_destination ON truck_management(destination);
CREATE INDEX IF NOT EXISTS idx_truck_management_delivery_no ON truck_management(delivery_no);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_truck_management_updated_at 
    BEFORE UPDATE ON truck_management 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO truck_management (
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
    ('2024-01-15', '07:00', 'DEL-001', 'VW MX', 'TRUCK-001', 'FORZA-001', 'PartA(5) + PartB(3)', 'PAGER-001', 'Scheduled'),
    ('2024-01-15', '08:00', 'DEL-002', 'KMX', 'TRUCK-002', 'FORZA-002', 'PartC(2)', 'PAGER-002', 'On Site'),
    ('2024-01-15', '09:00', 'DEL-003', 'VX US', 'TRUCK-003', 'FORZA-003', 'PartD(4) + PartE(1)', NULL, 'Shipped'),
    ('2024-01-16', '07:00', 'DEL-004', 'VW MX', 'TRUCK-004', 'FORZA-004', 'PartF(3)', 'PAGER-004', 'Scheduled'),
    ('2024-01-16', '08:00', 'DEL-005', 'KMX', 'TRUCK-005', 'FORZA-005', 'PartG(2) + PartH(5)', NULL, 'On Site');

-- View for current truck status (last 30 days)
CREATE OR REPLACE VIEW truck_status_view AS
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
    END as status_icon
FROM truck_management 
WHERE departure_date >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY departure_date DESC, departure_time ASC;
