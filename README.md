# 영어 첫걸음

초등 기초 영어 5일 과정입니다.

- **학생:** https://ina-seol.github.io/basic-english/#s
- **선생님:** https://ina-seol.github.io/basic-english/#t

 하루에 테마 하나씩 **낱말 10개 → 문장 4개 → 정리 게임** 순서로 배웁니다. 선생님 화면과 학생 화면이 한 주소에 같이 들어 있습니다.

| 회차 | 테마 | 낱말 (예) | 문장 | 정리 게임 |
|---|---|---|---|---|
| Day 1 | 가족 Family | father, mother, brother, sister … | Who is she? / She is my grandmother. / This is my family. / I love my family. | 짝꿍 카드 |
| Day 2 | 동물 Animals | dog, cat, rabbit, lion, elephant … | What is it? / It's a rabbit. / I like dogs. / The elephant is big. | 동물 두더지 잡기 |
| Day 3 | 계절과 날씨 Seasons | spring, summer, sunny, rainy, cold … | What season do you like? / I like summer. / How's the weather? / It's sunny. | 날씨 풍선 팡팡 |
| Day 4 | 취미 Hobbies | swim, dance, sing, play soccer … | What do you like to do? / I like to swim. / Can you dance? / Yes, I can. | 취미 문장 퍼즐 |
| Day 5 | 생김새 Looks | tall, short, long hair, glasses, cute … | What does she look like? / She is tall. / She has long hair. / He wears glasses. | 누구일까요? |

## 화면

- **학생** (`#s`): 이름만 쓰고 시작합니다. 크롬북(1366×768) 한 화면에 스크롤 없이 들어가도록 맞췄습니다.
  - ① 낱말 익히기, ② 문장 익히기: 그림을 보고 🔊 듣기 → 🎤 따라 말하기(크롬 음성 인식, 마이크가 막혀 있으면 "따라 말했어요" 단추) → ✏️ 영어 공책 4줄 위 점선 글자를 손가락으로 따라쓰기(얼마나 잘 따라 썼는지 자동으로 봐요). 터치 화면이 없는 크롬북은 자동으로 ⌨️ 키보드로 쓰기가 되고, 틀린 글자는 빨갛게 보여요. 낱말 사이는 ←, → 키로 넘겨요
  - ③ 정리 게임: 회차마다 미니게임 하나
- **선생님** (`#t`)
  - 수업하기: PPT처럼 띄워 놓고 가르치는 슬라이드 (표지 → 낱말 10장 → What's this? 퀴즈 → 문장 4장 → 짝 대화 → 게임 시범 → 정리). 방향키·스페이스·리모컨으로 넘기기, `S` 읽어 주기, `K` 한글 뜻 숨기기, `F` 전체 화면, 🔤 철자 하나씩 읽어 주기
  - 학습 결과: 요약 숫자, 회차별 평균 진도율·게임 점수 막대그래프, 학생 × 회차 진도율 표, 회차별 자세한 기록, CSV 내려받기
  - 설정: 학생용 주소와 QR, 구글 시트 연결 확인

진도율 = 낱말·문장의 말하기·쓰기 28칸 중 한 칸 수 × 80% + 게임을 했으면 20%.

## 기록 저장 (구글 시트)

기록은 언제나 그 기기에 먼저 저장되고, 구글 시트를 연결하면 반 전체 기록이 시트에 모입니다. 인터넷이 끊겼던 기록은 다시 연결될 때 보냅니다.

1. 구글 드라이브에서 새 구글 시트를 만듭니다.
2. **확장 프로그램 → Apps Script** 를 열고 [`apps-script/Code.gs`](apps-script/Code.gs) 내용을 통째로 붙여 넣습니다.
3. 맨 위 `TEACHER_KEY` 를 선생님만 아는 암호로 바꾸고 저장합니다.
4. **배포 → 새 배포 → 웹 앱**, 실행: **나**, 액세스: **모든 사용자** 로 배포하고 권한을 허용합니다.
5. 받은 웹 앱 주소(`https://script.google.com/macros/s/…/exec`)를 [`js/config.js`](js/config.js) 의 `SHEET_URL` 에 넣고 올립니다.

학습 결과 화면에서 3번의 암호를 넣으면 시트의 기록을 불러옵니다. 학생은 자기 이름의 기록만 받아 와서 다른 기기에서도 진도를 이어 할 수 있습니다.

## 파일

| 파일 | 설명 |
|---|---|
| `index.html` | 페이지 |
| `js/data.js` | 5회차 낱말·문장·게임 (여기를 고치면 내용이 바뀝니다) |
| `js/config.js` | 구글 시트 웹 앱 주소 |
| `js/art.js` | 생김새 단원 사람 그림 (SVG) |
| `js/core.js` | 저장, 기록 보내기, 읽어 주기, 음성 인식, 따라쓰기 판 |
| `js/student.js`, `js/teacher.js`, `js/games.js`, `js/main.js` | 학생 화면, 교사 화면, 게임 5종, 화면 전환 |
| `css/app.css` | 디자인 |
| `fonts/` | SB 어그로 글꼴 |
| `apps-script/Code.gs` | 구글 시트에 붙여 넣는 기록 저장 코드 |

로컬에서 보려면 이 폴더에서 `python -m http.server` 를 실행하고 http://localhost:8000 을 엽니다.
