# 데이터베이스 설정 가이드

## 🚀 Supabase에서 데이터베이스 설정하기

### 1단계: Supabase 프로젝트 접속
1. [Supabase](https://supabase.com)에 로그인
2. 프로젝트 선택 또는 새 프로젝트 생성
3. SQL Editor로 이동

### 2단계: 데이터베이스 스크립트 실행
1. `database_setup.sql` 파일의 내용을 복사
2. SQL Editor에 붙여넣기
3. "Run" 버튼 클릭하여 실행

### 3단계: 테이블 생성 확인
다음 쿼리로 테이블이 제대로 생성되었는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'vwtm_%';
```

### 4단계: RLS 정책 확인
각 테이블에 대해 RLS 정책이 제대로 설정되었는지 확인:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename LIKE 'vwtm_%';
```

## 📊 생성되는 테이블들

### 1. vwtm_list_data (FIFO 데이터)
- **pallet_no**: 팔레트 번호 (VARCHAR(100))
- **location**: 위치 (VARCHAR(100))
- **rack_no**: 랙 번호 (VARCHAR(100))
- **tm_no**: TM 번호 (VARCHAR(100))
- **part_no**: 파트 번호 (VARCHAR(100))
- **hold_whether**: 홀드 여부 (VARCHAR(10))
- **prod_date**: 생산일 (VARCHAR(50))
- **upload_time**: 업로드 시간 (자동)
- **created_at**: 생성 시간 (자동)

### 2. vwtm_truck_management (트럭 관리)
- **departure_date**: 출발일 (DATE)
- **departure_time**: 출발시간 (VARCHAR(5), HH:MM 형식)
- **delivery_no**: 배송 번호 (VARCHAR(100))
- **destination**: 목적지 (VARCHAR(50), 제약조건 있음)
- **truck_id**: 트럭 ID (VARCHAR(100))
- **forza_id**: Forza ID (VARCHAR(100))
- **parts**: 파트 정보 (TEXT)
- **pager_no**: 페이저 번호 (VARCHAR(50), 선택사항, 제약조건 있음)
- **status**: 상태 (VARCHAR(20), 제약조건 있음)
- **created_at**: 생성 시간 (자동)
- **updated_at**: 수정 시간 (자동)

-- 일별/월별 집계 테이블은 제거됨 (불필요)

## 🔒 제약조건

### Destination 제약조건
```sql
CHECK (destination IN ('VW US', 'VW MX', 'KMX', 'VX US'))
```

### Status 제약조건
```sql
CHECK (status IN ('Scheduled', 'On Site', 'Shipped', 'Delayed', 'Cancelled'))
```

### Pager 제약조건
```sql
CHECK (pager_no IS NULL OR (pager_no ~ '^[A-Za-z0-9\-_]+$' AND length(pager_no) <= 50))
```
- **NULL 허용**: 페이저 번호는 선택사항
- **문자 제한**: 영문자, 숫자, 하이픈(-), 언더스코어(_)만 허용
- **길이 제한**: 최대 50자

## 📝 샘플 데이터

스크립트 실행 시 자동으로 다음 샘플 데이터가 삽입됩니다:

### FIFO 데이터
- PAL001, LOC-A, RACK-01, TM001, PART001, N, 2024-01-15
- PAL002, LOC-B, RACK-02, TM002, PART002, Y, 2024-01-16
- PAL003, LOC-C, RACK-03, TM003, PART003, N, 2024-01-17

### 트럭 관리 데이터
- 2024-01-15, 07:00, DEL-001, VW US, TRUCK-001, FORZA-001, PartA(5) + PartB(3), PAGER-001, Scheduled
- 2024-01-15, 08:00, DEL-002, KMX, TRUCK-002, FORZA-002, PartC(2), PAGER-002, On Site
- 2024-01-15, 09:00, DEL-003, VX US, TRUCK-003, FORZA-003, PartD(4) + PartE(1), NULL, Shipped

## ⚠️ 주의사항

1. **RLS 정책**: 모든 테이블에 대해 익명 사용자의 읽기/쓰기 권한이 설정됩니다
2. **인덱스**: 성능 향상을 위한 인덱스가 자동으로 생성됩니다
3. **트리거**: 트럭 관리 테이블의 updated_at 필드가 자동으로 업데이트됩니다
4. **뷰**: 트럭 상태 조회를 위한 뷰가 생성됩니다

## 🔧 문제 해결

### 테이블 생성 실패
```sql
-- 기존 테이블 삭제 후 재생성
DROP TABLE IF EXISTS vwtm_list_data CASCADE;
DROP TABLE IF EXISTS vwtm_truck_management CASCADE;
DROP TABLE IF EXISTS vwtm_daily_summary CASCADE;
DROP TABLE IF EXISTS vwtm_monthly_summary CASCADE;
```

### RLS 정책 오류
```sql
-- RLS 비활성화 후 재설정
ALTER TABLE vwtm_list_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE vwtm_truck_management DISABLE ROW LEVEL SECURITY;
```

### 제약조건 오류
```sql
-- 제약조건 확인
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'vwtm_truck_management'::regclass;
```

## ✅ 설정 완료 확인

모든 설정이 완료되면 다음 메시지가 표시됩니다:
```
NEW VW TM System database setup completed successfully!
```
