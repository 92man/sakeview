// === 사케 이름 선택기 (Sake Selector) ===
let selectedBrand = null;
let selectedProduct = null;
let sakeInputMode = 'db';

async function loadAndMergeCustomSakes() {
    try {
        const { data, error } = await supabaseClient
            .from('custom_sakes')
            .select('*');
        if (error || !data || data.length === 0) return;
        for (const cs of data) {
            const product = {
                name: cs.product_name,
                japanese: cs.japanese || '',
                grade: cs.grade || '',
                polishRate: cs.polish_rate || '-'
            };
            if (SAKE_DATABASE[cs.brand]) {
                const exists = SAKE_DATABASE[cs.brand].products.some(p => p.name === product.name);
                if (!exists) SAKE_DATABASE[cs.brand].products.push(product);
                if (!SAKE_DATABASE[cs.brand].brandJp && cs.brand_jp) {
                    SAKE_DATABASE[cs.brand].brandJp = cs.brand_jp;
                }
            } else {
                SAKE_DATABASE[cs.brand] = {
                    brandJp: cs.brand_jp || '',
                    products: [product]
                };
            }
        }
    } catch (e) {
        console.error('Custom sakes merge error:', e);
    }
}

function initSakeSelector() {
    if (typeof SAKE_DATABASE === 'undefined') return;
    renderBrandList(Object.keys(SAKE_DATABASE).sort());

    document.getElementById('brandList').addEventListener('click', function(e) {
        var item = e.target.closest('.sake-list-item');
        if (item && item.dataset.brand) selectBrand(item.dataset.brand);
    });

    document.getElementById('productList').addEventListener('click', function(e) {
        var item = e.target.closest('.sake-list-item');
        if (item && item.dataset.idx !== undefined) selectProduct(parseInt(item.dataset.idx));
    });
}

function renderBrandList(brands) {
    var brandList = document.getElementById('brandList');
    var html = '<div class="sake-list-header">브랜드 (' + brands.length + ')</div>';
    brands.forEach(function(brand) {
        var isSelected = selectedBrand === brand ? ' selected' : '';
        var entry = SAKE_DATABASE[brand];
        var label = escapeHtml(brand);
        if (entry.brandJp) label += ' <span class="item-jp">(' + escapeHtml(entry.brandJp) + ')</span>';
        html += '<div class="sake-list-item' + isSelected + '" data-brand="' + escapeHtml(brand) + '">' + label + '<div class="item-sub">' + entry.products.length + '개 제품</div></div>';
    });
    brandList.innerHTML = html;
}

function filterBrands(query) {
    if (typeof SAKE_DATABASE === 'undefined') return;
    var brands = Object.keys(SAKE_DATABASE).sort();
    var q = query.toLowerCase().trim();
    var filtered = q ? brands.filter(function(b) {
        var entry = SAKE_DATABASE[b];
        return b.toLowerCase().includes(q) || (entry.brandJp && entry.brandJp.includes(q));
    }) : brands;
    renderBrandList(filtered);
}

function selectBrand(brand) {
    selectedBrand = brand;
    selectedProduct = null;

    document.querySelectorAll('#brandList .sake-list-item').forEach(function(el) {
        el.classList.toggle('selected', el.dataset.brand === brand);
    });

    var productList = document.getElementById('productList');
    var products = SAKE_DATABASE[brand].products;
    var html = '<div class="sake-list-header">제품 (' + products.length + ')</div>';
    products.forEach(function(p, idx) {
        html += '<div class="sake-list-item" data-idx="' + idx + '">' + escapeHtml(p.name) + '<div class="item-sub">' + escapeHtml(p.japanese) + '</div></div>';
    });
    productList.innerHTML = html;

    updateSakeDisplay();
}

function selectProduct(idx) {
    if (!selectedBrand) return;
    var products = SAKE_DATABASE[selectedBrand].products;
    selectedProduct = products[idx];

    document.querySelectorAll('#productList .sake-list-item').forEach(function(el) {
        el.classList.toggle('selected', parseInt(el.dataset.idx) === idx);
    });

    updateSakeDisplay();
}

function updateSakeDisplay() {
    const display = document.getElementById('sakeSelectedDisplay');
    const hidden = document.getElementById('sakeName');

    if (selectedBrand && selectedProduct) {
        const fullName = selectedBrand + ' ' + selectedProduct.name;
        const japaneseName = selectedProduct.japanese;
        const displayName = fullName + (japaneseName ? ' (' + japaneseName + ')' : '');

        document.getElementById('sakeSelectedText').textContent = fullName;
        document.getElementById('sakeSelectedSub').textContent = japaneseName || '';
        display.classList.add('visible');
        hidden.value = displayName;
    } else {
        display.classList.remove('visible');
        hidden.value = '';
    }
}

