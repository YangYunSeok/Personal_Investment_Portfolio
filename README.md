# Personal Investment Portfolio (PIP)

엑셀로 관리하던 개인 투자 포트폴리오를 웹 서비스 형태로 변환하여 관리하는 프로젝트입니다.

## 🛠 기술 스택 (Technical Stack)

### 💻 Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Vanilla CSS (Module CSS)
- **State Management**: React Hooks

### ⚙️ Backend
- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MySQL (mysql2)
- **Environment**: dotenv

---

## 🚀 시작하기 (Getting Started)

프로젝트를 로컬 환경에서 실행하려면 아래 단계를 따르세요.

### 1. 필수 요구 사항
- Node.js (LTS 버전 권장)
- MySQL Database

### 2. 의존성 설치
각 폴더(`Front`, `Server`)에서 패키지를 설치해야 합니다.

```bash
# Frontend 의존성 설치
cd Front
npm install

# Backend 의존성 설치
cd ../Server
npm install
```

### 3. 서버 실행

#### Frontend 실행 (Vite)
```bash
cd Front
npm run dev
```
기본적으로 `http://localhost:5173`에서 실행됩니다.

#### Backend 실행 (Express)
```bash
cd Server
npm run dev
```
기본적으로 `http://localhost:3000`에서 실행됩니다. (포트는 `server.js` 설정에 따라 다를 수 있습니다.)

---

## 📁 프로젝트 구조
- `Front/`: React 애플리리케이션 소스 코드
- `Server/`: Express API 서버 소스 코드
- `docs/`: 프로젝트 설계 및 관련 문서 (SSOT 등)
