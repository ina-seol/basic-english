# 영어 첫걸음 (BASIC ENGLISH) v2

초등 기초 영어 20일 과정. 학생의 학습 데이터를 모아 **어려운 것을 다시 연습하게 하고, 선생님의 맞춤 지도로 이어 주는** 교육용 웹앱입니다.

- **학생:** https://ina-seol.github.io/basic-english/#s
- **선생님:** https://ina-seol.github.io/basic-english/#t · 대시보드 `#t/dash`
- **교실에 붙일 QR (A4):** [print/qr-a4.pdf](print/qr-a4.pdf)

---

## 1. Project Overview
GitHub Pages 에서 돌아가는 정적 웹앱(빌드·서버 없음)입니다. 기록은 기기에 먼저 저장되고 구글 시트(Apps Script)로 모입니다. 학교 크롬북(1366×768)에 맞췄습니다.

## 2. Educational Problem
- 기초가 부족한 학생일수록 **무엇을 모르는지** 교사가 수업 중에 다 보기 어렵다.
- 반복 학습이 학생마다 같아서, 이미 아는 것을 또 하고 모르는 것은 지나간다.
- 디지털 학습 도구는 "끝냈다"만 남겨 수업 뒤 보충지도의 근거가 되지 못한다.

## 3. BASIC Loop
| | 의미 | 앱에서 |
|---|---|---|
| **B** Baseline | 지금 수준 확인 | 처음 진단 17문항 (낱말·듣기·쓰기·문장) |
| **A** Adaptive Practice | 어려운 것 중심 반복 | Error Bank → Quick Review, My Tricky Words, 교사 지정 복습 |
| **S** Speak & Write | 고르기만이 아닌 수행 | 따라 말하기(음성 인식), 따라 쓰기 → 기억해서 쓰기, 바꿔 말하기 |
| **I** Immediate Feedback | 바로 피드백 | Nice! / Almost! Try again / Let's look at it together (색+기호+글자) |
| **C** Cumulative Learning Data | 쌓이는 기록과 분석 | 시도 단위 로그, 숙달도, 교사 대시보드, 연구용 CSV |

```
진단 → 학습 → 수행 기록 → 오류 분석 → 맞춤 복습 → 교사 확인 → 보충지도 → 재학습
```
시스템은 기록하고 추천만 합니다. 판단과 개입은 교사가 합니다 (**Teacher-in-the-loop**).

## 4. Learning Flow (한 Day = 6단계)
| 단계 | 하는 일 | 기록 영역 |
|---|---|---|
| 1 SEE & HEAR | 그림+낱말+소리 카드 10장 → 듣고 그림 고르기 6문제 | Listening |
| 2 SAY | 낱말 10 + 문장 4 따라 말하기 (안 되면 "말했어요") | Speaking |
| 3 WRITE | 따라 쓰기 6개(손글씨 점선 또는 키보드) → 기억해서 쓰기 6문제 | Writing |
| 4 USE | 문장 틀 빈칸에 낱말 바꿔 넣기 → 말하기 | Sentences, Speaking |
| 5 RETRIEVE | 정리 게임 (6종, 항목마다 기록) | Words / Listening / Writing / Sentences |
| 6 REFLECT | 오늘 어땠는지 + 어려웠던 것 (10초) | 자기점검 |

20개 Day 는 모두 열려 있고, 끝내지 않은 가장 앞 Day 가 **NOW** 로 표시됩니다.

| Day | 테마 | 바꿔 말하기 틀 | 게임 | Day | 테마 | 바꿔 말하기 틀 | 게임 |
|---|---|---|---|---|---|---|---|
| 1 | 가족 | This is my ___. | 짝꿍 카드 | 11 | 옷 | Put on your ___. | 철자 퍼즐 |
| 2 | 동물 | I like ___. | 두더지 잡기 | 12 | 학용품 | Can I borrow your ___? | 짝꿍 카드 |
| 3 | 계절과 날씨 | It's ___. | 풍선 팡팡 | 13 | 감정 | I'm ___. | 풍선 팡팡 |
| 4 | 취미 | I like to ___. | 문장 퍼즐 | 14 | 직업 | I want to be a ___. | 문장 퍼즐 |
| 5 | 생김새 | She has ___. | 누구일까요? | 15 | 장소 | I'm going to the ___. | 두더지 잡기 |
| 6 | 색깔 | I like ___. | 풍선 팡팡 | 16 | 탈것 | I go by ___. | 철자 퍼즐 |
| 7 | 숫자 | I'm ___ years old. | 철자 퍼즐 | 17 | 운동 | Let's play ___. | 풍선 팡팡 |
| 8 | 과일 | I like ___. | 짝꿍 카드 | 18 | 하루 일과 | I ___ every day. | 문장 퍼즐 |
| 9 | 음식 | I want ___. | 문장 퍼즐 | 19 | 우리 집 | I'm in the ___. | 짝꿍 카드 |
| 10 | 몸 | Touch your ___. | 두더지 잡기 | 20 | 장난감 | I have a ___. | 두더지 잡기 |

