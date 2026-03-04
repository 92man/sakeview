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
    localStorage.setItem('hideFeaturedUntil', today);
    hideFeatured();
}

function checkFeaturedVisibility() {
    const hiddenUntil = localStorage.getItem('hideFeaturedUntil');
    const today = new Date().toDateString();

    if (hiddenUntil === today) {
        hideEl('featuredSection');
    } else {
        showEl('featuredSection');
        updateFeaturedSake();
    }
}
