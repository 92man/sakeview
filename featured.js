// 이번 주의 추천 사케 데이터 (주간 순환)
const featuredSakes = [
    {
        name: "닷사이 준마이 다이긴죠 23",
        kanji: "獺祭 純米大吟醸 磨き二割三分",
        image: "image/dassai23.jpg",
        description: "야마구치현의 명품 사케 닷사이. 23% 정미보합의 준마이 다이긴죠로, 극도로 정제된 쌀로 만들어져 깨끗하고 섬세한 맛이 특징입니다. 과일향이 풍부하며 부드러운 단맛과 산미의 균형이 완벽합니다.",
        meta: ["🏭 아사히슈조", "📍 야마구치현", "🌾 야마다니시키"]
    },
    {
        name: "쿠보타 만주",
        kanji: "久保田 萬壽",
        image: "image/kubota_manju.jpg",
        description: "니가타현을 대표하는 프리미엄 사케. 우아한 향과 깔끔한 맛이 조화를 이루며, 부드러운 목넘김이 특징입니다. 축하 자리나 특별한 날에 어울리는 명품 사케입니다.",
        meta: ["🏭 아사히슈조", "📍 니가타현", "🌾 고시히카리"]
    },
    {
        name: "핫카이산 준마이 다이긴죠",
        kanji: "八海山 純米大吟醸",
        image: "image/hakkaisan_junmai_daiginjo.jpg",
        description: "니가타의 명수로 빚은 깨끗하고 청량한 사케. 은은한 과일향과 부드러운 감칠맛이 특징이며, 어떤 음식과도 잘 어울리는 만능 사케입니다.",
        meta: ["🏭 핫카이조", "📍 니가타현", "🌾 야마다니시키"]
    },
    {
        name: "쥬욘다이 혼조조",
        kanji: "十四代 本醸造",
        image: "image/juyondai_honjozo.jpg",
        description: "환상의 사케로 불리는 쥬욘다이. 화려한 과일향과 달콤한 맛, 깔끔한 여운이 완벽한 조화를 이룹니다. 구하기 어려운 프리미엄 사케의 대표주자입니다.",
        meta: ["🏭 타카기슈조", "📍 야마가타현", "🌾 야마다니시키"]
    },
    {
        name: "이비 화이트",
        kanji: "WHITE 射美 無濾過生",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-photos/048209e7-6493-4de1-a83a-0d11d65a9d29/featured_ibi_white.jpg",
        description: "'일본에서 가장 작은 양조장' 스기하라슈조가 오리지널 쌀 이비노호마레와 백국 누룩으로 빚은 환상의 사케. 사과 향과 달콤새콤한 산미, 은은하고 깔끔한 단맛이 매력으로, 현지에서도 추첨으로만 구할 수 있는 귀한 술입니다.",
        meta: ["🏭 스기하라슈조", "📍 기후현", "🌾 이비노호마레 (정미 60%)"]
    },
    {
        name: "토라이 아오모리 테루아",
        kanji: "杜來 青森テロワール酒",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-photos/048209e7-6493-4de1-a83a-0d11d65a9d29/featured_torai_aomori.jpg",
        description: "쌀·물·효모·유산균까지 전부 아오모리산만 쓴 테루아 사케. 13도의 저알코올에 진한 단맛(-17)과 상쾌한 산미(3.2)가 어우러져, '사과로 만든 화이트 와인'처럼 즐길 수 있습니다. 사케 입문자에게 특히 추천합니다.",
        meta: ["🏭 롯카슈조", "📍 아오모리현", "🌾 하나후부키 (정미 60%)"]
    },
    {
        name: "야마시로야 퍼스트 클래스",
        kanji: "山城屋 1st class",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-photos/048209e7-6493-4de1-a83a-0d11d65a9d29/featured_yamashiroya_1stclass.jpg",
        description: "'전량 준마이 다이긴조'를 내건 니가타 코시메이조의 상급 라인. 멜론과 바나나의 향, 은은한 단맛과 부드러운 산미·감칠맛의 밸런스, 그리고 깔끔하게 떨어지는 마무리까지 — 미슐랭급 식중주로 손색이 없습니다.",
        meta: ["🏭 코시메이조", "📍 니가타현", "🌾 잇폰지메 (정미 50%)"]
    },
    {
        name: "잇파쿠스이세이 준마이긴조",
        kanji: "一白水成 純米吟醸",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-photos/048209e7-6493-4de1-a83a-0d11d65a9d29/featured_ippakusuisei.jpg",
        description: "'흰 쌀과 물로 빚는 가장 맛있는 술'이라는 이름의 아키타 대표 준마이긴조. 사과를 연상시키는 달콤한 향이 혀를 감싸고, 가벼운 산미와 감칠맛이 뒤따릅니다. 자극적이지 않은 음식과의 페어링이 뛰어난 식중주입니다.",
        meta: ["🏭 후쿠로쿠주슈조", "📍 아키타현", "🌾 미야마니시키 (정미 50%)"]
    },
    {
        name: "우부스나 호마세 고노조",
        kanji: "産土 穂増 五農醸",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-photos/048209e7-6493-4de1-a83a-0d11d65a9d29/featured_ubusuna_homasu.jpg",
        description: "에도시대 재래종 쌀 호마세를 무비료·무농약으로 되살려 기모토·목통으로 빚은 구마모토의 역작. 혀를 감싸는 풍부한 기포에 단맛·신맛·감칠맛이 조화로운, 그야말로 '쌀로 만든 샴페인'입니다. 지금 일본에서 가장 구하기 어려운 사케 중 하나.",
        meta: ["🏭 하나노카슈조", "📍 구마모토현", "🌾 호마세 (재래종)"]
    },
    {
        name: "기쿠마사무네 햐쿠모쿠 Alt.3",
        kanji: "菊正宗 百黙 Alt.3",
        image: "https://atgfrwohilgucmheyuzu.supabase.co/storage/v1/object/public/sake-photos/048209e7-6493-4de1-a83a-0d11d65a9d29/featured_hyakumoku_alt3.jpg",
        description: "1659년 창업한 나다의 명문 기쿠마사무네가 130년 만에 선보인 프리미엄 브랜드 햐쿠모쿠의 '제3의 선택'. 특A지구 야마다니시키 원주들을 블렌딩해 화사한 향, 볼륨감 있는 단맛과 기분 좋은 쌉쌀함이 혼연일체로 어우러집니다.",
        meta: ["🏭 기쿠마사무네", "📍 효고현 나다", "🌾 야마다니시키 100%"]
    }
];

function updateFeaturedSake() {
    const now = new Date();
    const weekNumber = Math.floor((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    const sakeIndex = weekNumber % featuredSakes.length;
    const sake = featuredSakes[sakeIndex];

    document.getElementById('featuredTitle').innerHTML =
        `${sake.name} <span class="featured-kanji">(${sake.kanji})</span>`;
    document.getElementById('featuredDesc').textContent = sake.description;
    document.getElementById('featuredMeta').innerHTML =
        sake.meta.map(item => `<span>${item}</span>`).join('');

    const img = document.getElementById('featuredImage');
    img.src = sake.image;
    img.onerror = function() {
        this.style.display = 'none';
        this.nextElementSibling.style.display = 'flex';
    };
}

function hideFeatured() {
    hideEl('featuredSection');
}

function hideFeaturedToday() {
    const today = new Date().toDateString();
    safeStorageSet('hideFeaturedUntil', today);
    hideFeatured();
}

function checkFeaturedVisibility() {
    const hiddenUntil = safeStorageGet('hideFeaturedUntil');
    const today = new Date().toDateString();

    if (hiddenUntil === today) {
        hideEl('featuredSection');
    } else {
        showEl('featuredSection');
        updateFeaturedSake();
    }
}