## 5. Student Features
- **들어오기**: 학년 → 반 → 번호 단추 (이름 없음). 이 기기에서 쓴 번호는 바로 고르기
- **Home**: Days completed / Today's Learning / Quick Review / Teacher Review / 처음 진단 / My Tricky Words / My Growth / Settings·Help
- **My Journey**: 20개 Day 길 (completed · NOW · available)
- **Quick Review**: 틀렸던 항목을 간격 복습 규칙으로 다시 (최대 8개)
- **My Tricky Words**: Needs Practice → Improving → Mastered, 누르면 바로 연습
- **My Growth**: 영역별 점 4칸과 막대, 지난주의 나와 비교, 아는 낱말·말하기 횟수·고친 항목 수
- **Settings / Help**: 소리, 천천히 읽기, 마이크 시험, 저장 상태와 "지금 보내기", 번호 바꾸기
- 인터넷이 끊기면: "Your work is saved on this device. We'll sync it when the connection returns."

## 6. Teacher Features
- **수업하기**: PPT처럼 넘기는 슬라이드 (낱말·퀴즈·문장·짝 대화·Change & Say·게임 시범·정리), 방향키·리모컨, `S` 읽기 `K` 뜻 숨기기 `F` 전체 화면
- **대시보드**: 반 고르기, Class Overview(학생 수·오늘 접속·완료율·평균 숙달도·복습 필요), Students Needing Support(추천 → Assign / Edit / Ignore), Learning Heatmap(●◕◑○ + 숫자), 영역 평균, 복습 효과(First Attempt → After Review), Day별 완료율, Most Difficult Words / Expressions
- **학생 상세**: Day 진행, 영역 숙달도(진단 함께), Error Bank, 자기점검, 보낸 복습(취소)
- **복습 보내기**: 학생 고르기 → 추천 / 학생별 어려운 항목 / Day N 낱말(쓰기·듣기·뜻) / 바꿔 말하기 / 문장 순서 + 한마디
- **내보내기**: 연구용 CSV 4종
- **설정**: 학생용 주소·QR, 시트 연결·Apps Script 버전 확인, 이름→번호 바꾸는 법

## 7. Data Model
원자료는 **시도 이벤트** 하나뿐이고 나머지는 모두 계산합니다.

```js
{ eid, sid, sess, day, step, act, item, area, att, ok, resp, dur, ts, mode, rev, x }
// sid "4-3-07" · step see|say|write|use|retrieve|reflect|review|baseline|assign
// item d08.w.3 (Day 8 낱말 3) · d08.s.1 (문장) · d08.dr.2 (바꿔 말하기)
// area vocab|listen|speak|write|sentence · ok 1/0/'' · rev ''|quick|teacher|tricky
```
| 저장 위치 | 내용 |
|---|---|
| 기기 `be-ev:<번호>` | 그 학생의 이벤트 (다른 기기 기록은 접속 때 합침) |
| 기기 `be-outbox` | 아직 못 보낸 이벤트 |
| 시트 `events` | 모든 이벤트 (한 줄 = 한 시도) |
| 시트 `assignments` | 교사가 보낸 복습 `aid, sid, created, items, note, status` |
| 시트 `기록` | v1 단계 요약 (그대로 보존) |

## 8. Review Algorithm
처음 틀림 → 오늘 / 복습에서 또 틀림 → 다음 날 / 맞힘 → 2일 뒤 확인 / 확인 날 맞힘 → Mastered / 다시 틀리면 처음부터. 첫 시도만 점수로 세고, 정답을 본 뒤의 시도는 세지 않습니다. 자세히: [docs/LEARNING-LOGIC.md](docs/LEARNING-LOGIC.md)

