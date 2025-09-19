-- TM Packaging Schedule Database Setup for Supabase
-- TM 시스템 포장 작업 스케줄 데이터베이스 설정
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. 기존 테이블 완전 삭제 (새로운 구조로 변경하기 위해)
DROP TABLE IF EXISTS tm_packaging_schedule CASCADE;
DROP TABLE IF EXISTS packaging_schedule CASCADE;
DROP VIEW IF EXISTS tm_packaging_schedule_active CASCADE;
DROP VIEW IF EXISTS packaging_schedule_active CASCADE;

-- 기존 함수들도 삭제
DROP FUNCTION IF EXISTS update_tm_packaging_schedule_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_tm_packaging_schedule_work_status() CASCADE;
DROP FUNCTION IF EXISTS get_next_tm_sequence_number(DATE) CASCADE;
DROP FUNCTION IF EXISTS update_packaging_schedule_updated_at() CASCADE;
DROP FUNCTION IF EXISTS update_packaging_schedule_work_status() CASCADE;
DROP FUNCTION IF EXISTS get_next_sequence_number(DATE) CASCADE;

-- 2. TM 포장 스케줄 테이블 생성
CREATE TABLE tm_packaging_schedule (
    work_date DATE NOT NULL,                    -- 작업 날짜
    seq_no INTEGER NOT NULL,                    -- 시퀀스 번호 (날짜별 1번부터 시작)
    part_no VARCHAR(20) NOT NULL,               -- 파트 번호 (24, 33, 34, 35, 79, 80, 4GV3, 4GF8, SWAP)
    work_start_time VARCHAR(5),                 -- 작업 시작 시간 (HH:MM 형식)
    work_end_time VARCHAR(5),                   -- 작업 종료 시간 (HH:MM 형식)
    work_status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (work_status IN ('waiting', 'active', 'completed')), -- 작업 상태
    work_note TEXT,                             -- 작업 비고
    delay_reason TEXT,                          -- 지연 사유
    created_at TIMESTAMPTZ DEFAULT NOW(),       -- 생성 시간
    updated_at TIMESTAMPTZ DEFAULT NOW(),       -- 수정 시간
    created_by VARCHAR(100),                    -- 생성자
    updated_by VARCHAR(100),                    -- 수정자
    PRIMARY KEY (work_date, seq_no)             -- 복합 기본키: 날짜별로 시퀀스 번호 1번부터 시작
);

-- 3. 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_tm_packaging_schedule_date ON tm_packaging_schedule(work_date);
CREATE INDEX IF NOT EXISTS idx_tm_packaging_schedule_status ON tm_packaging_schedule(work_status);
CREATE INDEX IF NOT EXISTS idx_tm_packaging_schedule_part_no ON tm_packaging_schedule(part_no);
CREATE INDEX IF NOT EXISTS idx_tm_packaging_schedule_sequence ON tm_packaging_schedule(work_date, seq_no);
CREATE INDEX IF NOT EXISTS idx_tm_packaging_schedule_date_status ON tm_packaging_schedule(work_date, work_status);

-- 4. RLS (Row Level Security) 설정
ALTER TABLE tm_packaging_schedule ENABLE ROW LEVEL SECURITY;

-- 5. RLS 정책 설정 (익명 사용자도 읽기/쓰기 가능)
-- 기존 정책이 있으면 삭제 후 재생성
DROP POLICY IF EXISTS "Allow anonymous read access" ON tm_packaging_schedule;
DROP POLICY IF EXISTS "Allow anonymous insert access" ON tm_packaging_schedule;
DROP POLICY IF EXISTS "Allow anonymous update access" ON tm_packaging_schedule;
DROP POLICY IF EXISTS "Allow anonymous delete access" ON tm_packaging_schedule;

CREATE POLICY "Allow anonymous read access" ON tm_packaging_schedule
    FOR SELECT USING (true);

CREATE POLICY "Allow anonymous insert access" ON tm_packaging_schedule
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous update access" ON tm_packaging_schedule
    FOR UPDATE USING (true);

CREATE POLICY "Allow anonymous delete access" ON tm_packaging_schedule
    FOR DELETE USING (true);

-- 6. 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_tm_packaging_schedule_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. 업데이트 트리거 생성
-- 기존 트리거가 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS update_tm_packaging_schedule_updated_at ON tm_packaging_schedule;

CREATE TRIGGER update_tm_packaging_schedule_updated_at 
    BEFORE UPDATE ON tm_packaging_schedule 
    FOR EACH ROW 
    EXECUTE FUNCTION update_tm_packaging_schedule_updated_at();

