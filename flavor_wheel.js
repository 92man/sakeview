// === 사케 플레이버 휠 (6각형 — 6개 섹션 × 60°) ===
// 과일/꽃, 유제품, 곡물/누룩, 감칠맛, 산미, 단맛

const WHEEL_SECTIONS = [
    {
        id: 'fruit_flower', name: '과일/꽃',
        color: { mid: '#C07888', light: '#ECDAD6', sel: '#A05868',
                 midD: '#3A2028', lightD: '#30202A', selD: '#B06878' },
        sources: [
            { catId: 'aroma', sub: '과일/꽃 계열' }
        ],
        order: [
            '사과', '배', '멜론', '바나나', '복숭아',
            '포도', '감귤류', '파인애플', '리치', '딸기',
            '벚꽃', '매화', '은방울꽃', '꿀', '풀내음',
            '삼나무', '자스민', '아카시아', '허브', '솔향'
        ]
    },
    {
        id: 'dairy', name: '유제품',
        color: { mid: '#486878', light: '#C8CDD0', sel: '#305060',
                 midD: '#1A2830', lightD: '#182428', selD: '#6A8898' },
        sources: [
            { catId: 'aroma', sub: '유제품 계열' }
        ],
        order: ['요거트', '생크림/크림', '우유', '버터', '크림치즈', '사워크림', '연유', '버터밀크', '커스터드', '마스카포네']
    },
    {
        id: 'grain', name: '곡물/누룩',
        color: { mid: '#A08050', light: '#DDD0B8', sel: '#886838',
                 midD: '#302818', lightD: '#282420', selD: '#A08848' },
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
        color: { mid: '#908858', light: '#DCD8C0', sel: '#787848',
                 midD: '#282818', lightD: '#242420', selD: '#908858' },
        sources: [
            { catId: 'taste', sub: '감칠맛' }
        ],
        order: ['카라멜', '은은한 감칠맛', '다시마맛', '해산물맛', '된장맛', '간장맛', '깊은 감칠맛']
    },
    {
        id: 'sour', name: '산미',
        color: { mid: '#789850', light: '#D4DCC0', sel: '#588038',
                 midD: '#1E2C18', lightD: '#1E2820', selD: '#70A050' },
        sources: [
            { catId: 'taste', sub: '산미' }
        ],
        order: ['미네랄', '부드러운 산미', '사과 산미', '감귤 산미', '상쾌한 산미', '날카로운 산미']
    },
    {
        id: 'sweet', name: '단맛',
        color: { mid: '#C07040', light: '#E8D4C0', sel: '#A85830',
                 midD: '#381C14', lightD: '#302020', selD: '#C07848' },
        sources: [
            { catId: 'taste', sub: '단맛' }
        ],
        order: ['깔끔한 단맛', '은은한 단맛', '과일 단맛', '꿀 단맛', '초콜릿']
    }
];

// 레이더 웨지 전용 색상 (높은 채도, 구별 최적화)
const RADAR_COLORS = {
    fruit_flower: { light: '#D6286B', dark: '#E84888' },
    dairy:        { light: '#2878C8', dark: '#5098E0' },
    grain:        { light: '#D08818', dark: '#D89830' },
    umami:        { light: '#7B40A8', dark: '#9860C0' },
    sour:         { light: '#18944C', dark: '#30B068' },
    sweet:        { light: '#D84040', dark: '#E06060' }
};

// 휠 섹션 인덱스 ↔ 슬라이더 ID 매핑
const SLIDER_TO_SECTION = ['aroma_fruit', 'aroma_dairy', 'aroma_grain', 'umami', 'acidity', 'sweetness'];

