-- Packaging Schedule Database Setup for Supabase
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블 삭제 (새로운 구조로 변경하기 위해)
DROP TABLE IF EXISTS packaging_schedule CASCADE;

-- 2. Packaging Schedule 테이블 생성 (새로운 구조)
CREATE TABLE packaging_schedule (
    date DATE NOT NULL,
    sequence_number INTEGER NOT NULL,
    part_number VARCHAR(20) NOT NULL,
    start_time VARCHAR(5), -- Format: HH:MM (08:00, 09:30, etc.)
    end_time VARCHAR(5),   -- Format: HH:MM (09:00, 10:30, etc.)
    status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
    note TEXT, -- 비고
    gap_reason TEXT, -- 공백 이유
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    PRIMARY KEY (date, sequence_number) -- 복합 기본키: 날짜별로 시퀀스 번호 1번부터 시작
);

-- 3. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_packaging_schedule_date ON packaging_schedule(date);
CREATE INDEX IF NOT EXISTS idx_packaging_schedule_status ON packaging_schedule(status);
CREATE INDEX IF NOT EXISTS idx_packaging_schedule_part_number ON packaging_schedule(part_number);
CREATE INDEX IF NOT EXISTS idx_packaging_schedule_sequence ON packaging_schedule(date, sequence_number);
CREATE INDEX IF NOT EXISTS idx_packaging_schedule_date_status ON packaging_schedule(date, status);

-- 4. RLS (Row Level Security) 설정
ALTER TABLE packaging_schedule ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 설정 (익명 사용자도 읽기/쓰기 가능)
-- 기존 정책이 있으면 삭제 후 재생성
DROP POLICY IF EXISTS "Allow anonymous read access" ON packaging_schedule;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON packaging_schedule;
DROP POLICY IF EXISTS "Allow anonymous update access" ON packaging_schedule;
DROP POLICY IF EXISTS "Allow anonymous delete access" ON packaging_schedule;

CREATE POLICY "Allow anonymous read access" ON packaging_schedule
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON packaging_schedule
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON packaging_schedule
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON packaging_schedule
    FOR DELETE USING (true);

-- 6. 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_packaging_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 업데이트 트리거 생성
-- 기존 트리거가 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS update_packaging_schedule_updated_at ON packaging_schedule;

CREATE TRIGGER update_packaging_schedule_updated_at 
    BEFORE UPDATE ON packaging_schedule 
    FOR EACH ROW 
    EXECUTE FUNCTION update_packaging_schedule_updated_at();

-- 8. 상태 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_packaging_schedule_status()
RETURNS TRIGGER AS $$
BEGIN
    -- 시작 시간과 종료 시간이 모두 있으면 완료
    IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
        NEW.status = 'completed';
    -- 시작 시간만 있으면 진행중
    ELSIF NEW.start_time IS NOT NULL AND NEW.end_time IS NULL THEN
        NEW.status = 'active';
    -- 둘 다 없으면 대기
    ELSE
        NEW.status = 'waiting';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 상태 자동 업데이트 트리거
-- 기존 트리거가 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS update_packaging_schedule_status_trigger ON packaging_schedule;

CREATE TRIGGER update_packaging_schedule_status_trigger
    BEFORE INSERT OR UPDATE ON packaging_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_packaging_schedule_status();

-- 10. 샘플 데이터 삽입 (오늘 날짜) - 날짜별 시퀀스 번호 1번부터 시작
INSERT INTO packaging_schedule (date, sequence_number, part_number, start_time, end_time, status, note, gap_reason) VALUES
    (CURRENT_DATE, 1, '24', '08:00', '09:00', 'completed', '정상 완료', ''),
    (CURRENT_DATE, 2, '33', '09:00', NULL, 'active', '진행 중', ''),
    (CURRENT_DATE, 3, '34', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 4, '35', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 5, '79', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 6, '80', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 7, '4GV3', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 8, '4GF8', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 9, 'SWAP', NULL, NULL, 'waiting', '', '')
ON CONFLICT (date, sequence_number) DO UPDATE SET
    part_number = EXCLUDED.part_number,
    start_time = EXCLUDED.start_time,
    end_time = EXCLUDED.end_time,
    status = EXCLUDED.status,
    note = EXCLUDED.note,
    gap_reason = EXCLUDED.gap_reason;

-- 11. 뷰 생성 (현재 활성 작업 조회용)
-- 기존 뷰가 있으면 삭제 후 재생성
DROP VIEW IF EXISTS packaging_schedule_active;

CREATE OR REPLACE VIEW packaging_schedule_active AS
SELECT 
    date,
    sequence_number,
    part_number,
    start_time,
    end_time,
    status,
    note,
    gap_reason,
    created_at,
    updated_at,
    CASE 
        WHEN status = 'waiting' THEN '⏳'
        WHEN status = 'active' THEN '🔄'
        WHEN status = 'completed' THEN '✅'
    END as status_icon,
    CASE 
        WHEN start_time IS NOT NULL AND end_time IS NOT NULL THEN
            EXTRACT(EPOCH FROM (end_time::time - start_time::time))/60
        WHEN start_time IS NOT NULL AND end_time IS NULL THEN
            EXTRACT(EPOCH FROM (CURRENT_TIME - start_time::time))/60
        ELSE NULL
    END as elapsed_minutes
FROM packaging_schedule 
WHERE date = CURRENT_DATE
ORDER BY 
    CASE status 
        WHEN 'active' THEN 1 
        WHEN 'waiting' THEN 2 
        WHEN 'completed' THEN 3 
    END,
    sequence_number;

-- 12. 테이블 정보 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'packaging_schedule'
ORDER BY ordinal_position;

-- 13. 날짜별 시퀀스 번호 자동 생성 함수
-- 기존 함수가 있으면 삭제 후 재생성
DROP FUNCTION IF EXISTS get_next_sequence_number(DATE);

CREATE OR REPLACE FUNCTION get_next_sequence_number(target_date DATE)
RETURNS INTEGER AS $$
DECLARE
    next_seq INTEGER;
BEGIN
    -- 해당 날짜의 최대 시퀀스 번호를 찾아서 +1
    SELECT COALESCE(MAX(sequence_number), 0) + 1 
    INTO next_seq
    FROM packaging_schedule 
    WHERE date = target_date;
    
    RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

-- 14. 완료 메시지
SELECT 'Packaging Schedule database setup completed successfully! 
- Table structure: date + sequence_number (composite primary key)
- Each date starts sequence_number from 1
- Use get_next_sequence_number(date) function to get next sequence number for a date' as status;
