// === 사케 플레이버 휠 (6각형 — 6개 섹션 × 60°) ===
// 과일/꽃, 유제품, 곡물/누룩, 감칠맛, 산미, 단맛

const WHEEL_SECTIONS = [
    {
        id: 'fruit_flower', name: '과일/꽃',
        color: { mid: '#E0899E', light: '#F8DDE4', sel: '#C8506A',
                 midD: '#502030', lightD: '#3D2830', selD: '#C8506A' },
        sources: [
            { catId: 'aroma', sub: '과일 계열' },
            { catId: 'aroma', sub: '꽃/식물 계열' }
        ],
        order: [
            '사과', '배', '멜론', '바나나', '복숭아',
            '포도', '감귤류', '파인애플', '리치', '딸기',
            '망고', '살구', '자두', '체리', '무화과',
            '벚꽃', '매화', '은방울꽃', '꿀', '풀내음', '삼나무',
            '자스민', '아카시아', '허브', '솔향',
            '백합', '국화', '금목서', '목련', '라벤더'
        ]
    },
    {
        id: 'dairy', name: '유제품',
        color: { mid: '#C8DDE8', light: '#EDF4F8', sel: '#8BB8D0',
                 midD: '#2A3D48', lightD: '#253540', selD: '#6AA0C0' },
        sources: [
            { catId: 'aroma', sub: '유제품 계열' }
        ],
        order: ['요거트', '생크림/크림', '우유', '버터', '크림치즈', '사워크림', '연유', '버터밀크', '커스터드', '마스카포네']
    },
    {
        id: 'grain', name: '곡물/누룩',
        color: { mid: '#D8A060', light: '#F5E4C8', sel: '#C08030',
                 midD: '#483818', lightD: '#3D3420', selD: '#C08030' },
        sources: [
            { catId: 'aroma', sub: '곡물/누룩 계열' }
        ],
        order: [
            '쌀/밥', '누룩', '찐쌀', '모찌/떡', '쌀가루',
            '누룩균향', '현미', '누룽지', '생쌀', '쌀겨'
        ]
    },
    {
        id: 'umami', name: '감칠맛',
        color: { mid: '#C8A888', light: '#F0E4D8', sel: '#A88060',
                 midD: '#3D3020', lightD: '#352D25', selD: '#A88060' },
        sources: [
            { catId: 'taste', sub: '감칠맛 (우마미)' }
        ],
        order: ['카라멜', '은은한 감칠맛', '다시마맛', '해산물맛', '된장맛', '간장맛', '깊은 감칠맛']
    },
    {
        id: 'sour', name: '산미',
        color: { mid: '#90C0A0', light: '#D8F0E0', sel: '#60A878',
                 midD: '#203828', lightD: '#253028', selD: '#60A878' },
        sources: [
            { catId: 'taste', sub: '신맛 (산미)' }
        ],
        order: ['미네랄', '부드러운 산미', '사과 산미', '감귤 산미', '상쾌한 산미', '날카로운 산미']
    },
    {
        id: 'sweet', name: '단맛',
        color: { mid: '#E8A0A0', light: '#FBE0E0', sel: '#D07070',
                 midD: '#402828', lightD: '#3D2828', selD: '#D07070' },
        sources: [
            { catId: 'taste', sub: '단맛' }
        ],
        order: ['깔끔한 단맛', '은은한 단맛', '과일 단맛', '꿀 단맛', '초콜릿']
    }
];

const MAIN_TAG_COLOR = '#D4A017';

// 레이더 웨지 전용 색상 (높은 채도, 구별 최적화)
const RADAR_COLORS = {
    fruit_flower: { light: '#D6286B', dark: '#E84888' },
    dairy:        { light: '#2878C8', dark: '#5098E0' },
    grain:        { light: '#D08818', dark: '#D89830' },
    umami:        { light: '#7B40A8', dark: '#9860C0' },
    sour:         { light: '#18944C', dark: '#30B068' },
    sweet:        { light: '#D84040', dark: '#E06060' }
};