// SVG 치수
const W = 640, CX = 320, CY = 320;
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
    const isDark = false; // 휠은 항상 라이트모드 색상 사용

    let svg = `<svg viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg" class="flavor-wheel-svg">`;

    // 그라데이션 정의: 원본 색상 (안개 아래 숨김)
    svg += '<defs>';
    WHEEL_SECTIONS.forEach(section => {
        const c = section.color;
        const midColor = isDark ? c.midD : c.mid;
        const lightColor = isDark ? c.lightD : c.light;
        // 중심원: mid→light 가 R1_OUT 안에서 완결
        svg += `<radialGradient id="gi-${section.id}" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1_OUT}">`;
        svg += `<stop offset="0%" stop-color="${midColor}"/>`;
        svg += `<stop offset="100%" stop-color="${lightColor}"/>`;
        svg += `</radialGradient>`;
        // 바깥링: mid→light
        svg += `<radialGradient id="go-${section.id}" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R3_OUT}">`;
        svg += `<stop offset="0%" stop-color="${midColor}"/>`;
        svg += `<stop offset="45%" stop-color="${midColor}"/>`;
        svg += `<stop offset="100%" stop-color="${lightColor}"/>`;
        svg += `</radialGradient>`;
    });
    // 안개 마스크: 흰=안개 보임, 검정=안개 제거(원본 색 드러남)
    svg += `<mask id="fog-mask">`;
    svg += `<rect width="${W}" height="${W}" fill="white"/>`;
    WHEEL_SECTIONS.forEach((section, i) => {
        svg += `<path class="fog-cutout" data-section="${section.id}" data-section-idx="${i}" d="" fill="black"/>`;
    });
    svg += `</mask>`;
    svg += '</defs>';

    let offset = -90;
    let labelsHtml = '';
    let tagArcsHtml = '';
    let tagTextsHtml = '';

    sections.forEach(section => {
        const gradInner = `url(#gi-${section.id})`;
        const gradOuter = `url(#go-${section.id})`;

        // Ring 1: 섹션 배경 (중심원 그라데이션)
        svg += createArcPath(
            CX, CY, R1_IN, R1_OUT,
            offset, offset + SECTION_ANGLE,
            'wheel-cat-segment', gradInner,
            `data-section="${section.id}"`
        );

        // 섹션 라벨 — 가운데 원 중앙
        const midAngle = offset + SECTION_ANGLE / 2;
        const labelR = R1_OUT * 0.5;
        const labelPos = polarToXY(CX, CY, labelR, midAngle);
        labelsHtml += `<text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-cat-label" font-size="15">${section.name}</text>`;

        // 태그 배치: taste(단맛/산미/감칠맛)는 통합 1링, aroma는 2링
        const tagCount = section.tags.length;
        if (tagCount > 0) {
            const dataAttrs = (tag) =>
                `data-section="${section.id}" data-cat-id="${tag.catId}" data-sub-cat="${escapeAttr(tag.sub)}" data-expr="${escapeAttr(tag.ko)}" data-ui-type="${tag.uiType}"`;

            const isTaste = section.sources[0] && section.sources[0].catId === 'taste';

            if (isTaste) {
                // taste: 중간원+바깥원 통합 (R2_IN ~ R3_OUT)
                const mergedAngle = SECTION_ANGLE / tagCount;
                section.tags.forEach((tag, i) => {
                    const tagStart = offset + i * mergedAngle;
                    const tagEnd = tagStart + mergedAngle;

                    tagArcsHtml += createArcPath(
                        CX, CY, R2_IN, R3_OUT,
                        tagStart, tagEnd,
                        'wheel-segment', gradOuter,
                        `${dataAttrs(tag)} data-ring="merged" data-orig-fill="${gradOuter}"`
                    );

                    const tagMidAngle = tagStart + mergedAngle / 2;
                    const tagLabelR = (R2_IN + R3_OUT) / 2;
                    const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                    const fontSize = getWheelFontSize(mergedAngle);
                    if (fontSize > 0) {
                        const maxLen = getWheelMaxLen(fontSize);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        tagTextsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" data-wheel-expr="${escapeAttr(tag.ko)}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                    }
                });
            } else {
                // aroma: 기존 2링 (중간원 + 바깥원)
                const innerCount = Math.ceil(tagCount / 2);
                const outerCount = tagCount - innerCount;
                const innerTags = section.tags.slice(0, innerCount);
                const outerTags = section.tags.slice(innerCount);
                const innerAngle = SECTION_ANGLE / innerCount;
                const outerAngle = outerCount > 0 ? SECTION_ANGLE / outerCount : 0;

                innerTags.forEach((tag, i) => {
                    const tagStart = offset + i * innerAngle;
                    const tagEnd = tagStart + innerAngle;

                    tagArcsHtml += createArcPath(
                        CX, CY, R2_IN, R2_OUT,
                        tagStart, tagEnd,
                        'wheel-segment', gradOuter,
                        `${dataAttrs(tag)} data-ring="inner" data-orig-fill="${gradOuter}"`
                    );

                    const tagMidAngle = tagStart + innerAngle / 2;
                    const tagLabelR = (R2_IN + R2_OUT) / 2;
                    const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                    const fontSize = getWheelFontSize(innerAngle);
                    if (fontSize > 0) {
                        const maxLen = getWheelMaxLen(fontSize);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        tagTextsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" data-wheel-expr="${escapeAttr(tag.ko)}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                    }
                });

                outerTags.forEach((tag, i) => {
                    const tagStart = offset + i * outerAngle;
                    const tagEnd = tagStart + outerAngle;

                    tagArcsHtml += createArcPath(
                        CX, CY, R3_IN, R3_OUT,
                        tagStart, tagEnd,
                        'wheel-segment wheel-segment-outer', gradOuter,
                        `${dataAttrs(tag)} data-ring="outer" data-orig-fill="${gradOuter}"`
                    );

                    const tagMidAngle = tagStart + outerAngle / 2;
                    const tagLabelR = (R3_IN + R3_OUT) / 2;
                    const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                    const fontSize = getWheelFontSize(outerAngle);
                    if (fontSize > 0) {
                        const maxLen = getWheelMaxLen(fontSize);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        tagTextsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" data-wheel-expr="${escapeAttr(tag.ko)}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${labelText}</text>`;
                    }
                });
            }
        }

        offset += SECTION_ANGLE;
    });

    // 레이어 2: 태그 아크 (안개 아래)
    svg += tagArcsHtml;

    // 링 구분선
    svg += `<circle cx="${CX}" cy="${CY}" r="${R1_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.6))" stroke-width="1.5" pointer-events="none"/>`;
    // R2_OUT 구분선: aroma 섹션(-90°~90°)에만 표시 (taste 섹션은 통합 링이라 제외)
    svg += `<path d="M ${CX} ${CY - R2_OUT} A ${R2_OUT} ${R2_OUT} 0 0 1 ${CX} ${CY + R2_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.4))" stroke-width="0.8" pointer-events="none"/>`;

    // 레이어 3: 안개 오버레이 (마스크로 슬라이더 영역만 걷어냄)
    const fogColor = isDark ? 'rgba(24,24,24,0.78)' : 'rgba(255,255,255,0.78)';
    svg += `<circle cx="${CX}" cy="${CY}" r="${R3_OUT + 2}" fill="${fogColor}" mask="url(#fog-mask)" pointer-events="none" class="wheel-fog"/>`;

    // 레이어 4: 섹션 라벨 (안개 위, 항상 보임)
    svg += labelsHtml;

    // 레이어 5: 태그 텍스트 라벨 (안개 위, 항상 보임)
    svg += tagTextsHtml;

    // 레이어 6: 레이더 웨지 윤곽선 (최상단)
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

// ── 상태 업데이트 ──

function updateWheelVisuals() {
    const wrapper = document.getElementById('flavorWheelWrapper');
    if (!wrapper) return;
    const svg = wrapper.querySelector('svg');
    if (!svg) return;

    updateRadarOverlay(svg);
    updateWheelTagBold(svg);
}

function updateWheelTagBold(svg) {
    const isDark = false; // 휠은 항상 라이트모드 색상 사용
    // 섹션 색상 맵 생성
    const sectionColors = {};
    WHEEL_SECTIONS.forEach(s => {
        sectionColors[s.id] = { sel: isDark ? s.color.selD : s.color.sel, light: isDark ? s.color.lightD : s.color.light };
    });

    const labels = svg.querySelectorAll('text[data-wheel-expr]');
    labels.forEach(label => {
        const expr = label.dataset.wheelExpr;
        let isSelected = false;

        // 멀티 태그 확인
        for (const catId in tastingSelections) {
            const catSel = tastingSelections[catId];
            for (const sub in catSel) {
                if (catSel[sub].includes(expr)) { isSelected = true; break; }
            }
            if (isSelected) break;
        }

        // 단일 선택 확인
        if (!isSelected) {
            for (const key in tastingRadioSelections) {
                if (tastingRadioSelections[key] === expr) { isSelected = true; break; }
            }
        }

        if (isSelected) {
            label.classList.add('wheel-tag-selected');
        } else {
            label.classList.remove('wheel-tag-selected');
        }
    });

    // 아크 배경 색상 하이라이트
    const arcs = svg.querySelectorAll('path.wheel-segment[data-expr]');
    arcs.forEach(arc => {
        const expr = arc.dataset.expr;
        const sectionId = arc.dataset.section;
        let isSelected = false;

        // 멀티 태그 확인
        const catId = arc.dataset.catId;
        const subCat = arc.dataset.subCat;
        if (catId && subCat) {
            const catSel = tastingSelections[catId];
            isSelected = catSel && catSel[subCat] && catSel[subCat].includes(expr);
        }

        // 단일 선택 확인
        if (!isSelected) {
            const uiType = arc.dataset.uiType;
            if (uiType === '단일 선택') {
                const radioKey = catId + '_' + subCat;
                isSelected = tastingRadioSelections[radioKey] === expr;
            }
        }

        const colors = sectionColors[sectionId];
        if (colors) {
            const origFill = arc.dataset.origFill || colors.light;
            arc.setAttribute('fill', isSelected ? colors.sel : origFill);
        }
    });
}

// ── 레이더 웨지 ──

function updateRadarOverlay(svg) {
    const isDark = false; // 휠은 항상 라이트모드 색상 사용
    const RADAR_MAX_R = R3_OUT;
    const SLIDER_MAX = 5;

    WHEEL_SECTIONS.forEach((section, i) => {
        const cutout = svg.querySelector(`.fog-cutout[data-section="${section.id}"]`);
        const wedge = svg.querySelector(`.wheel-radar-wedge[data-section="${section.id}"]`);

        // 슬라이더 값(0~5)으로 웨지 크기 결정
        const sliderId = SLIDER_TO_SECTION[i];
        const sliderEl = document.getElementById('slider_' + sliderId);
        const sliderVal = sliderEl ? parseInt(sliderEl.value) : 0;

        if (sliderVal === 0) {
            if (cutout) cutout.setAttribute('d', '');
            if (wedge) { wedge.setAttribute('d', ''); wedge.setAttribute('fill', 'transparent'); }
            return;
        }

        const r = (sliderVal / SLIDER_MAX) * RADAR_MAX_R;

        const startAngle = -90 + i * SECTION_ANGLE;
        const endAngle = startAngle + SECTION_ANGLE;
        const gap = 1;
        const sa = startAngle + gap / 2;
        const ea = endAngle - gap / 2;
        const p1 = polarToXY(CX, CY, r, sa);
        const p2 = polarToXY(CX, CY, r, ea);

        const d = `M ${CX} ${CY} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`;

        // 안개 마스크 컷아웃 업데이트 (안개를 걷어냄)
        if (cutout) cutout.setAttribute('d', d);

        // 웨지 윤곽선 업데이트 (경계 표시)
        if (wedge) {
            wedge.setAttribute('d', d);
            wedge.setAttribute('fill', 'transparent');
            wedge.setAttribute('stroke', isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)');
            wedge.setAttribute('stroke-width', '0.8');
        }
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

    const classAttr = className ? ` class="${className}"` : '';
    return `<path d="${d}"${classAttr} fill="${fill}" ${attrs || ''}/>`;
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
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

let _wheelStaticGradId = 0;

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
    // 슬라이더 데이터 확인
    let parsedData;
    try { parsedData = JSON.parse(flavorJson); } catch(e) { parsedData = null; }
    const sliderData = (parsedData && parsedData.sliders) || {};
    const hasSliderData = SLIDER_TO_SECTION.some(k => (sliderData[k] || 0) > 0);

    // 레거시 호환: 슬라이더 없으면 태그 카운트
    const stats = parseFlavorStats(flavorJson);
    const hasTagData = stats.some(s => s.count > 0);

    if (!hasSliderData && !hasTagData) return '';

    const isDark = false; // 휠은 항상 라이트모드 색상 사용
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

    // 그라데이션 정의 (풀 모드, 고유 ID): 중심원용 + 바깥링용 분리
    const sgid = ++_wheelStaticGradId;
    if (!isMini) {
        svg += '<defs>';
        WHEEL_SECTIONS.forEach(section => {
            const c = section.color;
            const midColor = isDark ? c.midD : c.mid;
            const lightColor = isDark ? c.lightD : c.light;
            svg += `<radialGradient id="si${sgid}-${section.id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${R1_OUT}">`;
            svg += `<stop offset="0%" stop-color="${midColor}"/>`;
            svg += `<stop offset="100%" stop-color="${lightColor}"/>`;
            svg += `</radialGradient>`;
            svg += `<radialGradient id="so${sgid}-${section.id}" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${R3_OUT}">`;
            svg += `<stop offset="0%" stop-color="${midColor}"/>`;
            svg += `<stop offset="45%" stop-color="${midColor}"/>`;
            svg += `<stop offset="100%" stop-color="${lightColor}"/>`;
            svg += `</radialGradient>`;
        });
        svg += '</defs>';
    }

    let offset = -90;

    // 1. 섹션 배경 + 라벨 (풀 모드만)
    if (!isMini) {
        WHEEL_SECTIONS.forEach((section, i) => {
            const c = section.color;
            const sGradInner = `url(#si${sgid}-${section.id})`;

            svg += createArcPath(cx, cy, 0, r1Out, offset, offset + SECTION_ANGLE, '', sGradInner, 'pointer-events="none"');

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
            const sGradFill = `url(#so${sgid}-${section.id})`;

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

                    svg += createArcPath(cx, cy, R2_IN, R2_OUT, tagStart, tagEnd, '', sGradFill, 'pointer-events="none"');

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

                    svg += createArcPath(cx, cy, R3_IN, R3_OUT, tagStart, tagEnd, '', sGradFill, 'pointer-events="none"');

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
        // R2_OUT 구분선: aroma 섹션(-90°~90°)에만 표시
        svg += `<path d="M ${cx} ${cy - R2_OUT} A ${R2_OUT} ${R2_OUT} 0 0 1 ${cx} ${cy + R2_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.4))" stroke-width="0.8" pointer-events="none"/>`;
    }

    // 3. 레이더 웨지 계산 (컷아웃 + 미니용)
    const radarMaxR = isMini ? MINI_MAX_R : R3_OUT;
    const SLIDER_MAX = 5;

    // 웨지 d 경로 사전 계산
    const wedgePaths = [];
    offset = -90;
    if (hasSliderData) {
        WHEEL_SECTIONS.forEach((section, i) => {
            const sliderKey = SLIDER_TO_SECTION[i];
            const sliderVal = sliderData[sliderKey] || 0;
            if (sliderVal === 0) { wedgePaths.push(''); offset += SECTION_ANGLE; return; }
            const r = (sliderVal / SLIDER_MAX) * radarMaxR;
            const startAngle = offset;
            const endAngle = offset + SECTION_ANGLE;
            const gap = 1;
            const sa = startAngle + gap / 2;
            const ea = endAngle - gap / 2;
            const p1 = polarToXY(cx, cy, r, sa);
            const p2 = polarToXY(cx, cy, r, ea);
            wedgePaths.push(`M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`);
            offset += SECTION_ANGLE;
        });
    } else {
        // 레거시 태그 카운트 기반 웨지
        const MAIN_BONUS = 1.5;
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
            groupIdx.forEach((idx, gi) => { ratios[idx] = weighted[gi] / adjustedTotal; });
        });

        WHEEL_SECTIONS.forEach((section, i) => {
            if (ratios[i] === 0) { wedgePaths.push(''); offset += SECTION_ANGLE; return; }
            const r = Math.max(ratios[i] * radarMaxR, isMini ? 12 : 18);
            const startAngle = offset;
            const endAngle = offset + SECTION_ANGLE;
            const gap = 1;
            const sa = startAngle + gap / 2;
            const ea = endAngle - gap / 2;
            const p1 = polarToXY(cx, cy, r, sa);
            const p2 = polarToXY(cx, cy, r, ea);
            wedgePaths.push(`M ${cx} ${cy} L ${p1.x} ${p1.y} A ${r} ${r} 0 0 1 ${p2.x} ${p2.y} Z`);
            offset += SECTION_ANGLE;
        });
    }

    // 풀 모드: 안개 오버레이 + 마스크 (슬라이더 영역만 걷어냄)
    if (!isMini) {
        svg += `<mask id="fog-mask-${sgid}">`;
        svg += `<rect width="${W}" height="${W}" fill="white"/>`;
        wedgePaths.forEach((d, i) => {
            if (d) svg += `<path d="${d}" fill="black"/>`;
        });
        svg += `</mask>`;
        const sFogColor = isDark ? 'rgba(24,24,24,0.78)' : 'rgba(255,255,255,0.78)';
        svg += `<circle cx="${cx}" cy="${cy}" r="${R3_OUT + 2}" fill="${sFogColor}" mask="url(#fog-mask-${sgid})" pointer-events="none"/>`;
    }

    // 미니 모드: 기존 색상 웨지 (안개 개념 없음)
    if (isMini) {
        WHEEL_SECTIONS.forEach((section, i) => {
            if (!wedgePaths[i]) return;
            const rc = RADAR_COLORS[section.id] || { light: '#888', dark: '#aaa' };
            const fillColor = isDark ? rc.dark : rc.light;
            svg += `<path d="${wedgePaths[i]}" fill="${fillColor}" opacity="0.55" stroke="${isDark ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.7)'}" stroke-width="1.2" pointer-events="none"/>`;
        });
    }

    svg += `</svg>`;

    const wrapperClass = isMini ? 'static-wheel-mini' : 'static-wheel-full';
    return `<div class="${wrapperClass}">${svg}</div>`;
}

