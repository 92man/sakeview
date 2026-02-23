// 사케 테이스팅 표현 사전
const TASTING_DICTIONARY = [
  // ===== 1. 향 (Aroma) =====
  // 과일 계열
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "사과", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "배", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "멜론", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "바나나", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "복숭아", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "포도", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "감귤류", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "파인애플", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "리치", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "딸기", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "망고", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "살구", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "자두", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "체리", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "과일 계열", sub_category_en: "Fruit", expression_ko: "무화과", ui_type: "멀티 태그" },
  // 꽃/식물 계열
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "벚꽃", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "매화", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "은방울꽃", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "꿀", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "풀내음", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "삼나무", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "자스민", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "아카시아", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "허브", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "솔향", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "백합", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "국화", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "금목서", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "목련", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "꽃/식물 계열", sub_category_en: "Floral/Herbal", expression_ko: "라벤더", ui_type: "멀티 태그" },
  // 유제품 계열
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "요거트", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "생크림/크림", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "우유", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "버터", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "크림치즈", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "사워크림", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "연유", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "버터밀크", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "커스터드", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "유제품 계열", sub_category_en: "Dairy", expression_ko: "마스카포네", ui_type: "멀티 태그" },
  // 곡물/누룩 계열
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "쌀/밥", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "누룩", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "찐쌀", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "모찌/떡", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "쌀가루", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "누룩균향", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "현미", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "누룽지", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "생쌀", ui_type: "멀티 태그" },
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "곡물/누룩 계열", sub_category_en: "Grain/Koji", expression_ko: "쌀겨", ui_type: "멀티 태그" },
  // 기타 향
  { category_id: "aroma", category_ko: "향", category_en: "Aroma", sub_category_ko: "기타 향", sub_category_en: "Other", expression_ko: "향신료", ui_type: "멀티 태그" },

  // ===== 2. 맛 (Taste) =====
  // 단맛: 가벼운 → 진한
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "단맛", sub_category_en: "Sweetness", expression_ko: "깔끔한 단맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "단맛", sub_category_en: "Sweetness", expression_ko: "은은한 단맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "단맛", sub_category_en: "Sweetness", expression_ko: "과일 단맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "단맛", sub_category_en: "Sweetness", expression_ko: "꿀 단맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "단맛", sub_category_en: "Sweetness", expression_ko: "초콜릿", ui_type: "멀티 태그" },
  // 신맛: 미네랄 → 부드러운 → 날카로운
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "신맛 (산미)", sub_category_en: "Acidity", expression_ko: "미네랄", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "신맛 (산미)", sub_category_en: "Acidity", expression_ko: "부드러운 산미", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "신맛 (산미)", sub_category_en: "Acidity", expression_ko: "사과 산미", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "신맛 (산미)", sub_category_en: "Acidity", expression_ko: "감귤 산미", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "신맛 (산미)", sub_category_en: "Acidity", expression_ko: "상쾌한 산미", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "신맛 (산미)", sub_category_en: "Acidity", expression_ko: "날카로운 산미", ui_type: "멀티 태그" },
  // 쓴맛: 은은한 → 강한
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "쓴맛", sub_category_en: "Bitterness", expression_ko: "은은한 쓴맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "쓴맛", sub_category_en: "Bitterness", expression_ko: "깔끔한 쓴맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "쓴맛", sub_category_en: "Bitterness", expression_ko: "허브 쓴맛", ui_type: "멀티 태그" },
  // 감칠맛: 카라멜 → 은은한 → 깊은
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "카라멜", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "은은한 감칠맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "다시마맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "해산물맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "된장맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "간장맛", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "감칠맛 (우마미)", sub_category_en: "Umami", expression_ko: "깊은 감칠맛", ui_type: "멀티 태그" },
  // 맛 특징
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "맛 특징", sub_category_en: "Character", expression_ko: "깔끔함", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "맛 특징", sub_category_en: "Character", expression_ko: "신선함", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "맛 특징", sub_category_en: "Character", expression_ko: "드라이함", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "맛 특징", sub_category_en: "Character", expression_ko: "복합적", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "맛 특징", sub_category_en: "Character", expression_ko: "풍부함", ui_type: "멀티 태그" },
  { category_id: "taste", category_ko: "맛", category_en: "Taste", sub_category_ko: "맛 특징", sub_category_en: "Character", expression_ko: "숙성미", ui_type: "멀티 태그" },

  // ===== 3. 바디감 (Body) =====
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "무게감", sub_category_en: "Weight", expression_ko: "라이트 바디", ui_type: "단일 선택" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "무게감", sub_category_en: "Weight", expression_ko: "미디엄 바디", ui_type: "단일 선택" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "무게감", sub_category_en: "Weight", expression_ko: "풀 바디", ui_type: "단일 선택" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "질감", sub_category_en: "Texture", expression_ko: "부드러운", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "질감", sub_category_en: "Texture", expression_ko: "실키한", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "질감", sub_category_en: "Texture", expression_ko: "벨벳 같은", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "질감", sub_category_en: "Texture", expression_ko: "매끄러운", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "질감", sub_category_en: "Texture", expression_ko: "크리미한", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "입안 느낌", sub_category_en: "Mouthfeel", expression_ko: "혀를 감싸는 느낌", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "입안 느낌", sub_category_en: "Mouthfeel", expression_ko: "입안을 채우는 느낌", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "입안 느낌", sub_category_en: "Mouthfeel", expression_ko: "깔끔한", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "입안 느낌", sub_category_en: "Mouthfeel", expression_ko: "산뜻한", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "특수 질감", sub_category_en: "Special", expression_ko: "탄산감", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "특수 질감", sub_category_en: "Special", expression_ko: "알코올 자극", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "특수 질감", sub_category_en: "Special", expression_ko: "워터리함", ui_type: "멀티 태그" },
  { category_id: "body", category_ko: "바디감", category_en: "Body", sub_category_ko: "특수 질감", sub_category_en: "Special", expression_ko: "오일리", ui_type: "멀티 태그" },

  // ===== 4. 여운 (Finish) =====
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 길이", sub_category_en: "Length", expression_ko: "짧다", ui_type: "단일 선택" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 길이", sub_category_en: "Length", expression_ko: "중간", ui_type: "단일 선택" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 길이", sub_category_en: "Length", expression_ko: "길다", ui_type: "단일 선택" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "깔끔함", ui_type: "멀티 태그" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "상쾌함", ui_type: "멀티 태그" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "드라이함", ui_type: "멀티 태그" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "쌉쌀함", ui_type: "멀티 태그" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "달콤함", ui_type: "멀티 태그" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "깔끔하게 사라지는", ui_type: "멀티 태그" },
  { category_id: "finish", category_ko: "여운", category_en: "Finish", sub_category_ko: "여운 특성", sub_category_en: "Character", expression_ko: "은은하게 남는", ui_type: "멀티 태그" },

  // ===== 5. 전체 인상 (Overall) =====
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "스타일", sub_category_en: "Style", expression_ko: "모던한", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "스타일", sub_category_en: "Style", expression_ko: "전통적인", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "스타일", sub_category_en: "Style", expression_ko: "세련된", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "스타일", sub_category_en: "Style", expression_ko: "소박한", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "스타일", sub_category_en: "Style", expression_ko: "우아한", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "스타일", sub_category_en: "Style", expression_ko: "조화로운", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "특징", sub_category_en: "Feature", expression_ko: "밸런스가 좋은", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "특징", sub_category_en: "Feature", expression_ko: "개성이 강한", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "특징", sub_category_en: "Feature", expression_ko: "복합적인", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "특징", sub_category_en: "Feature", expression_ko: "깔끔한", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "추천 상황", sub_category_en: "Occasion", expression_ko: "식전주", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "추천 상황", sub_category_en: "Occasion", expression_ko: "식사 페어링", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "추천 상황", sub_category_en: "Occasion", expression_ko: "디저트 페어링", ui_type: "멀티 태그" },
  { category_id: "overall", category_ko: "전체 인상", category_en: "Overall", sub_category_ko: "추천 상황", sub_category_en: "Occasion", expression_ko: "혼술용", ui_type: "멀티 태그" },

  // ===== 7. 페어링/맥락 (Context) =====
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "불고기", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "삼겹살", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "전/부침개", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "치킨", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "해물요리", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "튀김", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "한식", sub_category_en: "Korean", expression_ko: "탕/찌개", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "사시미", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "스시", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "야키토리", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "라멘", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "덴푸라", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "오뎅/나베", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "일식", sub_category_en: "Japanese", expression_ko: "장어요리", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "양식", sub_category_en: "Western", expression_ko: "스테이크", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "양식", sub_category_en: "Western", expression_ko: "파스타", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "양식", sub_category_en: "Western", expression_ko: "치즈", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "양식", sub_category_en: "Western", expression_ko: "해산물", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "양식", sub_category_en: "Western", expression_ko: "샐러드", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "중식", sub_category_en: "Chinese", expression_ko: "딤섬", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "중식", sub_category_en: "Chinese", expression_ko: "마라요리", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "중식", sub_category_en: "Chinese", expression_ko: "볶음요리", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "중식", sub_category_en: "Chinese", expression_ko: "탕수육", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "상황", sub_category_en: "Occasion", expression_ko: "혼술", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "상황", sub_category_en: "Occasion", expression_ko: "데이트", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "상황", sub_category_en: "Occasion", expression_ko: "친구", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "상황", sub_category_en: "Occasion", expression_ko: "가족", ui_type: "멀티 태그" },
  { category_id: "kr_context", category_ko: "페어링등", category_en: "Context", sub_category_ko: "상황", sub_category_en: "Occasion", expression_ko: "비지니스", ui_type: "멀티 태그" }
];