// SVG 치수
const W = 640, CX = 320, CY = 320;
const R_CENTER = 0;
const R1_IN = 0,   R1_OUT = 135;   // 섹션 링 (중심부터)
const R2_IN = 138, R2_OUT = 220;   // 태그 중간 링
const R3_IN = 223, R3_OUT = 305;   // 태그 바깥 링
const SECTION_ANGLE = 60;

// ── 데이터 빌드 ──

function buildWheelTags() {
    const structure = buildTastingStructure();
    return WHEEL_SECTIONS.map(section => {
        const tags = [];
        section.sources.forEach(src => {
            const cat = structure[src.catId];
            if (!cat) return;
            const sub = cat.subcategories[src.sub];
            if (!sub) return;
            sub.expressions.forEach(expr => {
                if (src.pick && !src.pick.includes(expr.ko)) return;
                tags.push({
                    ko: expr.ko,
                    catId: src.catId,
                    sub: src.sub,
                    uiType: sub.ui_type
                });
            });
        });
        // order 배열이 있으면 해당 순서로 정렬 (없는 태그는 뒤로)
        if (section.order) {
            tags.sort((a, b) => {
                const ai = section.order.indexOf(a.ko);
                const bi = section.order.indexOf(b.ko);
                return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
            });
        }
        return { ...section, tags };
    });
}

// ── 폰트 크기 헬퍼 ──

function getWheelFontSize(angle) {
    if (angle >= 20) return 14;
    if (angle >= 12) return 13;
    if (angle >= 8) return 12;
    if (angle >= 5) return 11;
    if (angle >= 3.5) return 10;
    return 9;
}

function getWheelMaxLen(fontSize) {
    return Math.floor(88 / fontSize);
}

// ── 렌더링 ──

