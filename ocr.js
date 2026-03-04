// === 사케 OCR 사진 인식 모듈 ===

// 등급 한글→일본어 매핑 (OCR/AI 매칭 공용)
var GRADE_JP_MAP = {
    '다이긴죠': '大吟醸', '준마이다이긴죠': '純米大吟醸',
    '긴죠': '吟醸', '준마이긴죠': '純米吟醸',
    '준마이': '純米', '혼죠조': '本醸造',
    '도쿠베츠준마이': '特別純米', '도쿠베츠혼죠조': '特別本醸造',
    '토쿠베츠준마이': '特別純米', '토쿠베츠혼죠조': '特別本醸造'
};

var ocrPhotoData = null;
var ocrMethod = 'tesseract';
var tesseractWorker = null;
var tesseractLoaded = false;

// Tesseract.js 동적 로딩
function loadTesseract() {
    return new Promise(function(resolve, reject) {
        if (tesseractLoaded) { resolve(); return; }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';
        script.onload = function() { tesseractLoaded = true; resolve(); };
        script.onerror = function() { reject(new Error('Tesseract.js 로딩 실패')); };
        document.head.appendChild(script);
    });
}

// Tesseract 워커 초기화
async function initTesseractWorker() {
    if (tesseractWorker) return tesseractWorker;
    await loadTesseract();
    tesseractWorker = await Tesseract.createWorker('jpn+eng', 1, {
        logger: function(m) {
            if (m.status === 'recognizing text') {
                updateOcrProgress(Math.round(m.progress * 100), '텍스트 인식 중...');
            }
        }
    });
    return tesseractWorker;
}

// OCR 실행
async function runTesseractOcr(imageData) {
    updateOcrProgress(10, 'OCR 엔진 로딩 중...');
    var worker = await initTesseractWorker();
    updateOcrProgress(30, '이미지 분석 중...');
    var result = await worker.recognize(imageData);
    updateOcrProgress(100, '인식 완료!');
    return result.data.text;
}

// AI용 이미지 준비 (JPEG 변환 + 고품질 리사이즈)
function prepareImageForAi(base64) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxSize = 2048;
            var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.92));
        };
        img.onerror = function() { reject(new Error('이미지를 로드할 수 없습니다.')); };
        img.src = base64;
    });
}

// AI Vision OCR (Claude API via Supabase Edge Function)
async function runAiVisionOcr(base64) {
    updateOcrProgress(10, '이미지 준비 중...');
    // 항상 canvas 통과: HEIC→JPEG 변환, EXIF 회전 보정, 크기 제한
    var imageToSend = await prepareImageForAi(base64);
    updateOcrProgress(20, 'AI 분석 요청 중...');
    var resp = await supabaseClient.functions.invoke('sake-vision', {
        body: { image: imageToSend }
    });
    if (resp.error) {
        // 상세 에러 추출
        var errMsg = resp.error.message || 'AI Vision 호출 실패';
        try {
            if (resp.error.context && resp.error.context.json) {
                var errBody = await resp.error.context.json();
                errMsg += ': ' + (errBody.error || JSON.stringify(errBody));
            }
        } catch(e) {}
        throw new Error(errMsg);
    }
    var data = resp.data;
    // 문자열 응답인 경우 JSON 파싱
    if (typeof data === 'string') {
        try { data = JSON.parse(data); } catch(e) { data = { rawText: data }; }
    }
    if (data && data.error) {
        throw new Error(data.error);
    }
    updateOcrProgress(80, 'AI 분석 완료, 매칭 중...');
    return data || {};
}

// DB 검색 공통 — 브랜드/제품 반복·결과 수집·정렬을 한 곳에서 처리
function searchSakeDatabase(brandScoreFn, productScoreFn) {
    if (typeof SAKE_DATABASE === 'undefined') return [];
    var results = [];
    for (var brand in SAKE_DATABASE) {
        var entry = SAKE_DATABASE[brand];
        var brandJp = entry.brandJp || '';
        var brandScore = brandScoreFn(brand, brandJp, entry);
        if (brandScore === 0) continue;

        var products = entry.products;
        for (var pi = 0; pi < products.length; pi++) {
            var productScore = productScoreFn(brandScore, products[pi], brandJp);
            if (productScore > 20) {
                results.push({
                    brand: brand,
                    brandJp: brandJp,
                    productIdx: pi,
                    product: products[pi],
                    score: Math.min(productScore, 100)
                });
            }
        }
    }
    results.sort(function(a, b) { return b.score - a.score; });
    return results.slice(0, 5);
}

