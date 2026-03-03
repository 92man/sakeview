// === 사케 플레이버 휠 (6각형 레이더 차트 — 6개 섹션 × 60°) ===
// 과일/꽃, 유제품, 곡물/기타, 감칠맛, 신맛, 단맛

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
            '청포도', '감귤류', '파인애플', '리치', '딸기',
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
        id: 'grain', name: '곡물/기타',
        color: { mid: '#A08050', light: '#DDD0B8', sel: '#886838',
                 midD: '#302818', lightD: '#282420', selD: '#A08848' },
        sources: [
            { catId: 'aroma', sub: '곡물/기타 계열' }
        ],
        order: [
            '쌀/밥', '누룩', '찐쌀', '모찌/떡', '쌀가루',
            '누룩균향', '현미', '누룽지', '생쌀', '쌀겨',
            '견과류', '향신료'
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
        id: 'sour', name: '신맛',
        color: { mid: '#789850', light: '#D4DCC0', sel: '#588038',
                 midD: '#1E2C18', lightD: '#1E2820', selD: '#70A050' },
        sources: [
            { catId: 'taste', sub: '신맛' }
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

// 레이더 전용 색상 (높은 채도, 구별 최적화)
// 휠 섹션 인덱스 ↔ 슬라이더 ID 매핑
const SLIDER_TO_SECTION = ['aroma_fruit', 'aroma_dairy', 'aroma_grain', 'umami', 'acidity', 'sweetness'];

// SVG 치수 (중심원 축소, 레이더 영역 확대)
const W = 640, CX = 320, CY = 320;
const R1_IN = 0,   R1_OUT = 110;   // 중심원 (축소: 135→110)
const R2_IN = 113, R2_OUT = 207;   // 태그 중간 링
const R3_IN = 210, R3_OUT = 305;   // 태그 바깥 링
const SECTION_ANGLE = 60;

// ── 데이터 빌드 ──

let _cachedWheelTags = null;
function buildWheelTags() {
    if (_cachedWheelTags) return _cachedWheelTags;
    const structure = buildTastingStructure();
    _cachedWheelTags = WHEEL_SECTIONS.map(section => {
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
    return _cachedWheelTags;
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

// ── 레이더 헬퍼 ──

// 6각형 꼭지점 계산: 각 섹션 중앙 축 위에 점수 비례 거리
function calcRadarVertices(cx, cy, scores, rMin, rMax) {
    const step = (rMax - rMin) / 5;
    return WHEEL_SECTIONS.map((_, i) => {
        const axisAngle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
        const score = Math.max(0, Math.min(5, scores[i] || 0));
        const r = rMin + score * step;
        return polarToXY(cx, cy, r, axisAngle);
    });
}

function verticesStr(vertices) {
    return vertices.map(p => `${p.x},${p.y}`).join(' ');
}

// ── 렌더링 ──

function generateFlavorWheel() {
    const wrapper = document.getElementById('flavorWheelWrapper');
    if (!wrapper) return;

    const sections = buildWheelTags();
    const isDark = false; // 휠은 항상 라이트모드 색상 사용

    let svg = `<svg viewBox="0 0 ${W} ${W}" xmlns="http://www.w3.org/2000/svg" class="flavor-wheel-svg">`;

    // ── 그라데이션 + 안개 마스크 ──
    svg += '<defs>';
    WHEEL_SECTIONS.forEach(section => {
        const c = section.color;
        const midColor = c.mid;
        const lightColor = c.light;
        svg += `<radialGradient id="gi-${section.id}" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R1_OUT}">`;
        svg += `<stop offset="0%" stop-color="${midColor}"/>`;
        svg += `<stop offset="100%" stop-color="${lightColor}"/>`;
        svg += `</radialGradient>`;
        svg += `<radialGradient id="go-${section.id}" gradientUnits="userSpaceOnUse" cx="${CX}" cy="${CY}" r="${R3_OUT}">`;
        svg += `<stop offset="0%" stop-color="${midColor}"/>`;
        svg += `<stop offset="45%" stop-color="${midColor}"/>`;
        svg += `<stop offset="100%" stop-color="${lightColor}"/>`;
        svg += `</radialGradient>`;
    });
    // 안개 마스크: 흰=안개, 검정=안개 제거
    svg += `<mask id="fog-mask">`;
    svg += `<rect width="${W}" height="${W}" fill="white"/>`;
    svg += `<circle cx="${CX}" cy="${CY}" r="${R1_OUT}" fill="black"/>`; // 중심원은 항상 보임
    svg += `<polygon class="fog-cutout-hex" points="" fill="black"/>`; // 6각형 — 동적 업데이트
    svg += `</mask>`;
    svg += '</defs>';

    // ── 레이어 1: 중심원 섹션 + 태그 아크 ──
    let offset = -90;
    let labelsHtml = '';
    let tagArcsHtml = '';
    let tagTextsHtml = '';

    sections.forEach(section => {
        const gradInner = `url(#gi-${section.id})`;
        const gradOuter = `url(#go-${section.id})`;

        // 중심원 배경
        svg += createArcPath(CX, CY, R1_IN, R1_OUT, offset, offset + SECTION_ANGLE, 'wheel-cat-segment', gradInner, `data-section="${section.id}"`);

        // 카테고리 라벨
        const midAngle = offset + SECTION_ANGLE / 2;
        const labelR = R1_OUT * 0.48;
        const labelPos = polarToXY(CX, CY, labelR, midAngle);
        labelsHtml += `<text x="${labelPos.x}" y="${labelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-cat-label" font-size="13">${escapeAttr(section.name)}</text>`;

        // 태그 배치
        const tagCount = section.tags.length;
        if (tagCount > 0) {
            const dataAttrs = (tag) =>
                `data-section="${section.id}" data-cat-id="${tag.catId}" data-sub-cat="${escapeAttr(tag.sub)}" data-expr="${escapeAttr(tag.ko)}" data-ui-type="${tag.uiType}"`;

            const isTaste = section.sources[0] && section.sources[0].catId === 'taste';

            if (isTaste) {
                const mergedAngle = SECTION_ANGLE / tagCount;
                section.tags.forEach((tag, i) => {
                    const tagStart = offset + i * mergedAngle;
                    const tagEnd = tagStart + mergedAngle;
                    tagArcsHtml += createArcPath(CX, CY, R2_IN, R3_OUT, tagStart, tagEnd, 'wheel-segment', gradOuter, `${dataAttrs(tag)} data-ring="merged" data-orig-fill="${gradOuter}"`);
                    const tagMidAngle = tagStart + mergedAngle / 2;
                    const tagLabelR = (R2_IN + R3_OUT) / 2;
                    const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                    const fontSize = getWheelFontSize(mergedAngle);
                    if (fontSize > 0) {
                        const maxLen = getWheelMaxLen(fontSize);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        tagTextsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" data-wheel-expr="${escapeAttr(tag.ko)}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${escapeAttr(labelText)}</text>`;
                    }
                });
            } else {
                const innerCount = Math.ceil(tagCount / 2);
                const outerCount = tagCount - innerCount;
                const innerTags = section.tags.slice(0, innerCount);
                const outerTags = section.tags.slice(innerCount);
                const innerAngle = SECTION_ANGLE / innerCount;
                const outerAngle = outerCount > 0 ? SECTION_ANGLE / outerCount : 0;

                innerTags.forEach((tag, i) => {
                    const tagStart = offset + i * innerAngle;
                    const tagEnd = tagStart + innerAngle;
                    tagArcsHtml += createArcPath(CX, CY, R2_IN, R2_OUT, tagStart, tagEnd, 'wheel-segment', gradOuter, `${dataAttrs(tag)} data-ring="inner" data-orig-fill="${gradOuter}"`);
                    const tagMidAngle = tagStart + innerAngle / 2;
                    const tagLabelR = (R2_IN + R2_OUT) / 2;
                    const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                    const fontSize = getWheelFontSize(innerAngle);
                    if (fontSize > 0) {
                        const maxLen = getWheelMaxLen(fontSize);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        tagTextsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" data-wheel-expr="${escapeAttr(tag.ko)}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${escapeAttr(labelText)}</text>`;
                    }
                });

                outerTags.forEach((tag, i) => {
                    const tagStart = offset + i * outerAngle;
                    const tagEnd = tagStart + outerAngle;
                    tagArcsHtml += createArcPath(CX, CY, R3_IN, R3_OUT, tagStart, tagEnd, 'wheel-segment wheel-segment-outer', gradOuter, `${dataAttrs(tag)} data-ring="outer" data-orig-fill="${gradOuter}"`);
                    const tagMidAngle = tagStart + outerAngle / 2;
                    const tagLabelR = (R3_IN + R3_OUT) / 2;
                    const tagLabelPos = polarToXY(CX, CY, tagLabelR, tagMidAngle);
                    const fontSize = getWheelFontSize(outerAngle);
                    if (fontSize > 0) {
                        const maxLen = getWheelMaxLen(fontSize);
                        const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                        tagTextsHtml += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-tag-label" font-size="${fontSize}" data-wheel-expr="${escapeAttr(tag.ko)}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${escapeAttr(labelText)}</text>`;
                    }
                });
            }
        }
        offset += SECTION_ANGLE;
    });

    // 태그 아크 (안개 아래)
    svg += tagArcsHtml;

    // ── 레이어 2: 점수 그리드 + 구분선 (안개 아래) ──
    const scoreStep = (R3_OUT - R1_OUT) / 5;
    for (let s = 1; s <= 5; s++) {
        const gridR = R1_OUT + s * scoreStep;
        svg += `<circle cx="${CX}" cy="${CY}" r="${gridR}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" pointer-events="none"/>`;
    }
    // 축선 (각 섹션 중앙, 안개 아래)
    WHEEL_SECTIONS.forEach((_, i) => {
        const axisAngle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
        const pIn = polarToXY(CX, CY, R1_OUT, axisAngle);
        const pOut = polarToXY(CX, CY, R3_OUT, axisAngle);
        svg += `<line x1="${pIn.x}" y1="${pIn.y}" x2="${pOut.x}" y2="${pOut.y}" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" pointer-events="none"/>`;
    });

    // 링 구분선
    svg += `<circle cx="${CX}" cy="${CY}" r="${R1_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.6))" stroke-width="1.5" pointer-events="none"/>`;
    svg += `<path d="M ${CX} ${CY - R2_OUT} A ${R2_OUT} ${R2_OUT} 0 0 1 ${CX} ${CY + R2_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.4))" stroke-width="0.8" pointer-events="none"/>`;

    // ── 레이어 3: 안개 오버레이 ──
    const fogColor = 'rgba(255,255,255,0.78)';
    svg += `<circle cx="${CX}" cy="${CY}" r="${R3_OUT + 2}" fill="${fogColor}" mask="url(#fog-mask)" pointer-events="none" class="wheel-fog"/>`;

    // ── 레이어 4: 축선 (안개 위, 점선) ──
    WHEEL_SECTIONS.forEach((_, i) => {
        const axisAngle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
        const pIn = polarToXY(CX, CY, R1_OUT, axisAngle);
        const pOut = polarToXY(CX, CY, R3_OUT, axisAngle);
        svg += `<line x1="${pIn.x}" y1="${pIn.y}" x2="${pOut.x}" y2="${pOut.y}" stroke="rgba(0,0,0,0.08)" stroke-width="0.5" stroke-dasharray="4,3" pointer-events="none"/>`;
    });

    // ── 레이어 5: 라벨 (안개 위) ──
    svg += labelsHtml;
    svg += tagTextsHtml;

    // ── 레이어 6: 레이더 6각형 윤곽선 (최상단) ──
    svg += `<polygon class="wheel-radar-hex" points="" fill="transparent" stroke="transparent" stroke-width="1.5" stroke-linejoin="round" pointer-events="none"/>`;

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
    const isDark = false;
    const sectionColors = {};
    WHEEL_SECTIONS.forEach(s => {
        sectionColors[s.id] = { sel: s.color.sel, light: s.color.light };
    });

    const labels = svg.querySelectorAll('text[data-wheel-expr]');
    labels.forEach(label => {
        const expr = label.dataset.wheelExpr;
        let isSelected = false;

        for (const catId in tastingSelections) {
            const catSel = tastingSelections[catId];
            for (const sub in catSel) {
                if (catSel[sub].includes(expr)) { isSelected = true; break; }
            }
            if (isSelected) break;
        }

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

    const arcs = svg.querySelectorAll('path.wheel-segment[data-expr]');
    arcs.forEach(arc => {
        const expr = arc.dataset.expr;
        const sectionId = arc.dataset.section;
        let isSelected = false;

        const catId = arc.dataset.catId;
        const subCat = arc.dataset.subCat;
        if (catId && subCat) {
            const catSel = tastingSelections[catId];
            isSelected = catSel && catSel[subCat] && catSel[subCat].includes(expr);
        }

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

// ── 레이더 6각형 업데이트 ──

function updateRadarOverlay(svg) {
    const SLIDER_MAX = 5;
    const scoreStep = (R3_OUT - R1_OUT) / SLIDER_MAX;

    // 6개 축 꼭지점 계산
    const vertices = [];
    let hasAnyScore = false;

    WHEEL_SECTIONS.forEach((section, i) => {
        const sliderId = SLIDER_TO_SECTION[i];
        const sliderEl = document.getElementById('slider_' + sliderId);
        const sliderVal = sliderEl ? (parseInt(sliderEl.value) || 0) : 0;
        if (sliderVal > 0) hasAnyScore = true;

        const axisAngle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
        const r = R1_OUT + sliderVal * scoreStep;
        vertices.push(polarToXY(CX, CY, r, axisAngle));
    });

    const fogCutout = svg.querySelector('.fog-cutout-hex');
    const radarHex = svg.querySelector('.wheel-radar-hex');

    if (!hasAnyScore) {
        if (fogCutout) fogCutout.setAttribute('points', '');
        if (radarHex) {
            radarHex.setAttribute('points', '');
            radarHex.setAttribute('stroke', 'transparent');
        }
        return;
    }

    const pts = verticesStr(vertices);

    // 안개 마스크 컷아웃 (6각형 내부 안개 걷기)
    if (fogCutout) fogCutout.setAttribute('points', pts);

    // 레이더 윤곽선
    if (radarHex) {
        radarHex.setAttribute('points', pts);
        radarHex.setAttribute('stroke', 'rgba(0,0,0,0.15)');
        radarHex.setAttribute('stroke-width', '1.5');
        radarHex.setAttribute('fill', 'transparent');
    }
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
    let r = ((angle % 360) + 360) % 360;
    if (r > 90 && r < 270) r += 180;
    if (r >= 360) r -= 360;
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

    WHEEL_SECTIONS.forEach((section, idx) => {
        section.sources.forEach(src => {
            const catData = td.categories[src.catId];
            if (!catData) return;
            const subData = catData[src.sub];
            if (!subData) return;
            const tags = Array.isArray(subData) ? subData : [subData];
            stats[idx].count += tags.length;
            const catMain = mainTags[src.catId];
            if (catMain && tags.includes(catMain)) {
                stats[idx].hasMain = true;
            }
        });
    });

    return stats;
}

// 슬라이더 데이터 또는 태그 카운트에서 0~5 점수 배열 추출
function extractScores(flavorJson) {
    let parsedData;
    try { parsedData = JSON.parse(flavorJson); } catch(e) { parsedData = null; }
    const sliderData = (parsedData && parsedData.sliders) || {};
    const hasSliderData = SLIDER_TO_SECTION.some(k => (sliderData[k] || 0) > 0);

    if (hasSliderData) {
        return WHEEL_SECTIONS.map((_, i) => sliderData[SLIDER_TO_SECTION[i]] || 0);
    }

    // 레거시: 태그 카운트 → 점수 변환
    const stats = parseFlavorStats(flavorJson);
    const maxCount = Math.max(...stats.map(s => s.count), 1);
    return stats.map(s => {
        if (s.count === 0) return 0;
        let score = (s.count / maxCount) * 5;
        if (s.hasMain) score = Math.min(score + 0.5, 5);
        return Math.max(0.8, Math.round(score * 10) / 10);
    });
}

function generateStaticWheelSvg(flavorJson, mode) {
    const scores = extractScores(flavorJson);
    const hasAnyScore = scores.some(s => s > 0);

    if (!hasAnyScore) return '';

    const isDark = false;
    const isMini = (mode === 'mini');

    const vb = isMini ? 300 : W;
    const cx = vb / 2, cy = vb / 2;
    const MINI_MAX_R = vb / 2 - 5; // 145

    let svg = `<svg viewBox="0 0 ${vb} ${vb}" xmlns="http://www.w3.org/2000/svg" class="flavor-wheel-svg" style="pointer-events:none;">`;

    const sgid = ++_wheelStaticGradId;

    // ── 미니 모드: 깔끔한 레이더 차트 ──
    if (isMini) {
        // 풀 모드와 동일한 비율 유지: 중심원 → 바깥원
        const MINI_CENTER_R = Math.round(MINI_MAX_R * (R1_OUT / R3_OUT)); // ≈52
        const miniScoreRange = MINI_MAX_R - MINI_CENTER_R; // ≈93
        const miniStep = miniScoreRange / 5;

        // 중심원 배경 (각 섹션 색상)
        let offset = -90;
        WHEEL_SECTIONS.forEach(section => {
            const c = section.color;
            svg += createArcPath(cx, cy, 0, MINI_CENTER_R, offset, offset + SECTION_ANGLE, '', c.light, 'pointer-events="none" opacity="0.6"');
            offset += SECTION_ANGLE;
        });
        svg += `<circle cx="${cx}" cy="${cy}" r="${MINI_CENTER_R}" fill="none" stroke="rgba(255,255,255,0.6)" stroke-width="0.8" pointer-events="none"/>`;

        // 그리드 원 (점수 1~5 참고선)
        for (let s = 1; s <= 5; s++) {
            svg += `<circle cx="${cx}" cy="${cy}" r="${MINI_CENTER_R + s * miniStep}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" pointer-events="none"/>`;
        }

        // 축선
        WHEEL_SECTIONS.forEach((_, i) => {
            const angle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
            const pIn = polarToXY(cx, cy, MINI_CENTER_R, angle);
            const pOut = polarToXY(cx, cy, MINI_MAX_R, angle);
            svg += `<line x1="${pIn.x}" y1="${pIn.y}" x2="${pOut.x}" y2="${pOut.y}" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" pointer-events="none"/>`;
        });

        // 6각형 꼭지점 (중심원 가장자리부터 시작 — 풀 모드와 동일 비율)
        const vertices = WHEEL_SECTIONS.map((_, i) => {
            const angle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
            const r = MINI_CENTER_R + (scores[i] / 5) * miniScoreRange;
            return polarToXY(cx, cy, r, angle);
        });

        // 풀 휠과 동일한 방식: 섹션 파이 색상을 6각형으로 클리핑
        const hexClipId = 'mhc' + sgid;
        svg += `<defs><clipPath id="${hexClipId}"><polygon points="${verticesStr(vertices)}"/></clipPath></defs>`;
        offset = -90;
        svg += `<g clip-path="url(#${hexClipId})" pointer-events="none">`;
        WHEEL_SECTIONS.forEach(section => {
            const c = section.color;
            svg += createArcPath(cx, cy, 0, MINI_MAX_R, offset, offset + SECTION_ANGLE, '', c.mid, 'opacity="0.45"');
            offset += SECTION_ANGLE;
        });
        svg += `</g>`;

        // 6각형 윤곽
        svg += `<polygon points="${verticesStr(vertices)}" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="1.2" stroke-linejoin="round" pointer-events="none"/>`;

        svg += `</svg>`;
        const wrapperClass = 'static-wheel-mini';
        return `<div class="${wrapperClass}">${svg}</div>`;
    }

    // ── 풀 모드: 태그 링 + 6각형 레이더 안개 ──
    svg += '<defs>';
    WHEEL_SECTIONS.forEach(section => {
        const c = section.color;
        const midColor = c.mid;
        const lightColor = c.light;
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

    // 중심원 섹션 배경 + 라벨
    let offset = -90;
    WHEEL_SECTIONS.forEach((section, i) => {
        const sGradInner = `url(#si${sgid}-${section.id})`;
        svg += createArcPath(cx, cy, 0, R1_OUT, offset, offset + SECTION_ANGLE, '', sGradInner, 'pointer-events="none"');
        const midAngle = offset + SECTION_ANGLE / 2;
        const labelR = R1_OUT * 0.48;
        const pos = polarToXY(cx, cy, labelR, midAngle);
        svg += `<text x="${pos.x}" y="${pos.y}" text-anchor="middle" dominant-baseline="central" class="wheel-cat-label" font-size="13" pointer-events="none">${escapeAttr(section.name)}</text>`;
        offset += SECTION_ANGLE;
    });

    // 태그 링 (Ring2 + Ring3)
    let td;
    try { td = JSON.parse(flavorJson); } catch(e) { td = null; }

    offset = -90;
    const sections = buildWheelTags();
    sections.forEach(section => {
        const sGradFill = `url(#so${sgid}-${section.id})`;
        const tagCount = section.tags.length;
        if (tagCount > 0) {
            const innerCount = Math.ceil(tagCount / 2);
            const outerCount = tagCount - innerCount;
            const innerTags = section.tags.slice(0, innerCount);
            const outerTags = section.tags.slice(innerCount);
            const innerAngle = SECTION_ANGLE / innerCount;
            const outerAngle = outerCount > 0 ? SECTION_ANGLE / outerCount : 0;

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

            innerTags.forEach((tag, j) => {
                const tagStart = offset + j * innerAngle;
                const tagEnd = tagStart + innerAngle;
                svg += createArcPath(cx, cy, R2_IN, R2_OUT, tagStart, tagEnd, '', sGradFill, 'pointer-events="none"');
                const tagMidAngle = tagStart + innerAngle / 2;
                const tagLabelR = (R2_IN + R2_OUT) / 2;
                const tagLabelPos = polarToXY(cx, cy, tagLabelR, tagMidAngle);
                const fs = getWheelFontSize(innerAngle);
                if (fs > 0) {
                    const maxLen = getWheelMaxLen(fs);
                    const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                    const cls = `wheel-tag-label${selectedSet.has(tag.ko) ? ' wheel-tag-selected' : ''}`;
                    svg += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="${cls}" font-size="${fs}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${escapeAttr(labelText)}</text>`;
                }
            });

            outerTags.forEach((tag, j) => {
                const tagStart = offset + j * outerAngle;
                const tagEnd = tagStart + outerAngle;
                svg += createArcPath(cx, cy, R3_IN, R3_OUT, tagStart, tagEnd, '', sGradFill, 'pointer-events="none"');
                const tagMidAngle = tagStart + outerAngle / 2;
                const tagLabelR = (R3_IN + R3_OUT) / 2;
                const tagLabelPos = polarToXY(cx, cy, tagLabelR, tagMidAngle);
                const fs = getWheelFontSize(outerAngle);
                if (fs > 0) {
                    const maxLen = getWheelMaxLen(fs);
                    const labelText = tag.ko.length > maxLen ? tag.ko.substring(0, maxLen - 1) + '..' : tag.ko;
                    const cls = `wheel-tag-label${selectedSet.has(tag.ko) ? ' wheel-tag-selected' : ''}`;
                    svg += `<text x="${tagLabelPos.x}" y="${tagLabelPos.y}" text-anchor="middle" dominant-baseline="central" class="${cls}" font-size="${fs}" pointer-events="none" transform="rotate(${getTextRotation(tagMidAngle)},${tagLabelPos.x},${tagLabelPos.y})">${escapeAttr(labelText)}</text>`;
                }
            });
        }
        offset += SECTION_ANGLE;
    });

    // 점수 그리드 + 축선
    const scoreStep = (R3_OUT - R1_OUT) / 5;
    for (let s = 1; s <= 5; s++) {
        const gridR = R1_OUT + s * scoreStep;
        svg += `<circle cx="${cx}" cy="${cy}" r="${gridR}" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" pointer-events="none"/>`;
    }
    WHEEL_SECTIONS.forEach((_, i) => {
        const axisAngle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
        const pIn = polarToXY(cx, cy, R1_OUT, axisAngle);
        const pOut = polarToXY(cx, cy, R3_OUT, axisAngle);
        svg += `<line x1="${pIn.x}" y1="${pIn.y}" x2="${pOut.x}" y2="${pOut.y}" stroke="rgba(0,0,0,0.06)" stroke-width="0.5" pointer-events="none"/>`;
    });

    // 링 구분선
    svg += `<circle cx="${cx}" cy="${cy}" r="${R1_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.6))" stroke-width="1.5" pointer-events="none"/>`;
    svg += `<path d="M ${cx} ${cy - R2_OUT} A ${R2_OUT} ${R2_OUT} 0 0 1 ${cx} ${cy + R2_OUT}" fill="none" stroke="var(--wheel-line-color, rgba(255,255,255,0.4))" stroke-width="0.8" pointer-events="none"/>`;

    // 6각형 안개 마스크
    const hexVertices = calcRadarVertices(cx, cy, scores, R1_OUT, R3_OUT);
    svg += `<mask id="fog-mask-${sgid}">`;
    svg += `<rect width="${W}" height="${W}" fill="white"/>`;
    svg += `<circle cx="${cx}" cy="${cy}" r="${R1_OUT}" fill="black"/>`; // 중심원 항상 보임
    svg += `<polygon points="${verticesStr(hexVertices)}" fill="black"/>`; // 6각형 안개 걷기
    svg += `</mask>`;
    const sFogColor = 'rgba(255,255,255,0.78)';
    svg += `<circle cx="${cx}" cy="${cy}" r="${R3_OUT + 2}" fill="${sFogColor}" mask="url(#fog-mask-${sgid})" pointer-events="none"/>`;

    // 축선 (안개 위, 점선)
    WHEEL_SECTIONS.forEach((_, i) => {
        const axisAngle = -90 + i * SECTION_ANGLE + SECTION_ANGLE / 2;
        const pIn = polarToXY(cx, cy, R1_OUT, axisAngle);
        const pOut = polarToXY(cx, cy, R3_OUT, axisAngle);
        svg += `<line x1="${pIn.x}" y1="${pIn.y}" x2="${pOut.x}" y2="${pOut.y}" stroke="rgba(0,0,0,0.08)" stroke-width="0.5" stroke-dasharray="4,3" pointer-events="none"/>`;
    });

    // 6각형 윤곽선
    svg += `<polygon points="${verticesStr(hexVertices)}" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" stroke-linejoin="round" pointer-events="none"/>`;

    svg += `</svg>`;
    return `<div class="static-wheel-full">${svg}</div>`;
}