function generateFlavorWheel() {
    const wrapper = document.getElementById('flavorWheelWrapper');
    if (!wrapper) return;

    const sections = buildWheelTags();
    const isDark = document.body.classList.contains('dark-mode');

    let svg = `<svg viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg" class="flavor-wheel-svg">`;

    let offset = -90;
    let labelsHtml = '';
    let tagsHtml = '';

    sections.forEach(section => {
        const c = section.color;
        const midFill = isDark ? c.midD : c.mid;
        const lightFill = isDark ? c.lightD : c.light;
        const outerFill = blendColor(
            isDark ? c.lightD : c.light,
            isDark ? c.midD : c.mid,
            0.35
        );

        // Ring 1: 섹션 배경
        svg += createArcPath(
            CX, CY, R1_IN, R1_OUT,
            offset, offset + SECTION_ANGLE,
            'wheel-cat-segment', midFill,
            `data-section="${section.id}"`
        );

        // 섹션 라벨 — 가운데 원 중앙
        const midAngle = offset + SECTION_ANGLE / 2;
        const labelR = R1_OUT * 0.5;
        const labelPos = polarToXY(CX, CY, labelR, midAngle);
        labelsHtml += `<text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-cat-label" font-size="15">${section.name}</text>`;

        // 태그를 중간원(Ring2)과 바깥원(Ring3)에 나누어 배치
        const tagCount = section.tags.length;
        if (tagCount > 0) {
            const innerCount = Math.ceil(tagCount / 2);
            const outerCount = tagCount - innerCount;
            const innerTags = section.tags.slice(0, innerCount);
            const outerTags = section.tags.slice(innerCount);
            const innerAngle = SECTION_ANGLE / innerCount;
            const outerAngle = outerCount > 0 ? SECTION_ANGLE / outerCount : 0;

            const dataAttrs = (tag) =>
                `data-section="${section.id}" data-cat-id="${tag.catId}" data-sub-cat="${escapeAttr(tag.sub)}" data-expr="${escapeAttr(tag.ko)}" data-ui-type="${tag.uiType}"`;

            // 중간원 태그
            innerTags.forEach((tag, i) => {
                const tagStart = offset + i * innerAngle;
                const tagEnd = tagStart + innerAngle;

                tagsHtml += createArcPath(
                    CX, CY, R2_IN, R2_OUT,
                    tagStart, tagEnd,
                    'wheel-segment', lightFill,
                    `${dataAttrs(tag)} data-ring="inner"`
                );

                const tagMidAngle = tagStart + innerAngle / 2;
                const tagLabelR = (R2_IN + R2_OUT) / 2;
                const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                const fontSize = getWheelFontSize(innerAngle);
                if (fontSize > 0) {
                    const maxLen = getWheelMaxLen(fontSize);
                    const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                    tagsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                }
            });

            // 바깥원 태그
            outerTags.forEach((tag, i) => {
                const tagStart = offset + i * outerAngle;
                const tagEnd = tagStart + outerAngle;

                tagsHtml += createArcPath(
                    CX, CY, R3_IN, R3_OUT,
                    tagStart, tagEnd,
                    'wheel-segment wheel-segment-outer', outerFill,
                    `${dataAttrs(tag)} data-ring="outer"`
                );

                const tagMidAngle = tagStart + outerAngle / 2;
                const tagLabelR = (R3_IN + R3_OUT) / 2;
                const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                const fontSize = getWheelFontSize(outerAngle);
                if (fontSize > 0) {
                    const maxLen = getWheelMaxLen(fontSize);
                    const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                    tagsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                }
            });
        }

        offset += SECTION_ANGLE;
    });

    // 레이어 2: 섹션 라벨
    svg += labelsHtml;

    // 레이어 3: 태그 세그먼트 + 라벨
    svg += tagsHtml;

    // 링 구분선
    svg += `<circle cx="${CX}" cy="${CY}" r="${R1_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.6))" stroke-width="1.5" pointer-events="none"/>`;
    svg += `<circle cx="${CX}" cy="${CY}" r="${R2_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.4))" stroke-width="0.8" pointer-events="none"/>`;

    // 레이어 4: 레이더 웨지 (최상단, 태그 위)
    svg += `<g class="wheel-radar" pointer-events="none">`;
    sections.forEach((section, i) => {
        svg += `<path class="wheel-radar-wedge" data-section="${section.id}" data-section-idx="${i}" d="" fill="transparent" pointer-events="none"/>`;
    });
    svg += `</g>`;

    svg += `</svg>`;
    wrapper.innerHTML = svg;

    updateWheelVisuals();

    // localStorage 토글 복원 (기본: 열림)
    const savedState = localStorage.getItem('flavorWheelOpen');
    if (savedState === 'false') {
        const container = document.getElementById('flavorWheelContainer');
        const arrow = document.getElementById('wheelToggleArrow');
        if (container) container.style.display = 'none';
        if (arrow) arrow.textContent = '\u25BC';
    }
}

// ── 색상 헬퍼 ──

function getSectionColors(sectionId) {
    const isDark = document.body.classList.contains('dark-mode');
    const section = WHEEL_SECTIONS.find(s => s.id === sectionId);
    if (!section) return { light: '#E8E0D8', outer: '#D0C8C0', selected: '#887868' };
    const c = section.color;
    const light = isDark ? c.lightD : c.light;
    const mid = isDark ? c.midD : c.mid;
    return {
        light,
        outer: blendColor(light, mid, 0.35),
        selected: isDark ? c.selD : c.sel
    };
}

function blendColor(c1, c2, ratio) {
    const h = s => parseInt(s, 16);
    const r1 = h(c1.slice(1,3)), g1 = h(c1.slice(3,5)), b1 = h(c1.slice(5,7));
    const r2 = h(c2.slice(1,3)), g2 = h(c2.slice(3,5)), b2 = h(c2.slice(5,7));
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
}