## 9. Mastery Calculation
`60% 최근 10번 정답률 + 30% 누적 정답률 + 10% 복습 정답률` (영역별). 학생에게는 점 4칸, 교사에게는 숫자. 말하기는 발음 점수가 아니라 시도 성공 비율입니다.

## 10. Technical Architecture
```
index.html            한 장짜리 앱 (# 라우팅)
config.js             설정 (시트 주소, 학년·반·인원, ENABLE_*, 복습 간격, 교사 잠금)
data/lessons.js       20회차 콘텐츠, 항목 id, 진단 문항
css/  tokens · base · components · pages · games
js/   util · ui · speech · log(Me·Log·Progress·Api·Migrate) · review · mastery · art · trace · quiz · games · main
js/student/  login · home(+Journey, Help) · day(6단계) · review(Quick·Teacher·Tricky·Growth·Baseline)
js/teacher/  slides · data(계산·CSV) · dashboard(대시보드·학생·복습 보내기·내보내기·설정)
apps-script/Code.gs   구글 시트 저장 (v2)
tests/                node tests/logic.test.js · node tests/appscript.test.js
docs/                 V2-PLAN.md (분석·계획) · LEARNING-LOGIC.md (규칙)
```
빌드 없는 Vanilla JS, 스크립트 순서는 `index.html` 주석 참고. 보내기는 10초 묶음·단계 끝·창 닫을 때(sendBeacon), 서버에서 `eid` 로 중복 제거.

## 11. Privacy
- 학생 이름·이메일을 저장하지 않습니다. 학생은 `학년-반-번호` 로만 구분합니다.
- CSV 에도 번호만 들어갑니다. 번호와 이름의 대응표는 선생님만 따로 보관하세요.
- 교사 데이터 조회·복습 보내기는 Apps Script 의 `TEACHER_KEY` 가 있어야 합니다 (요청 본문으로 보냄).
- `config.js` 의 `TEACHER_PIN` 은 GitHub 에 공개되는 약한 화면 잠금입니다.
- 학생 기기에서 시트로 보내지 않으려면 주소 끝에 `?sheet=off` (되돌리기 `?sheet=on`).

## 12. Deployment
1. 이 저장소를 GitHub Pages(main, /root)로 배포합니다.
2. 구글 시트 → 확장 프로그램 → Apps Script 에 [`apps-script/Code.gs`](apps-script/Code.gs) 를 붙여 넣고 `TEACHER_KEY` 를 바꿉니다.
3. 처음: 배포 → 새 배포 → 웹 앱(실행: 나, 액세스: 모든 사용자) → 주소를 `config.js` 의 `SHEET_URL` 에.
   **v1 에서 올릴 때**: 배포 관리 → 연필 → 버전: 새 버전 → 배포 (주소 그대로).
4. 예전 이름 기록: 시트 새로고침 → 메뉴 `영어 첫걸음 → 이름-번호 표 만들기` → 번호 적기 → `기록의 이름을 번호로 바꾸기`.
5. 교사 화면 설정 → "연결·버전 확인" 에서 `Apps Script v2` 가 나오면 끝.

## 13. Research Data Export
| 파일 | 열 |
|---|---|
| `student_summary.csv` | student_id, class, days_completed, vocabulary/listening/speaking/writing/sentence_mastery, review_count, tricky_items_count, tricky_items_mastered, first_attempt_accuracy, review_accuracy, baseline_*, last_active |
| `activity_log.csv` | student_id, session_id, day, activity, action, item_id, area, correct, attempt, response, duration_ms, timestamp, input_mode, review_type, event_id |
| `error_bank.csv` | student_id, item_id, content, type, error_count, correct_count, state, mastery, last_attempt, last_wrong, last_correct |
| `reflection.csv` | student_id, day, difficulty, self_rating, timestamp |

UTF-8(BOM) CSV 라 Excel·Python(pandas) 에서 바로 열립니다.

## 14. Version History
[CHANGELOG.md](CHANGELOG.md)

---
로컬 실행: 이 폴더에서 `python -m http.server` → http://localhost:8000/?sheet=off