function clearSakeSelection() {
    selectedBrand = null;
    selectedProduct = null;
    document.querySelectorAll('#brandList .sake-list-item').forEach(function(el) { el.classList.remove('selected'); });
    const productList = document.getElementById('productList');
    productList.innerHTML = '<div class="sake-list-header">제품</div><div class="sake-product-empty">브랜드를 선택하세요</div>';
    document.getElementById('sakeSelectedDisplay').classList.remove('visible');
    document.getElementById('sakeName').value = '';
}

function toggleSakeInputMode(mode) {
    sakeInputMode = mode;
    document.querySelectorAll('.sake-selector-tab').forEach(function(tab, i) {
        tab.classList.toggle('active', (i === 0 && mode === 'db') || (i === 1 && mode === 'manual'));
    });
    document.getElementById('sakeDbPanel').classList.toggle('active', mode === 'db');
    document.getElementById('sakeManualPanel').classList.toggle('active', mode === 'manual');

    if (mode === 'manual') {
        document.getElementById('sakeName').value = document.getElementById('sakeNameManual').value;
    } else {
        updateSakeDisplay();
    }
}

function getSakeNameValue() {
    if (sakeInputMode === 'manual') {
        return document.getElementById('sakeNameManual').value;
    }
    return document.getElementById('sakeName').value;
}

function resetSakeSelector() {
    sakeInputMode = 'db';
    selectedBrand = null;
    selectedProduct = null;
    document.querySelectorAll('.sake-selector-tab').forEach(function(tab, i) {
        tab.classList.toggle('active', i === 0);
    });
    document.getElementById('sakeDbPanel').classList.add('active');
    document.getElementById('sakeManualPanel').classList.remove('active');
    document.getElementById('brandSearch').value = '';
    document.getElementById('sakeNameManual').value = '';
    document.getElementById('sakeName').value = '';
    document.getElementById('sakeSelectedDisplay').classList.remove('visible');
    if (typeof SAKE_DATABASE !== 'undefined') renderBrandList(Object.keys(SAKE_DATABASE).sort());
    var productList = document.getElementById('productList');
    productList.innerHTML = '<div class="sake-list-header">제품</div><div class="sake-product-empty">브랜드를 선택하세요</div>';
    // OCR 모달 상태 초기화
    ocrPhotoData = null;
    var ocrPreview = document.getElementById('ocrPreviewImg');
    if (ocrPreview) { ocrPreview.style.display = 'none'; ocrPreview.src = ''; }
    var ocrPlaceholder = document.getElementById('ocrPlaceholder');
    if (ocrPlaceholder) ocrPlaceholder.style.display = '';
    var ocrPhotoArea = document.getElementById('ocrPhotoArea');
    if (ocrPhotoArea) ocrPhotoArea.classList.remove('has-photo');
    var ocrStartBtn = document.getElementById('ocrStartBtn');
    if (ocrStartBtn) ocrStartBtn.disabled = true;
    var ocrResults = document.getElementById('ocrResults');
    if (ocrResults) ocrResults.classList.remove('active');
    var ocrProgress = document.getElementById('ocrProgress');
    if (ocrProgress) ocrProgress.classList.remove('active');
}

function setSakeNameFromNote(sakeName) {
    if (!sakeName) return;
    if (typeof SAKE_DATABASE !== 'undefined') {
        for (var brand in SAKE_DATABASE) {
            var products = SAKE_DATABASE[brand].products;
            for (var i = 0; i < products.length; i++) {
                var p = products[i];
                var fullName = brand + ' ' + p.name;
                var displayName = fullName + (p.japanese ? ' (' + p.japanese + ')' : '');
                if (sakeName === displayName || sakeName === fullName) {
                    toggleSakeInputMode('db');
                    selectBrand(brand);
                    selectProduct(i);
                    var brandEl = document.querySelector('#brandList .sake-list-item.selected');
                    if (brandEl) brandEl.scrollIntoView({ block: 'nearest' });
                    return;
                }
            }
        }
    }
    toggleSakeInputMode('manual');
    document.getElementById('sakeNameManual').value = sakeName;
    document.getElementById('sakeName').value = sakeName;
}

// Sync manual input to hidden field
document.addEventListener('DOMContentLoaded', function() {
    var manualInput = document.getElementById('sakeNameManual');
    if (manualInput) {
        manualInput.addEventListener('input', function() {
            if (sakeInputMode === 'manual') {
                document.getElementById('sakeName').value = this.value;
            }
        });
    }
});