// ── 상태 업데이트 ──

function updateWheelVisuals() {
    const wrapper = document.getElementById('flavorWheelWrapper');
    if (!wrapper) return;
    const svg = wrapper.querySelector('svg');
    if (!svg) return;

    updateRadarOverlay(svg);
}

// ── 레이더 웨지 ──

function updateRadarOverlay(svg) {
    const sections = buildWheelTags();
    const isDark = document.body.classList.contains('dark-mode');
    const RADAR_MAX_R = R3_OUT;
    const MAIN_BONUS = 1.5;

    // 1. 섹션별 선택 수 + 메인 여부
    const stats = sections.map(section => {
        let count = 0;
        let hasMain = false;
        section.tags.forEach(tag => {
            let isSelected = false;
            if (tag.uiType === '단일 선택') {
                const radioKey = tag.catId + '_' + tag.sub;
                isSelected = tastingRadioSelections[radioKey] === tag.ko;
            } else {
                const catSel = tastingSelections[tag.catId];
                isSelected = catSel && catSel[tag.sub] && catSel[tag.sub].includes(tag.ko);
            }
            if (isSelected) count++;
            if (tag.uiType !== '단일 선택' && tastingMainTags[tag.catId] === tag.ko) hasMain = true;
        });
        return { count, hasMain };
    });

    // 2. 그룹별 비율 계산 — 향(0,1,2), 맛(3,4,5)
    const groups = [[0, 1, 2], [3, 4, 5]];
    const ratios = new Array(6).fill(0);

    groups.forEach(groupIdx => {
        let weighted = groupIdx.map(idx => {
            let w = stats[idx].count;
            if (stats[idx].hasMain && w > 0) w += MAIN_BONUS;
            return w;
        });

        const groupTotal = weighted.reduce((a, b) => a + b, 0);
        if (groupTotal === 0) return;

        // 메인 카테고리가 1등이 아니면 2등보다 살짝 위로
        groupIdx.forEach((idx, gi) => {
            if (stats[idx].hasMain && stats[idx].count > 0) {
                const sorted = [...weighted].sort((a, b) => b - a);
                if (weighted[gi] < sorted[0]) {
                    weighted[gi] = Math.max(weighted[gi], sorted[1] + 0.3);
                }
            }
        });

        const adjustedTotal = weighted.reduce((a, b) => a + b, 0);
        groupIdx.forEach((idx, gi) => {
            ratios[idx] = weighted[gi] / adjustedTotal;
        });
    });

    // 3. 웨지 그리기
    sections.forEach((section, i) => {
        const wedge = svg.querySelector(`.wheel-radar-wedge[data-section="${section.id}"]`);
        if (!wedge) return;

        if (ratios[i] === 0) {
            wedge.setAttribute('d', '');
            wedge.setAttribute('fill', 'transparent');
            return;
        }

        const r = Math.max(ratios[i] * RADAR_MAX_R, 18);

        const startAngle = -90 + i * SECTION_ANGLE;
        const endAngle = startAngle + SECTION_ANGLE;
        const gap = 1;
        const sa = startAngle + gap / 2;
        const ea = endAngle - gap / 2;
        const p1 = polarToXY(CX, CY, r, sa);
        const p2 = polarToXY(CX, CY, r, ea);

        wedge.setAttribute('d', `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`);

        const rc = RADAR_COLORS[section.id] || { light: '#888', dark: '#aaa' };
        wedge.setAttribute('fill', isDark ? rc.dark : rc.light);
        wedge.setAttribute('opacity', '0.55');
        wedge.setAttribute('stroke', isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)');
        wedge.setAttribute('stroke-width', '1.2');
    });
}