-- 8. 작업 상태 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_tm_packaging_schedule_status()
RETURNS TRIGGER AS $$
BEGIN
    -- 시작 시간과 종료 시간이 모두 있으면 완료
    IF NEW.work_start_time IS NOT NULL AND NEW.work_end_time IS NOT NULL THEN
        NEW.work_status = 'completed';
    -- 시작 시간만 있으면 진행중
    ELSIF NEW.work_start_time IS NOT NULL AND NEW.work_end_time IS NULL THEN
        NEW.work_status = 'active';
    -- 둘 다 없으면 대기
    ELSE
        NEW.work_status = 'waiting';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. 작업 상태 자동 업데이트 트리거
-- 기존 트리거가 있으면 삭제 후 재생성
DROP TRIGGER IF EXISTS update_tm_packaging_schedule_status_trigger ON tm_packaging_schedule;

CREATE TRIGGER update_tm_packaging_schedule_status_trigger
    BEFORE INSERT OR UPDATE ON tm_packaging_schedule
    FOR EACH ROW
    EXECUTE FUNCTION update_tm_packaging_schedule_status();

-- 10. 샘플 데이터 삽입 (오늘 날짜) - 날짜별 시퀀스 번호 1번부터 시작
INSERT INTO tm_packaging_schedule (work_date, seq_no, part_no, work_start_time, work_end_time, work_status, work_note, delay_reason) VALUES
    (CURRENT_DATE, 1, '24', '08:00', '09:00', 'completed', '정상 완료', ''),
    (CURRENT_DATE, 2, '33', '09:00', NULL, 'active', '진행 중', ''),
    (CURRENT_DATE, 3, '34', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 4, '35', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 5, '79', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 6, '80', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 7, '4GV3', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 8, '4GF8', NULL, NULL, 'waiting', '', ''),
    (CURRENT_DATE, 9, 'SWAP', NULL, NULL, 'waiting', '', '')
ON CONFLICT (work_date, seq_no) DO UPDATE SET
    part_no = EXCLUDED.part_no,
    work_start_time = EXCLUDED.work_start_time,
    work_end_time = EXCLUDED.work_end_time,
    work_status = EXCLUDED.work_status,
    work_note = EXCLUDED.work_note,
    delay_reason = EXCLUDED.delay_reason;

-- 11. 뷰 생성 (현재 활성 작업 조회용)
-- 기존 뷰가 있으면 삭제 후 재생성
DROP VIEW IF EXISTS tm_packaging_schedule_active;

CREATE OR REPLACE VIEW tm_packaging_schedule_active AS
SELECT 
    work_date,
    seq_no,
    part_no,
    work_start_time,
    work_end_time,
    work_status,
    work_note,
    delay_reason,
    created_at,
    updated_at,
    CASE 
        WHEN work_status = 'waiting' THEN '⏳'
        WHEN work_status = 'active' THEN '🔄'
        WHEN work_status = 'completed' THEN '✅'
    END as status_icon,
    CASE 
        WHEN work_start_time IS NOT NULL AND work_end_time IS NOT NULL THEN
            EXTRACT(EPOCH FROM (work_end_time::time - work_start_time::time))/60
        WHEN work_start_time IS NOT NULL AND work_end_time IS NULL THEN
            EXTRACT(EPOCH FROM (CURRENT_TIME - work_start_time::time))/60
        ELSE NULL
    END as elapsed_minutes
FROM tm_packaging_schedule 
WHERE work_date = CURRENT_DATE
ORDER BY 
    CASE work_status 
        WHEN 'active' THEN 1 
        WHEN 'waiting' THEN 2 
        WHEN 'completed' THEN 3 
    END,
    seq_no;

-- 12. 테이블 정보 확인
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'tm_packaging_schedule'
ORDER BY ordinal_position;

-- 13. 날짜별 시퀀스 번호 자동 생성 함수
-- 기존 함수가 있으면 삭제 후 재생성
DROP FUNCTION IF EXISTS get_next_tm_sequence_number(DATE);

CREATE OR REPLACE FUNCTION get_next_tm_sequence_number(target_date DATE)
RETURNS INTEGER AS $$
DECLARE
    next_seq INTEGER;
BEGIN
    -- 해당 날짜의 최대 시퀀스 번호를 찾아서 +1
    SELECT COALESCE(MAX(seq_no), 0) + 1 
    INTO next_seq
    FROM tm_packaging_schedule 
    WHERE work_date = target_date;
    
    RETURN next_seq;
END;
$$ LANGUAGE plpgsql;

-- 14. 완료 메시지
SELECT 'TM Packaging Schedule database setup completed successfully! 
- Table: tm_packaging_schedule (work_date + seq_no composite primary key)
- Each date starts seq_no from 1
- Use get_next_tm_sequence_number(date) function to get next sequence number for a date
- All columns renamed for clarity and consistency' as status;
