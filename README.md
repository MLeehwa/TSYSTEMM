# LEEHWA VW TM System

A comprehensive Truck Management and FIFO (First In, First Out) system for LEEHWA VW operations.

## 🚀 Features

### FIFO Management
- **Excel Upload**: Upload Excel files and view data in tables
- **Data Analysis**: Filter and analyze shipping plans with date/destination filters
- **Real-time Processing**: Instant data processing and display

### Truck Management
- **Live Status Display**: Real-time truck status monitoring
- **CRUD Operations**: Add, edit, delete truck information
- **Status Tracking**: Track truck status (Scheduled, On Site, Shipped)

## 🛠️ Quick Start

### 방법 1: 로컬에서 직접 실행 (가장 간단)

1. 이 저장소를 다운로드
2. `index.html` 파일을 웹 브라우저에서 직접 열기
3. 모든 기능이 즉시 작동합니다!

### 방법 2: Netlify 배포

**배포 URL**: https://tmsyst.netlify.app

1. GitHub 저장소를 Netlify에 연결
2. 자동 배포 완료
3. 제공된 URL로 접속

## 📊 사용 방법

### Excel Upload
1. "Excel Upload" 메뉴 클릭
2. Excel 파일 선택 (.xlsx, .xls)
3. "업로드" 버튼 클릭
4. 데이터 테이블 확인

### Data Analysis
1. "Shipping Plan Analysis" 메뉴 클릭
2. 날짜 범위 및 목적지 필터 설정
3. "필터 적용" 버튼 클릭
4. 결과 테이블 확인

### Truck Management
1. "Truck Management" 메뉴 클릭
2. "+ 새 트럭 추가" 버튼 클릭
3. 트럭 정보 입력 및 저장
4. 테이블에서 수정/삭제 가능

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS (CDN)
- **Libraries**: 
  - ExcelJS for Excel operations
  - XLSX.js for file processing
  - Supabase for database (optional)

## 📁 Project Structure

```
TSYSTEMM/
├── index.html              # 메인 애플리케이션 (모든 기능 포함)
├── pages/                  # 참조용 페이지들
├── js/                     # 참조용 JavaScript 파일들
├── css/                    # 참조용 CSS 파일들
├── netlify.toml           # Netlify 배포 설정
├── _redirects             # Netlify 리다이렉트 규칙
└── README.md              # 프로젝트 문서
```

## ⚡ 장점

- ✅ **즉시 실행**: `index.html`을 브라우저에서 직접 열면 바로 작동
- ✅ **MIME 타입 문제 해결**: 모든 JavaScript가 인라인으로 포함
- ✅ **빠른 로딩**: CDN을 사용한 최적화된 라이브러리 로딩
- ✅ **반응형 디자인**: 모든 디바이스에서 최적화된 UI
- ✅ **실시간 기능**: Excel 업로드, 필터링, CRUD 작업 모두 실시간

## 🔒 Security

- 모든 데이터는 클라이언트 사이드에서 처리
- Supabase 연결은 선택사항 (오프라인에서도 작동)
- 파일 업로드는 브라우저에서만 처리

## 📞 Support

문제가 발생하면:
1. 브라우저 콘솔에서 오류 메시지 확인
2. `index.html`을 직접 열어서 로컬에서 테스트
3. 네트워크 연결 상태 확인

---

**LEEHWA VW TM System** - Simple, Fast, and Reliable FIFO Management and Truck Status Monitoring