// AI 결과로 DB 매칭
function matchAiResultToDatabase(aiResult) {
    var aiBrand = (aiResult.brand || '').trim();
    var aiProduct = (aiResult.product || '').trim();
    var aiGrade = (aiResult.grade || '').trim();

    return searchSakeDatabase(
        function(brand, brandJp) {
            var score = 0;
            if (aiBrand && brandJp) {
                if (aiBrand === brandJp || brandJp.includes(aiBrand) || aiBrand.includes(brandJp)) {
                    score = 60;
                } else {
                    var bm = fuzzyContains(aiBrand, brandJp);
                    if (bm.found) score = Math.round(bm.score * 50);
                }
            }
            if (score === 0 && aiBrand) {
                if (brand.toLowerCase().includes(aiBrand.toLowerCase()) ||
                    aiBrand.toLowerCase().includes(brand.toLowerCase())) {
                    score = 30;
                }
            }
            return score;
        },
        function(brandScore, p, brandJp) {
            var productScore = brandScore;
            var jpName = p.japanese || '';
            if (aiProduct && jpName) {
                if (aiProduct === jpName || jpName.includes(aiProduct) || aiProduct.includes(jpName)) {
                    productScore += 30;
                } else {
                    var productPart = jpName;
                    if (brandJp && jpName.startsWith(brandJp)) {
                        productPart = jpName.substring(brandJp.length).trim();
                    }
                    var aiProductPart = aiProduct;
                    if (aiBrand && aiProduct.startsWith(aiBrand)) {
                        aiProductPart = aiProduct.substring(aiBrand.length).trim();
                    }
                    if (productPart && aiProductPart &&
                        (productPart.includes(aiProductPart) || aiProductPart.includes(productPart))) {
                        productScore += 25;
                    } else {
                        var pm = fuzzyContains(aiProduct, productPart);
                        if (pm.found) productScore += Math.round(pm.score * 20);
                    }
                }
            }
            if (aiGrade && p.grade) {
                var gradeJp = GRADE_JP_MAP[p.grade] || '';
                if (gradeJp && (aiGrade === gradeJp || aiGrade.includes(gradeJp) || gradeJp.includes(aiGrade))) {
                    productScore += 10;
                }
            }
            return productScore;
        }
    );
}