function toggleFlavorWheel() {
    const container = document.getElementById('flavorWheelContainer');
    const arrow = document.getElementById('wheelToggleArrow');
    if (!container) return;

    const isOpen = container.style.display !== 'none';
    container.style.display = isOpen ? 'none' : '';
    if (arrow) arrow.textContent = isOpen ? '\u25BC' : '\u25B2';
    localStorage.setItem('flavorWheelOpen', !isOpen);

    if (!isOpen) updateWheelVisuals();
}

// ── SVG 유틸리티 ──

function createArcPath(cx, cy, rIn, rOut, startAngle, endAngle, className, fill, attrs) {
    const gap = 0.4;
    const sa = startAngle + gap / 2;
    const ea = endAngle - gap / 2;
    if (ea <= sa) return '';

    const p1 = polarToXY(cx, cy, rIn, sa);
    const p2 = polarToXY(cx, cy, rOut, sa);
    const p3 = polarToXY(cx, cy, rOut, ea);
    const p4 = polarToXY(cx, cy, rIn, ea);

    const largeArc = (ea - sa) > 180 ? 1 : 0;

    const d = [
        `M ${p1.x} ${p1.y}`,
        `L ${p2.x} ${p2.y}`,
        `A ${rOut} ${rOut} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
        `L ${p4.x} ${p4.y}`,
        `A ${rIn} ${rIn} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
        'Z'
    ].join(' ');

    return `<path d="${d}" class="${className}" fill="${fill}" ${attrs || ''}/>`;
}

function polarToXY(cx, cy, r, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: Math.round((cx + r * Math.cos(rad)) * 100) / 100,
        y: Math.round((cy + r * Math.sin(rad)) * 100) / 100
    };
}

