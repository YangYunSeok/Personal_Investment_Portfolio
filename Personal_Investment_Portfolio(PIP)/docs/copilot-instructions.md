# 🧠 Copilot Instructions – Personal Investment Portfolio (PIP)

## 1. Scope (NON-NEGOTIABLE)

This instruction applies ONLY to this repository:

**Personal_Investment_Portfolio (PIP)**

Copilot is used strictly as an **implementation assistant**, not a designer or architect.

❌ Do NOT invent requirements  
❌ Do NOT improve, refactor, or optimize design  
❌ Do NOT guess missing rules or behaviors  

---

## 2. Single Source of Truth (SSOT)

All implementations MUST strictly follow SSOT documents.

### SSOT Location

docs/design/
├ api/
├ model/
├ db/
├ ui/
└ basic/


### Priority Order (STRICT)

1. `docs/design/api/*`
2. `docs/design/model/*`
3. `docs/design/db/*`
4. `docs/design/ui/*`
5. Existing source code (reference only)

If documents conflict:
- Higher priority document ALWAYS wins
- ❌ Do NOT resolve conflicts by assumption or interpretation

---

## 3. Core Rules

- SSOT documents are **executable contracts**
- Anything not explicitly defined in SSOT:
  - ❌ Do NOT implement
  - ✅ Update SSOT first

Copilot must NEVER:
- Add fields, statuses, buttons, or flows not written in SSOT
- Rename screens, IDs, or domain concepts
- Merge responsibilities between API / Model / DB / UI documents

---

## 4. UI Implementation Rules

### 4.1 Screen Source of Truth

- UI behavior comes ONLY from `docs/design/ui/*.md`
- API usage MUST match `docs/design/api/*.md`
- Field meaning and state semantics MUST match `docs/design/model/*.md`

---

### 4.2 Screen File Naming Rules (MANDATORY)

All screen file names MUST follow this rule:

PIP{업무약어}{구분}{순번}


#### Naming Details

- Prefix: `PIP` (fixed)
- 업무약어: SSOT에 정의된 화면 업무 약어 사용
- 구분:
  - `S` : 화면(Screen)
  - `P` : 팝업(Popup)
- 순번:
  - 기본은 `01`
  - 동일 업무 내 연관 화면/팝업은 `02`, `03` … 순차 증가

#### Examples

- `PIPASSETS01S`  → 자산 관리 메인 화면
- `PIPASSETS01P`  → 자산 관리 관련 팝업
- `PIPASSETS02P`  → 자산 관리 추가 팝업
- `PIPDASH01S`    → 대시보드 화면

❌ Do NOT invent or auto-generate file names  
❌ Do NOT change numbering without SSOT update  

---

### 4.3 Popup Rules

- Popup screens MUST be implemented as separate files
- Popup existence and purpose MUST be defined in SSOT UI document
- Popup is NOT optional or inferred

---

### 4.4 Mock Data Rules

- Use SSOT-defined response DTO structure ONLY
- Provide minimal mock data for layout verification
- Include comments indicating where and how test data can be changed
- ❌ Do NOT infer additional fields for convenience

---

## 5. API / Model / DB Responsibility Boundaries

Each document type has a single responsibility:

- **API docs (`api/*`)**
  - endpoint
  - request / response shape
  - authentication

- **Model docs (`model/*`)**
  - field meaning
  - state semantics
  - calculation and aggregation rules

- **DB docs (`db/*`)**
  - tables
  - joins
  - constraints

❌ Do NOT mix responsibilities  
❌ Do NOT compensate missing rules across documents

---

## 6. Copilot Output Requirements

Before generating any code, Copilot MUST explicitly state:

- File path
- File name
- Which SSOT documents are being applied

Generated output MUST:
- Follow SSOT exactly
- Avoid partial, speculative, or assumed implementation
- Be limited to the requested scope only

---

## 7. Absolute Prohibitions

❌ Guessing missing behavior  
❌ Improving UX beyond SSOT  
❌ Adding fallback or default logic not defined  
❌ Creating APIs, screens, or states without SSOT updates  

---

## 8. Final Principle

> **SSOT defines reality.**  
> Copilot translates SSOT into code.  
> Copilot never decides.