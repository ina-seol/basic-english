/* 20회차 수업 내용. 하루에 한 테마: 낱말 10개 → 문장 4개 → 바꿔 말하기 → 정리 게임.
   pic: 이모지 글자, 또는 { p: 사람 그림 이름 } (art.js 의 그림)
   drill(바꿔 말하기): en 의 {w} 자리에 낱말을 바꿔 넣어요. ko 의 {k} 는 한글 뜻,
     {k:을} {k:이} {k:이야} {k:은} {k:으로} 는 받침에 맞춰 을/를, 이/가, 이야/야, 은/는, 으로/로 를 붙여요.
     items: [낱말 번호, 영어 바꿔 쓰기(없으면 0), 한글 바꿔 쓰기(없으면 낱말 뜻의 첫 말)] */
var LESSONS = [
  {
    id: 1, theme: 'Family', ko: '가족', color: '#E74C3C', light: '#FDE4E1', on: '#fff', icon: '🏡',
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
      { en: 'family', ko: '가족', pic: '👨👩👧👦' }
    ],
    sentences: [
      { en: 'Who is she?', ko: '그녀는 누구니?', pic: '👵❓', who: 'A' },
      { en: 'She is my grandmother.', ko: '그녀는 우리 할머니야.', pic: '👵', who: 'B' },
      { en: 'This is my family.', ko: '이쪽은 우리 가족이야.', pic: '👨👩👧👦', who: 'A' },
      { en: 'I love my family.', ko: '나는 우리 가족을 사랑해.', pic: '👨👩👧❤️', who: 'B' }
    ],
    drill: { en: 'This is my {w}.', ko: '이쪽은 우리 {k:이야}.', items: [[0], [1], [2], [3], [4], [5]] },
    game: 'memory'
  },
  {
    id: 2, theme: 'Animals', ko: '동물', color: '#E0751B', light: '#FDEBD6', on: '#fff', icon: '🦁',
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
    drill: { en: 'I like {w}.', ko: '나는 {k:을} 좋아해.', items: [[0, 'dogs'], [1, 'cats'], [2, 'rabbits'], [5, 'lions'], [6, 'tigers'], [8, 'monkeys']] },
    game: 'mole'
  },
  {
    id: 3, theme: 'Seasons', ko: '계절과 날씨', color: '#0295A9', light: '#DDF4F8', on: '#fff', icon: '🌸',
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
    drill: { en: "It's {w}.", ko: '{k}', items: [[4, 0, '화창해.'], [5, 0, '비가 와.'], [6, 0, '눈이 와.'], [7, 0, '바람이 불어.'], [8, 0, '더워.'], [9, 0, '추워.']] },
    game: 'balloon'
  },
  {
    id: 4, theme: 'Hobbies', ko: '취미', color: '#FFBB12', light: '#FFF2CC', on: '#3A2A00', icon: '⚽',
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
    drill: { en: 'I like to {w}.', ko: '나는 {k} 걸 좋아해.', items: [[0, 0, '수영하는'], [1, 0, '춤추는'], [2, 0, '노래하는'], [3, 0, '그림 그리는'], [4, 0, '요리하는'], [7, 0, '자전거 타는']] },
    game: 'puzzle'
  },
  {
    id: 5, theme: 'Looks', ko: '생김새', color: '#3FA34D', light: '#E1F3E2', on: '#fff', icon: '👓',
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
    drill: { en: 'She has {w}.', ko: '{k}', items: [[4, 0, '그녀는 머리가 길어.'], [5, 0, '그녀는 머리가 짧아.'], [6, 0, '그녀는 곱슬머리야.'], [7, 0, '그녀는 눈이 커.']] },
    game: 'guess'
  },
  {
    id: 6, theme: 'Colors', ko: '색깔', color: '#E74C3C', light: '#FDE4E1', on: '#fff', icon: '🎨',
    goal: '색깔을 묻고 좋아하는 색을 말해요',
    words: [
      { en: 'red', ko: '빨간색', pic: '🔴' },
      { en: 'orange', ko: '주황색', pic: '🟠' },
      { en: 'yellow', ko: '노란색', pic: '🟡' },
      { en: 'green', ko: '초록색', pic: '🟢' },
      { en: 'blue', ko: '파란색', pic: '🔵' },
      { en: 'purple', ko: '보라색', pic: '🟣' },
      { en: 'pink', ko: '분홍색', pic: '🩷' },
      { en: 'brown', ko: '갈색', pic: '🟤' },
      { en: 'black', ko: '검은색', pic: '⚫' },
      { en: 'white', ko: '흰색', pic: '⚪' }
    ],
    sentences: [
      { en: 'What color is it?', ko: '그것은 무슨 색이니?', pic: '🎨❓', who: 'A' },
      { en: "It's red.", ko: '빨간색이야.', pic: '🍎', who: 'B' },
      { en: 'What color do you like?', ko: '너는 무슨 색을 좋아하니?', pic: '🌈', who: 'A' },
      { en: 'I like blue.', ko: '나는 파란색을 좋아해.', pic: '🔵❤️', who: 'B' }
    ],
    drill: { en: 'I like {w}.', ko: '나는 {k:을} 좋아해.', items: [[0], [2], [3], [4], [5], [6]] },
    game: 'balloon'
  },
  {
    id: 7, theme: 'Numbers', ko: '숫자', color: '#E0751B', light: '#FDEBD6', on: '#fff', icon: '🔢',
    goal: '1부터 10까지 세고 나이를 말해요',
    words: [
      { en: 'one', ko: '1, 하나', pic: '1️⃣' },
      { en: 'two', ko: '2, 둘', pic: '2️⃣' },
      { en: 'three', ko: '3, 셋', pic: '3️⃣' },
      { en: 'four', ko: '4, 넷', pic: '4️⃣' },
      { en: 'five', ko: '5, 다섯', pic: '5️⃣' },
      { en: 'six', ko: '6, 여섯', pic: '6️⃣' },
      { en: 'seven', ko: '7, 일곱', pic: '7️⃣' },
      { en: 'eight', ko: '8, 여덟', pic: '8️⃣' },
      { en: 'nine', ko: '9, 아홉', pic: '9️⃣' },
      { en: 'ten', ko: '10, 열', pic: '🔟' }
    ],
    sentences: [
      { en: 'How many apples?', ko: '사과가 몇 개니?', pic: '🍎🍎🍎', who: 'A' },
      { en: 'Three apples.', ko: '사과 세 개.', pic: '3️⃣🍎', who: 'B' },
      { en: 'How old are you?', ko: '너는 몇 살이니?', pic: '🎂❓', who: 'A' },
      { en: "I'm ten years old.", ko: '나는 열 살이야.', pic: '🔟🎂', who: 'B' }
    ],
    drill: { en: "I'm {w} years old.", ko: '나는 {k} 살이야.', items: [[4, 0, '다섯'], [5, 0, '여섯'], [6, 0, '일곱'], [7, 0, '여덟'], [8, 0, '아홉'], [9, 0, '열']] },
    game: 'spell'
  },
  {
    id: 8, theme: 'Fruits', ko: '과일', color: '#0295A9', light: '#DDF4F8', on: '#fff', icon: '🍎',
    goal: '과일 이름을 말하고 좋아하는지 묻고 답해요',
    words: [
      { en: 'apple', ko: '사과', pic: '🍎' },
      { en: 'banana', ko: '바나나', pic: '🍌' },
      { en: 'grape', ko: '포도', pic: '🍇' },
      { en: 'strawberry', ko: '딸기', pic: '🍓' },
      { en: 'watermelon', ko: '수박', pic: '🍉' },
      { en: 'peach', ko: '복숭아', pic: '🍑' },
      { en: 'pear', ko: '배', pic: '🍐' },
      { en: 'lemon', ko: '레몬', pic: '🍋' },
      { en: 'cherry', ko: '체리', pic: '🍒' },
      { en: 'pineapple', ko: '파인애플', pic: '🍍' }
    ],
    sentences: [
      { en: 'Do you like apples?', ko: '너는 사과를 좋아하니?', pic: '🍎❓', who: 'A' },
      { en: 'Yes, I do.', ko: '응, 좋아해.', pic: '👍', who: 'B' },
      { en: 'Do you like lemons?', ko: '너는 레몬을 좋아하니?', pic: '🍋❓', who: 'A' },
      { en: "No, I don't.", ko: '아니, 안 좋아해.', pic: '🙅', who: 'B' }
    ],
    drill: { en: 'I like {w}.', ko: '나는 {k:을} 좋아해.', items: [[0, 'apples'], [1, 'bananas'], [2, 'grapes'], [3, 'strawberries'], [5, 'peaches'], [8, 'cherries']] },
    game: 'memory'
  },
  {
    id: 9, theme: 'Food', ko: '음식', color: '#FFBB12', light: '#FFF2CC', on: '#3A2A00', icon: '🍕',
    goal: '먹고 싶은 음식을 말해요',
    words: [
      { en: 'rice', ko: '밥', pic: '🍚' },
      { en: 'bread', ko: '빵', pic: '🍞' },
      { en: 'milk', ko: '우유', pic: '🥛' },
      { en: 'egg', ko: '달걀', pic: '🥚' },
      { en: 'pizza', ko: '피자', pic: '🍕' },
      { en: 'chicken', ko: '치킨, 닭고기', pic: '🍗' },
      { en: 'noodles', ko: '국수', pic: '🍜' },
      { en: 'cake', ko: '케이크', pic: '🍰' },
      { en: 'juice', ko: '주스', pic: '🧃' },
      { en: 'water', ko: '물', pic: '💧' }
    ],
    sentences: [
      { en: "I'm hungry.", ko: '나는 배고파.', pic: '🤤', who: 'A' },
      { en: 'What do you want?', ko: '뭘 먹고 싶니?', pic: '🍽️❓', who: 'B' },
      { en: 'I want pizza.', ko: '나는 피자를 먹고 싶어.', pic: '🍕', who: 'A' },
      { en: "It's delicious!", ko: '맛있어!', pic: '😋', who: 'B' }
    ],
    drill: { en: 'I want {w}.', ko: '나는 {k:을} 먹고 싶어.', items: [[0], [1], [2], [4], [7], [8]] },
    game: 'puzzle'
  },
  {
    id: 10, theme: 'My Body', ko: '몸', color: '#3FA34D', light: '#E1F3E2', on: '#fff', icon: '✋',
    goal: '몸의 이름을 말하고 몸으로 따라 해요',
    words: [
      { en: 'eye', ko: '눈', pic: '👁️' },
      { en: 'ear', ko: '귀', pic: '👂' },
      { en: 'nose', ko: '코', pic: '👃' },
      { en: 'mouth', ko: '입', pic: '👄' },
      { en: 'tooth', ko: '이, 치아', pic: '🦷' },
      { en: 'hair', ko: '머리카락', pic: '💇' },
      { en: 'hand', ko: '손', pic: '✋' },
      { en: 'arm', ko: '팔', pic: '💪' },
      { en: 'leg', ko: '다리', pic: '🦵' },
      { en: 'foot', ko: '발', pic: '🦶' }
    ],
    sentences: [
      { en: 'Touch your nose.', ko: '코를 만져 봐.', pic: '👃👆', who: 'A' },
      { en: 'This is my hand.', ko: '이건 내 손이야.', pic: '✋', who: 'B' },
      { en: 'I have two eyes.', ko: '나는 눈이 두 개 있어.', pic: '👀', who: 'A' },
      { en: 'My leg hurts.', ko: '다리가 아파.', pic: '🦵🤕', who: 'B' }
    ],
    drill: { en: 'Touch your {w}.', ko: '{k:을} 만져 봐.', items: [[2], [1], [3], [5], [6], [9]] },
    game: 'mole'
  },
  {
    id: 11, theme: 'Clothes', ko: '옷', color: '#E74C3C', light: '#FDE4E1', on: '#fff', icon: '👕',
    goal: '옷 이름을 말하고 입으라고 말해요',
    words: [
      { en: 'shirt', ko: '셔츠', pic: '👕' },
      { en: 'pants', ko: '바지', pic: '👖' },
      { en: 'dress', ko: '원피스', pic: '👗' },
      { en: 'shorts', ko: '반바지', pic: '🩳' },
      { en: 'coat', ko: '코트', pic: '🧥' },
      { en: 'hat', ko: '모자', pic: '👒' },
      { en: 'cap', ko: '야구 모자', pic: '🧢' },
      { en: 'socks', ko: '양말', pic: '🧦' },
      { en: 'shoes', ko: '신발', pic: '👟' },
      { en: 'gloves', ko: '장갑', pic: '🧤' }
    ],
    sentences: [
      { en: "It's cold outside.", ko: '밖은 추워.', pic: '🥶', who: 'A' },
      { en: 'Put on your coat.', ko: '코트를 입어.', pic: '🧥', who: 'A' },
      { en: 'I like your shoes.', ko: '네 신발 멋지다.', pic: '👟✨', who: 'B' },
      { en: 'Thank you.', ko: '고마워.', pic: '😊', who: 'A' }
    ],
    drill: { en: 'Put on your {w}.', ko: '{k}', items: [[4, 0, '코트를 입어.'], [5, 0, '모자를 써.'], [6, 0, '야구 모자를 써.'], [7, 0, '양말을 신어.'], [8, 0, '신발을 신어.'], [9, 0, '장갑을 껴.']] },
    game: 'spell'
  },
  {
    id: 12, theme: 'School Things', ko: '학용품', color: '#E0751B', light: '#FDEBD6', on: '#fff', icon: '✏️',
    goal: '학용품 이름을 말하고 빌려 달라고 말해요',
    words: [
      { en: 'book', ko: '책', pic: '📕' },
      { en: 'pencil', ko: '연필', pic: '✏️' },
      { en: 'pen', ko: '펜', pic: '🖊️' },
      { en: 'ruler', ko: '자', pic: '📏' },
      { en: 'scissors', ko: '가위', pic: '✂️' },
      { en: 'bag', ko: '가방', pic: '🎒' },
      { en: 'crayon', ko: '크레용', pic: '🖍️' },
      { en: 'notebook', ko: '공책', pic: '📓' },
      { en: 'chair', ko: '의자', pic: '🪑' },
      { en: 'clock', ko: '시계', pic: '🕒' }
    ],
    sentences: [
      { en: "What's this?", ko: '이것은 뭐니?', pic: '✏️❓', who: 'A' },
      { en: "It's a pencil.", ko: '연필이야.', pic: '✏️', who: 'B' },
      { en: 'Can I borrow your ruler?', ko: '네 자를 빌려도 되니?', pic: '📏🙏', who: 'A' },
      { en: 'Sure, here you are.', ko: '그럼, 여기 있어.', pic: '🤲', who: 'B' }
    ],
    drill: { en: 'Can I borrow your {w}?', ko: '네 {k:을} 빌려도 되니?', items: [[1], [2], [3], [4], [6], [0]] },
    game: 'memory'
  },
  {
    id: 13, theme: 'Feelings', ko: '감정', color: '#0295A9', light: '#DDF4F8', on: '#fff', icon: '😀',
    goal: '기분을 묻고 내 기분을 말해요',
    words: [
      { en: 'happy', ko: '행복한', pic: '😀' },
      { en: 'sad', ko: '슬픈', pic: '😢' },
      { en: 'angry', ko: '화난', pic: '😠' },
      { en: 'tired', ko: '피곤한', pic: '😫' },
      { en: 'hungry', ko: '배고픈', pic: '🤤' },
      { en: 'sleepy', ko: '졸린', pic: '😴' },
      { en: 'scared', ko: '무서운', pic: '😨' },
      { en: 'surprised', ko: '놀란', pic: '😲' },
      { en: 'sick', ko: '아픈', pic: '🤒' },
      { en: 'fine', ko: '괜찮은', pic: '🙂' }
    ],
    sentences: [
      { en: 'How are you?', ko: '기분이 어때?', pic: '🙂❓', who: 'A' },
      { en: "I'm happy.", ko: '나는 행복해.', pic: '😀', who: 'B' },
      { en: 'Are you okay?', ko: '괜찮니?', pic: '🤔', who: 'A' },
      { en: "I'm sleepy.", ko: '나는 졸려.', pic: '😴', who: 'B' }
    ],
    drill: { en: "I'm {w}.", ko: '{k}', items: [[0, 0, '나는 행복해.'], [1, 0, '나는 슬퍼.'], [2, 0, '나는 화가 나.'], [3, 0, '나는 피곤해.'], [4, 0, '나는 배고파.'], [8, 0, '나는 아파.']] },
    game: 'balloon'
  },
  {
    id: 14, theme: 'Jobs', ko: '직업', color: '#FFBB12', light: '#FFF2CC', on: '#3A2A00', icon: '🧑‍🚒',
    goal: '직업 이름을 말하고 꿈을 말해요',
    words: [
      { en: 'teacher', ko: '선생님', pic: '🧑‍🏫' },
      { en: 'doctor', ko: '의사', pic: '🧑‍⚕️' },
      { en: 'cook', ko: '요리사', pic: '🧑‍🍳' },
      { en: 'farmer', ko: '농부', pic: '🧑‍🌾' },
      { en: 'police officer', ko: '경찰관', pic: '👮' },
      { en: 'firefighter', ko: '소방관', pic: '🧑‍🚒' },
      { en: 'pilot', ko: '비행기 조종사', pic: '🧑‍✈️' },
      { en: 'singer', ko: '가수', pic: '🧑‍🎤' },
      { en: 'scientist', ko: '과학자', pic: '🧑‍🔬' },
      { en: 'painter', ko: '화가', pic: '🧑‍🎨' }
    ],
    sentences: [
      { en: 'What do you want to be?', ko: '너는 무엇이 되고 싶니?', pic: '💭', who: 'A' },
      { en: 'I want to be a doctor.', ko: '나는 의사가 되고 싶어.', pic: '🧑‍⚕️', who: 'B' },
      { en: 'Who is he?', ko: '그는 누구니?', pic: '🧑‍✈️❓', who: 'A' },
      { en: 'He is a pilot.', ko: '그는 비행기 조종사야.', pic: '🧑‍✈️', who: 'B' }
    ],
    drill: { en: 'I want to be a {w}.', ko: '나는 {k:이} 되고 싶어.', items: [[0], [1], [2], [5], [7], [8]] },
    game: 'puzzle'
  },
  {
    id: 15, theme: 'Places', ko: '장소', color: '#3FA34D', light: '#E1F3E2', on: '#fff', icon: '🏫',
    goal: '동네 장소를 말하고 어디 가는지 말해요',
    words: [
      { en: 'school', ko: '학교', pic: '🏫' },
      { en: 'hospital', ko: '병원', pic: '🏥' },
      { en: 'park', ko: '공원', pic: '🏞️' },
      { en: 'library', ko: '도서관', pic: '📚' },
      { en: 'bank', ko: '은행', pic: '🏦' },
      { en: 'store', ko: '가게', pic: '🏪' },
      { en: 'restaurant', ko: '식당', pic: '🍽️' },
      { en: 'post office', ko: '우체국', pic: '🏤' },
      { en: 'zoo', ko: '동물원', pic: '🦒' },
      { en: 'museum', ko: '박물관', pic: '🏛️' }
    ],
    sentences: [
      { en: 'Where are you going?', ko: '너는 어디 가니?', pic: '🚶❓', who: 'A' },
      { en: "I'm going to the park.", ko: '나는 공원에 가.', pic: '🏞️', who: 'B' },
      { en: 'Where is the library?', ko: '도서관은 어디 있니?', pic: '📚❓', who: 'A' },
      { en: "It's next to the bank.", ko: '은행 옆에 있어.', pic: '🏦', who: 'B' }
    ],
    drill: { en: "I'm going to the {w}.", ko: '나는 {k}에 가.', items: [[2], [3], [1], [8], [9], [5]] },
    game: 'mole'
  },
  {
    id: 16, theme: 'Transportation', ko: '탈것', color: '#E74C3C', light: '#FDE4E1', on: '#fff', icon: '🚌',
    goal: '탈것 이름을 말하고 무엇을 타고 가는지 말해요',
    words: [
      { en: 'car', ko: '자동차', pic: '🚗' },
      { en: 'bus', ko: '버스', pic: '🚌' },
      { en: 'bike', ko: '자전거', pic: '🚲' },
      { en: 'train', ko: '기차', pic: '🚆' },
      { en: 'subway', ko: '지하철', pic: '🚇' },
      { en: 'airplane', ko: '비행기', pic: '✈️' },
      { en: 'ship', ko: '배', pic: '🚢' },
      { en: 'taxi', ko: '택시', pic: '🚕' },
      { en: 'truck', ko: '트럭', pic: '🚚' },
      { en: 'helicopter', ko: '헬리콥터', pic: '🚁' }
    ],
    sentences: [
      { en: 'How do you go to school?', ko: '너는 학교에 어떻게 가니?', pic: '🏫❓', who: 'A' },
      { en: 'I go by bus.', ko: '나는 버스를 타고 가.', pic: '🚌', who: 'B' },
      { en: 'I walk to school.', ko: '나는 걸어서 학교에 가.', pic: '🚶', who: 'A' },
      { en: "Let's take a taxi.", ko: '택시를 타자.', pic: '🚕', who: 'B' }
    ],
    drill: { en: 'I go by {w}.', ko: '나는 {k:을} 타고 가.', items: [[1], [0], [2], [3], [4], [7]] },
    game: 'spell'
  },
  {
    id: 17, theme: 'Sports', ko: '운동', color: '#E0751B', light: '#FDEBD6', on: '#fff', icon: '🏀',
    goal: '좋아하는 운동을 말하고 같이 하자고 말해요',
    words: [
      { en: 'soccer', ko: '축구', pic: '⚽' },
      { en: 'baseball', ko: '야구', pic: '⚾' },
      { en: 'basketball', ko: '농구', pic: '🏀' },
      { en: 'tennis', ko: '테니스', pic: '🎾' },
      { en: 'badminton', ko: '배드민턴', pic: '🏸' },
      { en: 'volleyball', ko: '배구', pic: '🏐' },
      { en: 'table tennis', ko: '탁구', pic: '🏓' },
      { en: 'swimming', ko: '수영', pic: '🏊' },
      { en: 'skating', ko: '스케이트', pic: '⛸️' },
      { en: 'skiing', ko: '스키', pic: '⛷️' }
    ],
    sentences: [
      { en: 'What sport do you like?', ko: '너는 무슨 운동을 좋아하니?', pic: '🏅❓', who: 'A' },
      { en: 'I like soccer.', ko: '나는 축구를 좋아해.', pic: '⚽', who: 'B' },
      { en: "Let's play baseball.", ko: '야구하자.', pic: '⚾', who: 'A' },
      { en: 'Good idea!', ko: '좋은 생각이야!', pic: '👍', who: 'B' }
    ],
    drill: { en: "Let's play {w}.", ko: '{k} 하자.', items: [[0], [1], [2], [3], [4], [5]] },
    game: 'balloon'
  },
  {
    id: 18, theme: 'My Day', ko: '하루 일과', color: '#0295A9', light: '#DDF4F8', on: '#fff', icon: '⏰',
    goal: '하루 동안 하는 일을 말해요',
    words: [
      { en: 'get up', ko: '일어나다', pic: '⏰' },
      { en: 'wash my face', ko: '세수하다', pic: '🧼' },
      { en: 'brush my teeth', ko: '이를 닦다', pic: '🪥' },
      { en: 'eat breakfast', ko: '아침을 먹다', pic: '🍳' },
      { en: 'go to school', ko: '학교에 가다', pic: '🏫' },
      { en: 'study', ko: '공부하다', pic: '📖' },
      { en: 'play', ko: '놀다', pic: '🤸' },
      { en: 'eat dinner', ko: '저녁을 먹다', pic: '🍽️' },
      { en: 'take a shower', ko: '샤워하다', pic: '🚿' },
      { en: 'go to bed', ko: '자러 가다', pic: '🛏️' }
    ],
    sentences: [
      { en: 'What time do you get up?', ko: '너는 몇 시에 일어나니?', pic: '⏰❓', who: 'A' },
      { en: 'I get up at seven.', ko: '나는 7시에 일어나.', pic: '🕖', who: 'B' },
      { en: 'What do you do after school?', ko: '너는 학교 끝나고 뭐 하니?', pic: '🏫🤔', who: 'A' },
      { en: 'I play with my friends.', ko: '나는 친구들이랑 놀아.', pic: '🤸', who: 'B' }
    ],
    drill: { en: 'I {w} every day.', ko: '나는 매일 {k}.', items: [[0, 0, '일어나'], [1, 0, '세수해'], [2, 0, '이를 닦아'], [3, 0, '아침을 먹어'], [5, 0, '공부해'], [8, 0, '샤워해']] },
    game: 'puzzle'
  },
  {
    id: 19, theme: 'My House', ko: '우리 집', color: '#FFBB12', light: '#FFF2CC', on: '#3A2A00', icon: '🏠',
    goal: '집 안 곳곳의 이름을 말하고 어디 있는지 말해요',
    words: [
      { en: 'house', ko: '집', pic: '🏠' },
      { en: 'bedroom', ko: '침실', pic: '🛏️' },
      { en: 'kitchen', ko: '부엌', pic: '🥘' },
      { en: 'living room', ko: '거실', pic: '🛋️' },
      { en: 'bathroom', ko: '화장실, 욕실', pic: '🛁' },
      { en: 'door', ko: '문', pic: '🚪' },
      { en: 'window', ko: '창문', pic: '🪟' },
      { en: 'garden', ko: '정원', pic: '🌷' },
      { en: 'lamp', ko: '전등', pic: '💡' },
      { en: 'TV', ko: '텔레비전', pic: '📺' }
    ],
    sentences: [
      { en: 'Where are you?', ko: '너 어디 있니?', pic: '🏠❓', who: 'A' },
      { en: "I'm in the kitchen.", ko: '나는 부엌에 있어.', pic: '🥘', who: 'B' },
      { en: 'Where is my bag?', ko: '내 가방 어디 있어?', pic: '🎒❓', who: 'A' },
      { en: "It's in your room.", ko: '네 방에 있어.', pic: '🛏️', who: 'B' }
    ],
    drill: { en: "I'm in the {w}.", ko: '나는 {k}에 있어.', items: [[1], [2], [3], [4, 0, '욕실'], [7], [0]] },
    game: 'memory'
  },
  {
    id: 20, theme: 'Toys', ko: '장난감', color: '#3FA34D', light: '#E1F3E2', on: '#fff', icon: '🧸',
    goal: '장난감 이름을 말하고 함께 놀자고 말해요',
    words: [
      { en: 'doll', ko: '인형', pic: '🪆' },
      { en: 'teddy bear', ko: '곰 인형', pic: '🧸' },
      { en: 'robot', ko: '로봇', pic: '🤖' },
      { en: 'ball', ko: '공', pic: '🥎' },
      { en: 'kite', ko: '연', pic: '🪁' },
      { en: 'yo-yo', ko: '요요', pic: '🪀' },
      { en: 'puzzle', ko: '퍼즐', pic: '🧩' },
      { en: 'blocks', ko: '블록', pic: '🧱' },
      { en: 'balloon', ko: '풍선', pic: '🎈' },
      { en: 'game', ko: '게임', pic: '🎮' }
    ],
    sentences: [
      { en: "What's your favorite toy?", ko: '네가 제일 좋아하는 장난감은 뭐니?', pic: '🧸❓', who: 'A' },
      { en: "It's a robot.", ko: '로봇이야.', pic: '🤖', who: 'B' },
      { en: 'Can I play with it?', ko: '그걸로 같이 놀아도 되니?', pic: '🙋', who: 'A' },
      { en: 'Of course!', ko: '물론이지!', pic: '😄', who: 'B' }
    ],
    drill: { en: 'I have a {w}.', ko: '나는 {k:을} 가지고 있어.', items: [[0], [1], [2], [3], [4], [6]] },
    game: 'mole'
  }
];

