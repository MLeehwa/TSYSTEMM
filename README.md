# NEW VW TM System

이 폴더는 기존 TM System을 새로운 아키텍처로 재구성한 버전입니다.

## 🚀 주요 기능

### FIFO Management
- **Excel Upload**: Excel 파일을 통한 데이터 업로드
- **Data List**: 업로드된 데이터 조회 및 필터링
- **Shipping Plan Analysis**: 배송 계획 분석 및 Excel 내보내기

### Truck Management
- **Live Status Display**: 실시간 트럭 상태 모니터링
- **Truck Management**: Excel 스타일 데이터 입력 모달

## 🛠️ 설치 및 설정

### 1. 데이터베이스 설정

Supabase에서 다음 SQL 스크립트를 실행하세요:

```sql
-- database_setup.sql 파일의 내용을 Supabase SQL Editor에서 실행
```

이 스크립트는 다음 테이블들을 생성합니다:
- `vwtm_list_data`: FIFO 데이터 저장
- `vwtm_truck_management`: 트럭 관리 데이터
- `vwtm_daily_summary`: 일별 집계
- `vwtm_monthly_summary`: 월별 집계

### 2. 환경 설정

`js/supabase-config.js` 파일에서 Supabase 연결 정보를 확인하세요:

```javascript
const SUPABASE_URL = 'your-supabase-url';
const SUPABASE_ANON_KEY = 'your-supabase-anon-key';
```

### 3. 라이브러리 의존성

다음 라이브러리들이 자동으로 로드됩니다:
- **ExcelJS**: Truck Management용 Excel 내보내기
- **XLSX.js**: FIFO Upload용 Excel 읽기
- **Handsontable**: Excel 스타일 데이터 입력
- **Supabase**: 데이터베이스 연결

## 📁 파일 구조

```
NEW/
├── index.html              # 메인 페이지
├── css/
│   └── main.css           # 메인 스타일시트
├── js/
│   ├── core/              # 핵심 모듈
│   │   ├── database.js    # 데이터베이스 관리
│   │   ├── navigation.js  # 페이지 네비게이션
│   │   ├── system-manager.js # 시스템 관리
│   │   ├── supabase-config.js # Supabase 설정
│   │   └── utils.js       # 유틸리티 함수
│   ├── fifo/              # FIFO 관리
│   │   └── upload.js      # Excel 업로드
│   ├── truck/             # 트럭 관리
│   │   ├── management.js  # 트럭 관리 시스템
│   │   └── status.js      # 트럭 상태 표시
│   ├── list.js            # 데이터 리스트
│   └── analysis-new.js    # 분석 시스템
├── pages/                 # 페이지 HTML 파일들
│   ├── fifo/
│   │   ├── upload.html    # FIFO 업로드 페이지
│   │   └── list.html      # 데이터 리스트 페이지
│   ├── truck/
│   │   ├── management.html # 트럭 관리 페이지
│   │   └── status.html    # 트럭 상태 페이지
│   └── analysis-new.html  # 분석 페이지
└── database_setup.sql     # 데이터베이스 설정 스크립트
```

## 🔧 사용법

### FIFO 업로드
1. "Excel Upload" 메뉴 선택
2. Excel 파일 선택 (`.xlsx`, `.xls` 형식)
3. 파일 업로드 버튼 클릭
4. 업로드 완료 확인

### 트럭 관리
1. "Truck Management" 메뉴 선택
2. "Open Excel-Style Entry Form" 버튼 클릭
3. 모달에서 데이터 입력
4. 자동 저장 또는 "Save All" 버튼으로 저장

### 데이터 분석
1. "Shipping Plan Analysis" 메뉴 선택
2. 분석 실행
3. Excel 내보내기로 결과 다운로드

## ⚠️ 주의사항

- **Destination 제약조건**: Truck Management에서 destination은 다음 값만 허용됩니다:
  - `VW US`
  - `VW MX` 
  - `KMX`
  - `VX US`

- **Status 제약조건**: 다음 상태만 허용됩니다:
  - `Scheduled`
  - `On Site`
  - `Shipped`
  - `Delayed`
  - `Cancelled`

## 🐛 문제 해결

### 업로드 오류
- XLSX 라이브러리가 로드되지 않은 경우: 페이지 새로고침
- 데이터베이스 연결 오류: Supabase 설정 확인

### 트럭 관리 오류
- Handsontable 초기화 실패: 페이지 새로고침
- 데이터베이스 제약조건 위반: Destination과 Status 값 확인

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. 브라우저 콘솔의 오류 메시지
2. 데이터베이스 연결 상태
3. 필수 필드 입력 여부
4. 데이터 형식 및 제약조건 준수 여부
