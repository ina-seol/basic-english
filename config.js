/* 영어 첫걸음 (BASIC ENGLISH) 설정 — 이 파일만 고쳐도 되는 값들 */
var CONFIG = {
  APP_NAME: '영어 첫걸음',
  VERSION: '2.0.0',

  /* 구글 시트 기록 주소 (Apps Script 웹 앱 …/exec). 비우면 기록은 이 기기에만 남아요. */
  SHEET_URL: 'https://script.google.com/macros/s/AKfycbzjHqLhgh2xOOca00dD6gEpnjqgPtS7sUtgaRQW03hSFwr-uf-YaBtxvqLGBArgqMQ6/exec',

  /* 학생 번호: 학년-반-번호 (예: 4-3-07). 이름은 저장하지 않아요. */
  GRADES: [3, 4, 5, 6],      // 고를 수 있는 학년
  CLASSES_PER_GRADE: 8,      // 반 버튼 수
  CLASS_SIZE: 30,            // 번호 버튼 수

  TOTAL_DAYS: 20,

  /* 기능 켜고 끄기 (연구 조건 비교용) */
  ENABLE_SPEECH: true,       // 음성 인식 따라 말하기 (끄면 '말했어요' 단추만)
  ENABLE_BASELINE: true,     // 처음 진단
  ENABLE_REFLECTION: true,   // Day 마지막 자기점검
  ENABLE_REVIEW: true,       // Quick Review · My Tricky Words

  /* 교사 화면 잠금 숫자 (빈칸이면 잠그지 않음). GitHub 에 공개되는 값이라 약한 잠금이에요.
     학생 기록을 지키는 진짜 암호는 Apps Script 의 TEACHER_KEY 입니다. */
  TEACHER_PIN: '',

  /* 간격 복습 · 숙달도 규칙 (docs/LEARNING-LOGIC.md 참고) */
  REVIEW_CHECK_AFTER_DAYS: 2,  // 복습에서 맞힌 뒤 다시 확인할 때까지 날 수
  REVIEW_MAX_ITEMS: 8,         // Quick Review 한 번에 나오는 개수
  MASTERY_RECENT_N: 10         // '최근 정답률' 에 쓰는 최근 시도 수
};
/* v1 호환: 예전 코드가 읽던 이름 */
var SHEET_URL = CONFIG.SHEET_URL;
