# BASIC ENGLISH V2 — 분석과 계획 (BASIC Loop)

작성: 2026-10-28 · 대상: v1 (커밋 88ed187, https://ina-seol.github.io/basic-english/)

---

## A. Current Architecture Audit (현재 구조와 문제점)

### A-1. 구조

| 구분 | 현재 |
|---|---|
| 배포 | GitHub Pages 정적 사이트, 빌드 없음 |
| 화면 | `index.html` 한 장 + 주소 `#` 라우팅 (`''` 첫 화면, `#s…` 학생, `#t…` 교사) |
| 스크립트 | 일반 `<script defer>` 9개, 전역 변수로 서로 참조 (순서 의존) |
| CSS | `css/app.css` 한 파일 (681줄). 디자인 1 위에 디자인 2를 덧붙인 구조라 같은 선택자가 두 번씩 있음 |
| 외부 | Google Fonts (Andika, Poppins, Noto Color Emoji), cdnjs qrcodejs |

| 파일 | 역할 |
|---|---|
| `js/config.js` | `SHEET_URL` (Apps Script 웹 앱 주소) |
| `js/data.js` | 20회차 콘텐츠 `LESSONS` (낱말 10·문장 4·바꿔 말하기 틀·게임 종류), `GAMES`, 조사 붙이기 `josa`, `drillItems` |
| `js/art.js` | 생김새 단원 사람 그림, 그림책 꾸밈 SVG |
| `js/core.js` | `store`(localStorage), `Sync`(기록 보내기), `Progress`(진도), `Voice`(읽어 주기), `Listen`(음성 인식), `Sound`, `TracePad`(따라쓰기 판), `Cleanup` |
| `js/student.js` | 이름 입력 → 회차 목록 → ① 낱말 ② 문장 ③ 바꿔 말하기 ④ 게임 |
| `js/games.js` | 게임 6종 |
| `js/teacher.js` | 수업 슬라이드, 학습 결과(표·그래프), 설정 |
| `apps-script/Code.gs` | 시트 `기록` 에 한 줄씩 추가 (`doPost`), `ping` / `mine` / `list` 조회 (`doGet`) |

### A-2. 현재 데이터 모델 (실제 필드명)

**학생 식별**: 자유 입력 **이름** (`fe-name`). 번호가 아님.

**기기 저장 (localStorage)**

| 키 | 내용 |
|---|---|
| `fe-name`, `fe-names` | 현재 이름, 이 기기에서 쓴 이름 목록 |
| `fe-p:<이름>` | `{ [회차]: { w:{s:[번호], t:[번호]}, s:{…}, d:{…}, g:{best, stars, plays} } }` — 말하기(s)·쓰기/고르기(t)를 **끝낸 항목 번호만** |
| `fe-log` | 보낸 기록 사본 (최근 3000개) |
| `fe-outbox` | 아직 못 보낸 기록 |
| `fe-sheet`, `fe-key` | 시트 주소 덮어쓰기, 교사 암호 |
| `fe-slow`, `fe-sound`, `fe-wmode`, `fe-ko`, `fe-auto`, `fe-slide-N`, `fe-recday` | 화면 설정 |

**시트 `기록` 한 줄 (= 한 단계 요약)**

```
시각 | 이름 | 회차 | 테마 | 활동(words|sentences|drill|game) | 말하기 | 쓰기 | 전체 | 점수 | 별 | 완료 항목(JSON) | id
```

### A-3. 문제점

| # | 문제 | 영향 |
|---|---|---|
| 1 | 학생을 **이름**으로 구분 | 실명이 시트에 저장됨(개인정보), 띄어쓰기·오타로 기록이 갈라짐, `mine` 조회는 이름만 알면 누구 기록이든 받음 |
| 2 | **틀린 시도가 기록되지 않음** — 끝낸 항목 번호와 점수만 남음 | Error Bank, Mastery, 복습 효과를 계산할 원자료가 없음 |
| 3 | 기록을 **단계를 나갈 때만** 보냄. 창 닫기·새로고침 처리 없음 | 수업 끝에 탭을 그냥 닫으면 그 단계 기록이 시트에 안 감 (기기에는 남음) |
| 4 | `no-cors` 전송이라 성공 여부를 모름 | Apps Script 쪽 오류가 나도 보낸 것으로 처리됨 (id 중복 방지는 있음) |
| 5 | 기록 하나당 요청 하나, `appendRow` 하나 | 시도 단위 기록으로 바꾸면 요청이 수십 배 → 묶어서 보내야 함 |
| 6 | `list` 가 시트 전체를 매번 내려받음 | 기록이 많아지면 교사 화면이 느려짐 |
| 7 | 음성 인식: 권한 상태 미확인, 실패 이유별 안내 부족, 같은 탭 안에서 한 번 막히면 끝까지 막힘 | 크롬북 마이크 정책에 따라 혼란 |
| 8 | Day 잠금·오늘 회차 개념 없음, 진단·자기점검 없음 | BASIC Loop 의 B·I·C 부분 없음 |
| 9 | CSS 덧칠 구조, 전역 스크립트 | 유지보수·기능 추가 때 회귀 위험 |
| 10 | 교사 암호를 GET 주소에 실어 보냄 | 브라우저 방문 기록에 남음 (위험 낮음, 개선 대상) |

---

## B. V2 Architecture Proposal

### B-1. 원칙
- **빌드 없는 Vanilla JS + GitHub Pages 유지.** 프레임워크 전환 없음.
- 한 장짜리 SPA(`index.html` + `#` 라우팅)는 유지. 헤더·스크립트 중복을 피하려고 페이지를 여러 HTML로 쪼개지 않음.
- 스크립트는 하나의 이름공간 `BE` 아래 역할별 파일로 나눔 (일반 script, 순서 고정).
- **원자료는 "시도(이벤트) 로그" 하나.** Error Bank·Mastery·진도는 모두 로그에서 계산(파생)함 → 교사 화면과 학생 화면이 같은 함수로 같은 값을 얻음, 동기화 충돌 없음.

### B-2. 파일 구조

```
index.html
config.js                 앱 설정 (APP_NAME, CLASSES, ENABLE_* 스위치, SHEET_URL)
data/lessons.js           20회차 콘텐츠 (현 data.js) + baseline 문항
css/tokens.css            색·간격·둥글기·그림자 변수
css/base.css              기본 요소
css/components.css        단추·카드·칩·진행 막대 등
css/pages.css             화면별
js/util.js                $, esc, shuffle, 시간
js/storage.js             localStorage 래퍼 + 이전 버전 데이터 옮기기(migration)
js/api.js                 시트 통신: 묶어 보내기, sendBeacon, 재시도, 중복 방지
js/log.js                 시도 이벤트 기록 (sessionId, eventId)
js/review.js              Error Bank + 간격 복습 규칙 (순수 함수)
js/mastery.js             영역별 숙달도 (순수 함수)
js/speech.js              읽어 주기 + 음성 인식 (상태 머신, 폴백)
js/ui.js                  토스트, 피드백 문구, 공통 조각
js/art.js, js/trace.js    그림, 따라쓰기 판
js/games.js               게임 6종 (시도 이벤트를 남기도록 수정)
js/student/*.js           home, journey, day(6단계), review, tricky, growth, baseline
js/teacher/*.js           slides, dashboard, student, assign, export, settings
js/main.js                라우터
apps-script/Code.gs       v2 (기존 시트 유지 + 새 시트)
```

### B-3. 학생 식별
- **반 + 번호** (예: `4-3-07`). 이름은 저장하지 않음.
- 반 목록은 `config.js` 의 `CLASSES` 에서 고름. 학생은 반 버튼 → 번호 버튼만 누르면 됨 (타자 없음).

### B-4. 데이터 모델 (V2)

**이벤트 (시트 `events`, 기기 `be-events`)** — 시도 하나가 한 줄
```js
{ eid, sid, sess, day, step, act, item, area, att, ok, resp, dur, ts, mode, rev }
// eid  이벤트 id (중복 방지)            sid  학생 번호 "4-3-07"
// sess 접속 세션 id                     day  1~20 (복습·진단은 0)
// step see|say|write|use|retrieve|reflect|review|baseline|assign
// act  hear|speak|type|trace|choose|game|reflect …
// item "d08.w.strawberry" / "d09.dr.2" / "d09.s.1"
// area vocab|listen|speak|write|sentence
// att  그 항목 몇 번째 시도   ok 1/0   resp 입력 요약(40자)   dur ms
// mode touch|keyboard|mic|self     rev ''|quick|teacher|tricky
```

**자기점검 (시트 `reflections`)**: `sid, day, rating(1~3), difficult(words|listening|speaking|writing|sentences|nothing), ts`

**교사 지정 복습 (시트 `assignments`)**: `aid, sid, items[], note, created, status(open|done|cancelled)`

**Error Bank (파생, 저장 안 함)**
```js
{ item, sid, tries, wrong, right, lastWrong, lastRight, streak, state, due }
// state: new → needs → improving → mastered
```

### B-5. 간격 복습 규칙 (설명 가능한 규칙)
| 상황 | 결과 |
|---|---|
| 처음 틀림 | `needs`, 오늘 Quick Review 에 나옴 |
| 복습에서 또 틀림 | `needs` 유지, 다음 접속 때 다시 |
| 복습에서 맞힘 | `improving`, **2일 뒤** 다시 확인 |
| `improving` 에서 다른 날 또 맞힘 (연속 2회, 서로 다른 날) | `mastered` |
| `mastered` 인데 틀림 | `needs` 로 돌아감 |

### B-6. Mastery (영역별, 0~100)
```
mastery = 60% × 최근 정답률(그 영역 최근 10번 시도)
        + 30% × 누적 정답률(그 영역 전체)
        + 10% × 복습 성공률(rev 이벤트의 정답률, 없으면 누적 정답률로 대체)
시도가 없으면: 진단 점수, 진단도 없으면 표시 안 함
학생 화면: ●●●○ 4칸 (0~24/25~49/50~74/75~100)
```
말하기는 "발음 점수"가 아니라 **말하기 시도·인식 성공 비율**로만 씀.

### B-7. 한 Day 6단계 (기존 활동을 다시 묶음)
| V2 단계 | 기존 활동 재사용 | 기록 영역 |
|---|---|---|
| 1 SEE & HEAR | 낱말 카드 듣기 + **듣고 그림 고르기**(새) | listen, vocab |
| 2 SAY | 낱말·문장 따라 말하기 | speak |
| 3 WRITE | 따라쓰기 / 키보드로 쓰기 (+ 뜻 보고 철자 쓰기) | write |
| 4 USE | 바꿔 말하기 (빈칸 고르기 → 말하기) | sentence, speak |
| 5 RETRIEVE | 그 회차 게임 (틀린 시도도 기록) | vocab/sentence |
| 6 REFLECT | 10초 자기점검 | reflection |

### B-8. 교사 화면
`수업하기(슬라이드, 유지)` · `대시보드(Class Overview / Heatmap / Needs Support / Difficult Items)` · `학생 상세` · `복습 지정(추천 → 지정/수정/무시)` · `내보내기(CSV 4종 + 기존 CSV)` · `설정`

### B-9. Apps Script v2
- `POST {batch:[…]}`: 여러 이벤트를 한 번에 `setValues` 로 추가, `eid` 중복은 건너뜀
- `GET mine&sid=` : 그 번호의 이벤트·지정 복습만
- `POST list` (교사 암호를 본문으로) : 전체 이벤트
- `POST assign` (교사 암호) : 복습 지정·취소
- 기존 `기록` 시트와 `mine/list` 는 그대로 둠 (v1 호환)

---

## C. Data Migration Plan

| 데이터 | 방법 |
|---|---|
| 기기의 `fe-p:<이름>` 진도 | V2 첫 접속에서 반·번호를 고른 뒤 "예전 기록 가져오기"에서 이 기기의 예전 이름을 고르면 진도를 번호로 옮기고, **이름이 들어간 키는 지움**. 옮긴 진도는 `imported` 이벤트로 남겨 회차 완료로 인정 (정답/오답 정보는 없으니 Mastery 계산에는 안 씀) |
| 기기의 설정 키 (`fe-slow` 등) | 그대로 읽음 |
| 시트 `기록` (이름 단위 요약) | 지우지 않음. 교사가 시트에 `이름-번호` 탭을 만들어 이름과 번호를 적고 Apps Script 의 `migrateNames()` 를 한 번 실행하면 `기록` 시트의 이름이 번호로 바뀜 → 시트에서 실명이 사라짐. 대시보드는 `기록` 시트의 번호 단위 요약을 "v1 진도"로 함께 보여 줌 |
| 앞으로의 기록 | `events` / `reflections` / `assignments` 시트 (Apps Script 가 처음 받을 때 자동으로 만듦) |
| 시트 주소 | 같은 Apps Script 프로젝트에 코드만 바꾸고 **배포 관리 → 새 버전**으로 배포하면 주소가 그대로라 `config.js` 를 고칠 필요 없음 |

---

## D. Implementation Roadmap

| Phase | 내용 | 끝났다고 보는 기준 |
|---|---|---|
| 1 | 안정화: 창 닫을 때 기록 보내기(sendBeacon), 음성 인식 상태 정리, 회귀 테스트 스크립트 | 기존 흐름 전부 통과 |
| 2 | 디자인 토큰·컴포넌트 CSS 분리, 학생 홈(진행·오늘·복습 3가지가 한눈에), My Journey | 1366×657 한 화면, 기존 화면 깨짐 없음 |
| 3 | 반·번호 접속, 시도 이벤트 로그, 묶어 보내기, Apps Script v2, 기기 데이터 옮기기 | 모든 활동이 이벤트를 남기고 시트에 한 번씩만 들어감 |
| 4 | Error Bank + Quick Review + 간격 복습 + My Tricky Words | 틀림 → 복습 → 맞힘 → 2일 뒤 확인 → mastered 시나리오 통과 |
| 5 | Mastery + My Growth (자기 자신과 비교) | 공식 단위 테스트 |
| 6 | 교사 대시보드 (Overview, Heatmap, Needs Support, Difficult Items, 학생 상세) | 샘플 반 데이터로 확인 |
| 7 | 교사 복습 지정 (추천 → 지정/수정/무시, 학생 홈 카드) | 지정 → 학생 수행 → 대시보드 반영 |
| 8 | Baseline 진단 (5~10분, 4영역) | 결과가 첫 Mastery·복습 우선순위에 반영 |
| 9 | 성능·접근성 (색+기호, 포커스, reduced motion, 지연 로딩) | 키보드만으로 한 Day 완료 |
| 10 | 테스트 시나리오 전체, README(연구대회용 14항목), CHANGELOG | 문서 완성 |

각 Phase 끝에 커밋 + 회귀 테스트, 배포는 교사 확인 후.

---

## E. Risk List

| 위험 | 대응 |
|---|---|
| 이름 → 번호 전환으로 지금 쓰는 학생 기록이 끊김 | 기기 진도 옮기기 + 시트 `migrateNames()`, `기록` 시트는 그대로 둠 |
| Apps Script 를 새 버전으로 배포하지 않으면 V2 기록이 안 들어감 | 앱이 `ping` 으로 스크립트 버전을 확인해 "업데이트 필요"를 교사 설정 화면에 표시, 그동안은 기기에 쌓아 둠 |
| 이벤트가 많아져 Apps Script 할당량·속도 문제 | 10초/단계 끝/창 닫기 때 묶어서 전송, `setValues` 한 번에 쓰기 |
| 학교 크롬북 마이크 차단 | 말하기는 항상 "말했어요" 폴백, Speaking mastery 는 시도 기반으로만 |
| 따라쓰기 자동 판정의 오차 | 손글씨 판정은 쓰기 영역에서 가중치 낮게, 키보드 쓰기(정확 비교)를 쓰기 정답 기준으로 |
| 화면 재구성으로 기존 수업 슬라이드·게임이 깨짐 | 슬라이드·게임 코드는 이동만 하고 동작은 그대로, Phase마다 20회차 전체 자동 점검 |
| 교사 암호를 `config.js` 에 두면 GitHub 에 공개됨 | 암호는 Apps Script 안에만 둠 (`TEACHER_PIN` 은 화면 잠금용 약한 보호로만, 데이터 보호는 서버 암호) |
| localStorage 용량 (이벤트 누적) | 보낸 이벤트는 최근 것만 남기고 요약으로 압축, 필요하면 IndexedDB |