function getTextRotation(angle) {
    let r = angle;
    if (r > 90 && r < 270) r += 180;
    if (r > 360) r -= 360;
    return Math.round(r * 100) / 100;
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── 정적 휠 (저장된 노트용) ──

function parseFlavorStats(flavorJson) {
    const stats = WHEEL_SECTIONS.map(() => ({ count: 0, hasMain: false }));
    if (!flavorJson) return stats;

    let td;
    try { td = JSON.parse(flavorJson); } catch(e) { return stats; }
    if (!td || td.version !== 2 || !td.categories) return stats;

    const mainTags = td.mainTags || {};

    // sources 역매핑: catId+sub → 섹션 인덱스
    WHEEL_SECTIONS.forEach((section, idx) => {
        section.sources.forEach(src => {
            const catData = td.categories[src.catId];
            if (!catData) return;
            const subData = catData[src.sub];
            if (!subData) return;
            const tags = Array.isArray(subData) ? subData : [subData];
            stats[idx].count += tags.length;
            // mainTags 확인
            const catMain = mainTags[src.catId];
            if (catMain && tags.includes(catMain)) {
                stats[idx].hasMain = true;
            }
        });
    });

    return stats;
}

function generateStaticWheelSvg(flavorJson, mode) {
    const stats = parseFlavorStats(flavorJson);
    const hasAny = stats.some(s => s.count > 0);
    if (!hasAny) return '';

    const isDark = document.body.classList.contains('dark-mode');
    const isMini = (mode === 'mini');

    // 미니: 파이 웨지만 (배경 없음)
    // 풀: 3링 구조 + 웨지 (generateFlavorWheel과 동일 구조)
    const vb = isMini ? 300 : W;
    const cx = vb / 2, cy = vb / 2;

    // 미니 치수 — 최대 반지름을 viewBox 절반 이내로 제한
    const MINI_MAX_R = vb / 2 - 5; // 145

    // 풀 모드는 기존 치수 재사용
    const r1Out = R1_OUT;

    let svg = `<svg viewBox="0 0 ${vb} ${vb}" xmlns="http://www.w3.org/2000/svg" class="flavor-wheel-svg" style="pointer-events:none;">`;

    let offset = -90;

    // 1. 섹션 배경 + 라벨 (풀 모드만)
    if (!isMini) {
        WHEEL_SECTIONS.forEach((section, i) => {
            const c = section.color;
            const midFill = isDark ? c.midD : c.mid;

            svg += staticArcPath(cx, cy, 0, r1Out, offset, offset + SECTION_ANGLE, midFill);

            const midAngle = offset + SECTION_ANGLE / 2;
            const labelR = r1Out * 0.5;
            const pos = polarToXY(cx, cy, labelR, midAngle);
            svg += `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-cat-label" font-size="15" pointer-events="none">${section.name}</text>`;

            offset += SECTION_ANGLE;
        });
    }

    // 2. 풀 모드: 태그 링 (Ring2 + Ring3) — 저장된 태그를 표시
    if (!isMini) {
        let td;
        try { td = JSON.parse(flavorJson); } catch(e) { td = null; }
        const mainTags = (td && td.mainTags) || {};

        offset = -90;
        const sections = buildWheelTags();
        sections.forEach(section => {
            const c = section.color;
            const lightFill = isDark ? c.lightD : c.light;
            const outerFill = blendColor(
                isDark ? c.lightD : c.light,
                isDark ? c.midD : c.mid,
                0.35
            );

            const tagCount = section.tags.length;
            if (tagCount > 0) {
                const innerCount = Math.ceil(tagCount / 2);
                const outerCount = tagCount - innerCount;
                const innerTags = section.tags.slice(0, innerCount);
                const outerTags = section.tags.slice(innerCount);
                const innerAngle = SECTION_ANGLE / innerCount;
                const outerAngle = outerCount > 0 ? SECTION_ANGLE / outerCount : 0;

                // 선택된 태그 집합
                const selectedSet = new Set();
                if (td && td.categories) {
                    section.sources.forEach(src => {
                        const catData = td.categories[src.catId];
                        if (!catData) return;
                        const subData = catData[src.sub];
                        if (!subData) return;
                        const tags = Array.isArray(subData) ? subData : [subData];
                        tags.forEach(t => selectedSet.add(t));
                    });
                }

                // 중간원
                innerTags.forEach((tag, j) => {
                    const tagStart = offset + j * innerAngle;
                    const tagEnd = tagStart + innerAngle;
                    const isSelected = selectedSet.has(tag.ko);
                    const isMain = (mainTags[tag.catId] === tag.ko);
                    const fill = lightFill;

                    svg += staticArcPath(cx, cy, R2_IN, R2_OUT, tagStart, tagEnd, fill);

                    const tagMidAngle = tagStart + innerAngle / 2;
                    const tagLabelR = (R2_IN + R2_OUT) / 2;
                    const tagLabelPos = polarToXY(cx, cy, tagLabelR, tagMidAngle);
                    const fs = getWheelFontSize(innerAngle);
                    if (fs > 0) {
                        const maxLen = getWheelMaxLen(fs);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        const cls = `wheel-tag-label${isSelected ? ' wheel-tag-selected' : ''}`;
                        svg += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="${cls}" font-size="${fs}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                    }
                });

                // 바깥원
                outerTags.forEach((tag, j) => {
                    const tagStart = offset + j * outerAngle;
                    const tagEnd = tagStart + outerAngle;
                    const isSelected = selectedSet.has(tag.ko);
                    const isMain = (mainTags[tag.catId] === tag.ko);
                    const fill = outerFill;

                    svg += staticArcPath(cx, cy, R3_IN, R3_OUT, tagStart, tagEnd, fill);

                    const tagMidAngle = tagStart + outerAngle / 2;
                    const tagLabelR = (R3_IN + R3_OUT) / 2;
                    const tagLabelPos = polarToXY(cx, cy, tagLabelR, tagMidAngle);
                    const fs = getWheelFontSize(outerAngle);
                    if (fs > 0) {
                        const maxLen = getWheelMaxLen(fs);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        const cls = `wheel-tag-label${isSelected ? ' wheel-tag-selected' : ''}`;
                        svg += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="${cls}" font-size="${fs}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                    }
                });
            }

            offset += SECTION_ANGLE;
        });

        // 링 구분선
        svg += `<circle cx="${cx}" cy="${cy}" r="${R1_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.6))" stroke-width="1.5" pointer-events="none"/>`;
        svg += `<circle cx="${cx}" cy="${cy}" r="${R2_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.4))" stroke-width="0.8" pointer-events="none"/>`;
    }

    // 3. 레이더 웨지
    const MAIN_BONUS = 1.5;
    const radarMaxR = isMini ? MINI_MAX_R : R3_OUT;

    const groups = [[0, 1, 2], [3, 4, 5]];
    const ratios = new Array(6).fill(0);

    groups.forEach(groupIdx => {
        let weighted = groupIdx.map(idx => {
            let w = stats[idx].count;
            if (stats[idx].hasMain && w > 0) w += MAIN_BONUS;
            return w;
        });
        const groupTotal = weighted.reduce((a, b) => a + b, 0);
        if (groupTotal === 0) return;

        groupIdx.forEach((idx, gi) => {
            if (stats[idx].hasMain && stats[idx].count > 0) {
                const sorted = [...weighted].sort((a, b) => b - a);
                if (weighted[gi] < sorted[0]) {
                    weighted[gi] = Math.max(weighted[gi], sorted[1] + 0.3);
                }
            }
        });

        const adjustedTotal = weighted.reduce((a, b) => a + b, 0);
        groupIdx.forEach((idx, gi) => {
            ratios[idx] = weighted[gi] / adjustedTotal;
        });
    });

    offset = -90;
    WHEEL_SECTIONS.forEach((section, i) => {
        if (ratios[i] === 0) { offset += SECTION_ANGLE; return; }

        const r = Math.max(ratios[i] * radarMaxR, isMini ? 12 : 18);
        const startAngle = offset;
        const endAngle = offset + SECTION_ANGLE;
        const gap = 1;
        const sa = startAngle + gap / 2;
        const ea = endAngle - gap / 2;
        const p1 = polarToXY(cx, cy, r, sa);
        const p2 = polarToXY(cx, cy, r, ea);

        const rc = RADAR_COLORS[section.id] || { light: '#888', dark: '#aaa' };
        const fillColor = isDark ? rc.dark : rc.light;

        svg += `<path d="M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z" fill="${fillColor}" opacity="0.55" stroke="${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)'}" stroke-width="1.2" pointer-events="none"/>`;

        offset += SECTION_ANGLE;
    });

    svg += `</svg>`;

    const wrapperClass = isMini ? 'static-wheel-mini' : 'static-wheel-full';
    return `<div class="${wrapperClass}">${svg}</div>`;
}

function staticArcPath(cx, cy, rIn, rOut, startAngle, endAngle, fill) {
    const gap = 0.4;
    const sa = startAngle + gap / 2;
    const ea = endAngle - gap / 2;
    if (ea <= sa) return '';

    const p1 = polarToXY(cx, cy, rIn, sa);
    const p2 = polarToXY(cx, cy, rOut, sa);
    const p3 = polarToXY(cx, cy, rOut, ea);
    const p4 = polarToXY(cx, cy, rIn, ea);
    const largeArc = (ea - sa) > 180 ? 1 : 0;

    const d = [
        `M ${p1.x} ${p1.y}`,
        `L ${p2.x} ${p2.y}`,
        `A ${rOut} ${rOut} 0 ${largeArc} 1 ${p3.x} ${p3.y}`,
        `L ${p4.x} ${p4.y}`,
        `A ${rIn} ${rIn} 0 ${largeArc} 0 ${p1.x} ${p1.y}`,
        'Z'
    ].join(' ');

    return `<path d="${d}" fill="${fill}" pointer-events="none"/>`;
}