var GAMES = {
  memory: { name: '짝꿍 카드', how: '카드를 두 장씩 뒤집어 그림과 낱말의 짝을 찾아요.', icon: '🃏' },
  mole: { name: '두더지 잡기', how: '들려주는 낱말의 그림을 들고 나온 두더지만 톡! 잡아요.', icon: '🔨' },
  balloon: { name: '풍선 팡팡', how: '그림에 맞는 낱말 풍선을 터뜨려요.', icon: '🎈' },
  puzzle: { name: '문장 퍼즐', how: '낱말 조각을 차례대로 눌러 문장을 완성해요.', icon: '🧩' },
  spell: { name: '철자 퍼즐', how: '그림을 보고 알파벳을 차례대로 눌러 낱말을 완성해요.', icon: '🔤' },
  guess: { name: '누구일까요?', how: '설명을 듣고 맞는 친구를 찾아요.', icon: '🔍' }
};

/* 바꿔 말하기 문장 만들기: 받침에 맞춰 조사 붙이기 */
function josa(word, kind) {
  var last = word.replace(/[^가-힣]/g, '').slice(-1), c = last ? last.charCodeAt(0) - 0xAC00 : -1, jong = c >= 0 ? c % 28 : 0;
  var pairs = { '을': ['을', '를'], '이': ['이', '가'], '이야': ['이야', '야'], '은': ['은', '는'], '으로': [jong === 8 ? '로' : '으로', '로'] };
  var p = pairs[kind] || [kind, kind];
  return word + (jong ? p[0] : p[1]);
}
function drillItems(L) {
  if (!L.drill) return [];
  return L.drill.items.map(function (it) {
    var w = L.words[it[0]], slot = it[1] || w.en, k = it[2] || w.ko.split(',')[0].trim();
    var ko = L.drill.ko.replace(/\{k(?::([^}]+))?\}/g, function (m, j) { return j ? josa(k, j) : k; });
    return { w: w, slot: slot, en: L.drill.en.replace('{w}', slot), ko: ko, pic: w.pic };
  });
}