// 카테고리 순서 및 아이콘 매핑
const TASTING_CATEGORIES = [
  { id: "aroma", ko: "향", en: "Aroma", icon: "🌸" },
  { id: "taste", ko: "맛", en: "Taste", icon: "👅" },
  { id: "body", ko: "바디감", en: "Body", icon: "🫧" },
  { id: "finish", ko: "여운", en: "Finish", icon: "✨" },
  { id: "overall", ko: "전체 인상", en: "Overall", icon: "🎯" },
  { id: "kr_context", ko: "페어링등", en: "Context", icon: "🍽️" }
];

// 카테고리별 데이터 구조화 헬퍼 (캐싱)
let _cachedStructure = null;
function buildTastingStructure() {
  if (_cachedStructure) return _cachedStructure;
  const structure = {};
  TASTING_CATEGORIES.forEach(cat => {
    structure[cat.id] = { ...cat, subcategories: {} };
  });

  TASTING_DICTIONARY.forEach(item => {
    const cat = structure[item.category_id];
    if (!cat) return;
    if (!cat.subcategories[item.sub_category_ko]) {
      cat.subcategories[item.sub_category_ko] = {
        sub_en: item.sub_category_en,
        ui_type: item.ui_type,
        expressions: []
      };
    }
    cat.subcategories[item.sub_category_ko].expressions.push({
      ko: item.expression_ko
    });
  });

  _cachedStructure = structure;
  return structure;
}