// 이미지 전처리 (리사이즈 + 그레이스케일 + 대비 강화)
function prepareImageForOcr(base64) {
    return new Promise(function(resolve, reject) {
        var img = new Image();
        img.onload = function() {
            var canvas = document.createElement('canvas');
            var maxSize = 1500;
            var scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            var ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // 그레이스케일 + 대비 강화
            var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            var data = imageData.data;
            for (var i = 0; i < data.length; i += 4) {
                var gray = data[i] * 0.299 + data[i+1] * 0.587 + data[i+2] * 0.114;
                // 대비 강화 (contrast stretching)
                gray = ((gray - 128) * 1.5) + 128;
                gray = Math.max(0, Math.min(255, gray));
                data[i] = data[i+1] = data[i+2] = gray;
            }
            ctx.putImageData(imageData, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = function() { reject(new Error('이미지를 로드할 수 없습니다.')); };
        img.src = base64;
    });
}

// 일본어 텍스트 정규화
function normalizeJapaneseText(text) {
    if (!text) return '';
    // 전각 → 반각 (숫자, 영문)
    text = text.replace(/[０-９]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    text = text.replace(/[Ａ-Ｚａ-ｚ]/g, function(c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); });
    // OCR 노이즈 제거
    text = text.replace(/[^\u3000-\u9FFF\uF900-\uFAFF\uFF00-\uFFEFa-zA-Z0-9\s%％。、・]/g, ' ');
    // 연속 공백 정리
    text = text.replace(/\s+/g, ' ').trim();
    return text;
}

// 레벤슈타인 거리
function levenshteinDistance(a, b) {
    if (!a || !b) return Math.max((a||'').length, (b||'').length);
    var matrix = [];
    for (var i = 0; i <= b.length; i++) matrix[i] = [i];
    for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (var i = 1; i <= b.length; i++) {
        for (var j = 1; j <= a.length; j++) {
            if (b.charAt(i-1) === a.charAt(j-1)) {
                matrix[i][j] = matrix[i-1][j-1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i-1][j-1] + 1,
                    matrix[i][j-1] + 1,
                    matrix[i-1][j] + 1
                );
            }
        }
    }
    return matrix[b.length][a.length];
}

// 퍼지 포함 검사 (슬라이딩 윈도우)
function fuzzyContains(haystack, needle) {
    if (!haystack || !needle || needle.length === 0) return { found: false, score: 0 };
    if (haystack.includes(needle)) return { found: true, score: 1.0 };
    var bestScore = 0;
    var windowSize = needle.length;
    for (var i = 0; i <= haystack.length - windowSize; i++) {
        var sub = haystack.substring(i, i + windowSize);
        var dist = levenshteinDistance(sub, needle);
        var score = 1 - (dist / windowSize);
        if (score > bestScore) bestScore = score;
    }
    // 부분 매칭도 허용 (needle이 더 긴 경우)
    if (needle.length > haystack.length) {
        var dist2 = levenshteinDistance(haystack, needle);
        var score2 = 1 - (dist2 / needle.length);
        if (score2 > bestScore) bestScore = score2;
    }
    return { found: bestScore >= 0.6, score: bestScore };
}

// OCR 텍스트 → DB 매칭
function matchOcrTextToDatabase(ocrText) {
    var normalized = normalizeJapaneseText(ocrText);
    var fullText = normalized;

    var gradeKeywords = ['純米大吟醸', '大吟醸', '純米吟醸', '吟醸', '純米', '本醸造', '特別純米', '特別本醸造'];
    var detectedGrades = [];
    gradeKeywords.forEach(function(g) {
        if (fullText.includes(g)) detectedGrades.push(g);
    });

    return searchSakeDatabase(
        function(brand, brandJp) {
            var score = 0;
            if (brandJp && brandJp.length >= 2) {
                if (fullText.includes(brandJp)) {
                    score = 50;
                } else {
                    var bm = fuzzyContains(fullText, brandJp);
                    if (bm.found) score = Math.round(bm.score * 40);
                }
            }
            if (score === 0) {
                var brandLower = brand.toLowerCase();
                var textLower = fullText.toLowerCase();
                if (textLower.includes(brandLower) && brand.length >= 2) {
                    score = 20;
                }
            }
            return score;
        },
        function(brandScore, p, brandJp) {
            var productScore = brandScore;
            var jpName = p.japanese || '';
            var productPart = jpName;
            if (brandJp && jpName.startsWith(brandJp)) {
                productPart = jpName.substring(brandJp.length).trim();
            }
            if (productPart && productPart.length >= 2) {
                if (fullText.includes(productPart)) {
                    productScore += 30;
                } else {
                    var pm = fuzzyContains(fullText, productPart);
                    if (pm.found) productScore += Math.round(pm.score * 20);
                }
            }
            if (detectedGrades.length > 0 && p.grade) {
                var gradeJp = GRADE_JP_MAP[p.grade] || '';
                if (gradeJp && detectedGrades.indexOf(gradeJp) >= 0) {
                    productScore += 15;
                }
            }
            return productScore;
        }
    );
}

// OCR 사진 프리뷰 공통 헬퍼
function _showOcrPreview() {
    var previewImg = document.getElementById('ocrPreviewImg');
    previewImg.src = ocrPhotoData;
    previewImg.style.display = 'block';
    hideEl('ocrPlaceholder');
    document.getElementById('ocrPhotoArea').classList.add('has-photo');
    document.getElementById('ocrStartBtn').disabled = false;
}

// 사진 처리
function handleOcrPhoto(event) {
    var file = event.target.files[0];
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function(e) {
        ocrPhotoData = e.target.result;
        _showOcrPreview();
    };
    reader.readAsDataURL(file);
}

// OCR 방식 선택
function selectOcrMethod(method) {
    ocrMethod = method;
    document.querySelectorAll('.ocr-method-btn').forEach(function(label) {
        var input = label.previousElementSibling;
        label.classList.toggle('active', input && input.value === method);
    });
}

// 진행바 업데이트
function updateOcrProgress(percent, text) {
    document.getElementById('ocrProgressBar').style.width = percent + '%';
    document.getElementById('ocrProgressText').textContent = text || '';
}

// 모달 열기
function openOcrModal() {
    document.getElementById('ocrModal').classList.add('active');
    document.body.style.overflow = 'hidden';
    if (currentPhotoData && !ocrPhotoData) {
        ocrPhotoData = currentPhotoData;
        _showOcrPreview();
    }
}

// 모달 닫기
function closeOcrModal() {
    document.getElementById('ocrModal').classList.remove('active');
    document.body.style.overflow = '';
}

// 원본 텍스트 토글
function toggleOcrRawText() {
    var content = document.getElementById('ocrRawContent');
    var toggle = content.previousElementSibling;
    var isActive = content.classList.toggle('active');
    toggle.textContent = (isActive ? '▼' : '▶') + ' 인식된 원본 텍스트 보기';
}

// 인식 시작
async function startOcrRecognition() {
    if (!ocrPhotoData) return;
    var startBtn = document.getElementById('ocrStartBtn');
    var progress = document.getElementById('ocrProgress');
    var results = document.getElementById('ocrResults');

    startBtn.disabled = true;
    results.classList.remove('active');
    progress.classList.add('active');

    try {
        var matches = [];
        var rawText = '';

        if (ocrMethod === 'ai') {
            var aiResult = await runAiVisionOcr(ocrPhotoData);
            rawText = aiResult.rawText || '';
            // AI 응답의 모든 텍스트를 합쳐서 매칭에 사용
            var searchText = [
                aiResult.brand || '',
                aiResult.product || '',
                aiResult.grade || '',
                rawText
            ].join(' ');
            // AI 구조화 매칭 + 전체 텍스트 매칭 둘 다 실행
            var aiMatches = matchAiResultToDatabase(aiResult);
            var textMatches = searchText ? matchOcrTextToDatabase(searchText) : [];
            // 합산 및 중복 제거 (같은 brand+productIdx면 높은 점수 유지)
            var allMatches = aiMatches.concat(textMatches);
            var seen = {};
            matches = [];
            allMatches.forEach(function(m) {
                var key = m.brand + '_' + m.productIdx;
                if (!seen[key] || seen[key].score < m.score) {
                    seen[key] = m;
                }
            });
            for (var k in seen) matches.push(seen[k]);
            matches.sort(function(a, b) { return b.score - a.score; });
            matches = matches.slice(0, 5);
            // 매칭 실패 시 AI 인식 결과를 rawText에 포함
            if (matches.length === 0) {
                rawText = 'AI 인식: ' + (aiResult.brand || '?') + ' / ' + (aiResult.product || '?') + ' / ' + (aiResult.grade || '?') + '\n원본: ' + (aiResult.rawText || '없음');
            }
        } else {
            updateOcrProgress(5, '이미지 전처리 중...');
            var processed = await prepareImageForOcr(ocrPhotoData);
            rawText = await runTesseractOcr(processed);
            matches = matchOcrTextToDatabase(rawText);
        }

        updateOcrProgress(100, '매칭 중...');
        displayOcrResults(matches, rawText);
    } catch (err) {
        console.error('OCR error:', err);
        updateOcrProgress(0, '오류 발생: ' + err.message);
        document.getElementById('ocrMatchList').innerHTML =
            '<div class="ocr-no-match">인식 중 오류가 발생했습니다.<br>' + escapeHtml(err.message) + '</div>';
        document.getElementById('ocrResults').classList.add('active');
    } finally {
        startBtn.disabled = false;
        setTimeout(function() { progress.classList.remove('active'); }, 1000);
    }
}

// 결과 표시
function displayOcrResults(matches, rawText) {
    var matchList = document.getElementById('ocrMatchList');
    var resultsDiv = document.getElementById('ocrResults');

    if (matches.length === 0) {
        matchList.innerHTML =
            '<div class="ocr-no-match">매칭되는 사케를 찾지 못했습니다.<br>직접 입력 모드를 사용해 주세요.</div>';
        // 매칭 실패 시 원본 텍스트 자동 펼치기
        var rawContent = document.getElementById('ocrRawContent');
        if (rawContent) rawContent.classList.add('active');
    } else {
        var html = '';
        matches.forEach(function(m) {
            html += '<div class="ocr-match-item" onclick="selectOcrMatch(\'' +
                escapeHtml(m.brand).replace(/'/g, "\\'") + '\', ' + m.productIdx + ')">';
            html += '<div class="ocr-match-info">';
            html += '<div class="ocr-match-name">' + escapeHtml(m.brand) + ' ' + escapeHtml(m.product.name) + '</div>';
            html += '<div class="ocr-match-sub">' + escapeHtml(m.product.japanese || '') + '</div>';
            html += '</div>';
            html += '<div class="ocr-match-score">' + m.score + '%</div>';
            html += '</div>';
        });
        matchList.innerHTML = html;
    }

    // 원본 텍스트
    document.getElementById('ocrRawContent').textContent = rawText || '(인식된 텍스트 없음)';
    resultsDiv.classList.add('active');
}

// 매칭 선택 → 기존 선택기에 반영
function selectOcrMatch(brand, productIdx) {
    toggleSakeInputMode('db');
    selectBrand(brand);
    selectProduct(productIdx);
    // 선택된 브랜드 스크롤
    var brandEl = document.querySelector('#brandList .sake-list-item.selected');
    if (brandEl) brandEl.scrollIntoView({ block: 'nearest' });
    closeOcrModal();
}
