/* 5회차 수업 내용. 하루에 한 테마: 낱말 10개 → 문장 4개 → 정리 게임 하나.
   pic: 이모지 글자, 또는 { p: 사람 그림 이름 } (art.js 의 그림) */
var LESSONS = [
  {
    id: 1, theme: 'Family', ko: '가족', color: '#E36D98', light: '#FBE3EC', icon: '👨‍👩‍👧‍👦',
    goal: '가족을 영어로 소개해요',
    words: [
      { en: 'father', ko: '아빠, 아버지', pic: '👨' },
      { en: 'mother', ko: '엄마, 어머니', pic: '👩' },
      { en: 'brother', ko: '형, 오빠, 남동생', pic: '👦' },
      { en: 'sister', ko: '언니, 누나, 여동생', pic: '👧' },
      { en: 'grandfather', ko: '할아버지', pic: '👴' },
      { en: 'grandmother', ko: '할머니', pic: '👵' },
      { en: 'baby', ko: '아기', pic: '👶' },
      { en: 'uncle', ko: '삼촌', pic: '🧔' },
      { en: 'aunt', ko: '이모, 고모', pic: '👩‍🦱' },
      { en: 'family', ko: '가족', pic: '👨‍👩‍👧‍👦' }
    ],
    sentences: [
      { en: 'Who is she?', ko: '그녀는 누구니?', pic: '👵❓', who: 'A' },
      { en: 'She is my grandmother.', ko: '그녀는 우리 할머니야.', pic: '👵', who: 'B' },
      { en: 'This is my family.', ko: '이쪽은 우리 가족이야.', pic: '👨‍👩‍👧‍👦', who: 'A' },
      { en: 'I love my family.', ko: '나는 우리 가족을 사랑해.', pic: '❤️👨‍👩‍👧‍👦', who: 'B' }
    ],
    game: 'memory'
  },
  {
    id: 2, theme: 'Animals', ko: '동물', color: '#10B183', light: '#D4F1E7', icon: '🦁',
    goal: '동물 이름을 말하고 좋아하는 동물을 말해요',
    words: [
      { en: 'dog', ko: '개', pic: '🐶' },
      { en: 'cat', ko: '고양이', pic: '🐱' },
      { en: 'rabbit', ko: '토끼', pic: '🐰' },
      { en: 'bird', ko: '새', pic: '🐦' },
      { en: 'fish', ko: '물고기', pic: '🐟' },
      { en: 'lion', ko: '사자', pic: '🦁' },
      { en: 'tiger', ko: '호랑이', pic: '🐯' },
      { en: 'elephant', ko: '코끼리', pic: '🐘' },
      { en: 'monkey', ko: '원숭이', pic: '🐵' },
      { en: 'bear', ko: '곰', pic: '🐻' }
    ],
    sentences: [
      { en: 'What is it?', ko: '그것은 뭐니?', pic: '🐾❓', who: 'A' },
      { en: "It's a rabbit.", ko: '그것은 토끼야.', pic: '🐰', who: 'B' },
      { en: 'I like dogs.', ko: '나는 개를 좋아해.', pic: '🐶❤️', who: 'A' },
      { en: 'The elephant is big.', ko: '코끼리는 커.', pic: '🐘', who: 'B' }
    ],
    game: 'mole'
  },
  {
    id: 3, theme: 'Seasons', ko: '계절과 날씨', color: '#2B8AC9', light: '#DCEDF8', icon: '🌸',
    goal: '좋아하는 계절과 날씨를 말해요',
    words: [
      { en: 'spring', ko: '봄', pic: '🌸' },
      { en: 'summer', ko: '여름', pic: '🏖️' },
      { en: 'fall', ko: '가을', pic: '🍂' },
      { en: 'winter', ko: '겨울', pic: '⛄' },
      { en: 'sunny', ko: '화창한', pic: '☀️' },
      { en: 'rainy', ko: '비가 오는', pic: '🌧️' },
      { en: 'snowy', ko: '눈이 오는', pic: '🌨️' },
      { en: 'windy', ko: '바람이 부는', pic: '🌬️' },
      { en: 'hot', ko: '더운', pic: '🥵' },
      { en: 'cold', ko: '추운', pic: '🥶' }
    ],
    sentences: [
      { en: 'What season do you like?', ko: '너는 어떤 계절을 좋아하니?', pic: '🌸🏖️🍂⛄', who: 'A' },
      { en: 'I like summer.', ko: '나는 여름을 좋아해.', pic: '🏖️', who: 'B' },
      { en: "How's the weather?", ko: '날씨가 어때?', pic: '🌤️❓', who: 'A' },
      { en: "It's sunny.", ko: '화창해.', pic: '☀️', who: 'B' }
    ],
    game: 'balloon'
  },
  {
    id: 4, theme: 'Hobbies', ko: '취미', color: '#E89A3C', light: '#FCEBD5', icon: '⚽',
    goal: '좋아하는 것과 할 수 있는 것을 말해요',
    words: [
      { en: 'swim', ko: '수영하다', pic: '🏊' },
      { en: 'dance', ko: '춤추다', pic: '💃' },
      { en: 'sing', ko: '노래하다', pic: '🎤' },
      { en: 'draw', ko: '그림 그리다', pic: '🎨' },
      { en: 'cook', ko: '요리하다', pic: '🍳' },
      { en: 'read', ko: '읽다', pic: '📚' },
      { en: 'play soccer', ko: '축구하다', pic: '⚽' },
      { en: 'ride a bike', ko: '자전거 타다', pic: '🚲' },
      { en: 'play the piano', ko: '피아노 치다', pic: '🎹' },
      { en: 'take pictures', ko: '사진 찍다', pic: '📷' }
    ],
    sentences: [
      { en: 'What do you like to do?', ko: '너는 무엇을 하는 걸 좋아하니?', pic: '🤔', who: 'A' },
      { en: 'I like to swim.', ko: '나는 수영하는 걸 좋아해.', pic: '🏊', who: 'B' },
      { en: 'Can you dance?', ko: '너는 춤출 수 있니?', pic: '💃❓', who: 'A' },
      { en: 'Yes, I can.', ko: '응, 할 수 있어.', pic: '👍', who: 'B' }
    ],
    game: 'puzzle'
  },
  {
    id: 5, theme: 'Looks', ko: '생김새', color: '#7A5CC9', light: '#E9E2F8', icon: '👓',
    goal: '사람의 생김새를 말해요',
    words: [
      { en: 'tall', ko: '키가 큰', pic: { p: 'tall' } },
      { en: 'short', ko: '키가 작은', pic: { p: 'short' } },
      { en: 'big', ko: '큰', pic: { p: 'big' } },
      { en: 'small', ko: '작은', pic: { p: 'small' } },
      { en: 'long hair', ko: '긴 머리', pic: { p: 'longhair' } },
      { en: 'short hair', ko: '짧은 머리', pic: { p: 'shorthair' } },
      { en: 'curly hair', ko: '곱슬머리', pic: { p: 'curly' } },
      { en: 'big eyes', ko: '큰 눈', pic: { p: 'bigeyes' } },
      { en: 'glasses', ko: '안경', pic: { p: 'glasses' } },
      { en: 'cute', ko: '귀여운', pic: { p: 'cute' } }
    ],
    sentences: [
      { en: 'What does she look like?', ko: '그녀는 어떻게 생겼니?', pic: { p: 'ask' }, who: 'A' },
      { en: 'She is tall.', ko: '그녀는 키가 커.', pic: { p: 'tall' }, who: 'B' },
      { en: 'She has long hair.', ko: '그녀는 머리가 길어.', pic: { p: 'longhair' }, who: 'B' },
      { en: 'He wears glasses.', ko: '그는 안경을 써.', pic: { p: 'glasses' }, who: 'B' }
    ],
    game: 'guess'
  }
];

var GAMES = {
  memory: { name: '짝꿍 카드', how: '카드를 두 장씩 뒤집어 그림과 낱말의 짝을 찾아요.', icon: '🃏' },
  mole: { name: '동물 두더지 잡기', how: '들려주는 동물을 들고 나온 두더지만 톡! 잡아요.', icon: '🔨' },
  balloon: { name: '날씨 풍선 팡팡', how: '그림에 맞는 낱말 풍선을 터뜨려요.', icon: '🎈' },
  puzzle: { name: '취미 문장 퍼즐', how: '낱말 조각을 차례대로 눌러 문장을 완성해요.', icon: '🧩' },
  guess: { name: '누구일까요?', how: '설명을 듣고 맞는 친구를 찾아요.', icon: '🔍' }
};
