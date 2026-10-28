# 학습 규칙 (Review · Mastery · Support)

모든 규칙은 **기록(이벤트)을 다시 읽어 계산**합니다. 따로 저장하는 점수가 없어서, 학생 화면·교사 화면·CSV 가 늘 같은 값을 냅니다.
코드: `js/review.js`, `js/mastery.js`, `js/teacher/data.js` · 시험: `node tests/logic.test.js`

## 1. 어떤 시도가 점수가 되나

| 구분 | 점수(ok 1/0) | 비고 |
|---|---|---|
| 문제의 **첫 시도** | ✓ | 듣고 고르기, 그림 보고 낱말, 뜻 고르기, 써 보기, 빈칸, 순서, 게임 항목 |
| 같은 문제의 다시 하기·도움(💡 첫 글자, 🔊 듣기) 뒤 시도 | ✗ (`act: retry`, ok 빈칸) | 정답을 본 직후 맞힌 것을 '복습 성공'으로 세지 않으려고 |
| 첫 글자 힌트를 쓰고 맞힘 | 0 | 도움 받음 |
| 말하기: 크롬이 알아들음 / 학생이 "말했어요" | 1 | 발음 점수가 아님 |
| 말하기: 다르게 들림·너무 짧음·소리 없음 | 0 | |
| 말하기: 마이크 막힘·지원 안 함·네트워크 | 빈칸 | 학생 탓이 아니라서 점수에서 뺌 |
| 따라 쓰기(점선·보고 치기) | 빈칸 | 연습 기록만 |

## 2. Error Bank · 간격 복습

들어가는 것: 점수가 있는 **듣기·낱말·쓰기·문장** 시도 (말하기·진단 제외). 한 번도 틀리지 않은 항목은 들어가지 않습니다.

| 상황 | 상태 | 다음에 나오는 날 |
|---|---|---|
| 처음 틀림 | `needs` | 오늘 (Quick Review) |
| 복습(Quick·Teacher·Tricky)에서 또 틀림 | `needs` | 다음 날 |
| `needs` 에서 맞힘 | `improving` | `REVIEW_CHECK_AFTER_DAYS`(2)일 뒤 |
| `improving` 이고 그 날이 되어 맞힘 | `mastered` | 나오지 않음 |
| `mastered` 인데 틀림 | `needs` | 오늘 |

Quick Review 순서: `needs` 먼저 → 많이 틀린 것 → 진단에서 약했던 영역(50 미만) → 오래된 것. 한 번에 최대 `REVIEW_MAX_ITEMS`(8)개.
문제 모양은 틀렸던 영역을 따라갑니다 (쓰기 → 써 보기, 듣기 → 듣고 고르기, 바꿔 말하기 → 빈칸, 문장 → 순서).

학생 화면 이름: Needs Practice(↻) · Improving(↗) · Mastered(✓)

## 3. Mastery (영역별 0~100)

```
숙달도 = 60% × 최근 정답률 (그 영역 최근 10번)
       + 30% × 누적 정답률 (그 영역 전체)
       + 10% × 복습 정답률 (복습 시도가 없으면 누적 정답률)
```
- 영역: Words(vocab) · Listening · Speaking · Writing · Sentences
- 진단 시도도 포함 → 공부 전에는 진단 결과가 첫 숙달도
- 학생 화면은 숫자 대신 점 4칸: ●○○○ 0~24 · ●●○○ 25~49 · ●●●○ 50~74 · ●●●● 75~100
- My Growth 는 **7일 전까지의 기록으로 계산한 나**와 비교 (다른 학생과 비교·순위 없음)

## 4. 복습 효과 (연구 지표)

- **First Attempt Accuracy**: 항목마다 처음 시도 정답률 (복습 제외)
- **After Review Accuracy**: 복습 시도 정답률
- **Tricky items mastered**: Error Bank 에 들어온 항목 중 `mastered` 수 / 전체

## 5. Students Needing Support (교사 화면)

판정이 아니라 "확인해 볼 만한 신호"입니다. 교사가 Assign / Edit / Ignore(7일 숨김)를 고릅니다.

| 규칙 | 조건 | 표시 | 추천 |
|---|---|---|---|
| R1 | 한 영역 숙달도 < 50, 그 영역 시도 ≥ 6 (말하기 제외) | Needs Review | 그 영역의 복습 항목 |
| R2 | 연습 중 항목(needs+improving) ≥ 6 | Check In | 학생의 어려운 항목 |
| R3 | 최근 14일 말하기 미완료 ≥ 3, 말하기 숙달도 < 50 | Needs Support | 없음 (마이크 환경 확인) |
| R4 | 반의 마지막 기록보다 7일 넘게 기록 없음 | Check In | 없음 |
| R5 | 최근 자기점검 3번 중 2번 이상 "어려웠어요" | Check In | 학생의 어려운 항목 |

## 6. 진도

Day 완료 = 6단계(SEE & HEAR · SAY · WRITE · USE · RETRIEVE · REFLECT)를 모두 한 번 끝냄. `ENABLE_REFLECTION: false` 면 5단계.
v1 에서 옮긴 기록(`import`)과 시트의 v1 기록(이름을 번호로 바꾼 줄)도 완료로 인정합니다. 이 기록에는 정답/오답 정보가 없어 숙달도에는 쓰지 않습니다.
