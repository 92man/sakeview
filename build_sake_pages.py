# -*- coding: utf-8 -*-
"""
build_sake_pages.py

sake_database.js의 367개 브랜드를 정적 HTML 페이지로 빌드하는 스크립트.
flavor_profiles.json에 향미 프로필이 있는 132개 브랜드는 풍성한 콘텐츠로,
나머지는 등급/정미보합 기반 자동 생성 콘텐츠로 페이지를 만든다.

산출물:
  /sake/{slug}.html          개별 브랜드 페이지 367개
  /sake/index.html           전체 브랜드 허브 (A-Z 인덱스)
  sitemap.xml                기존 sitemap에 신규 URL 추가

실행:
  python build_sake_pages.py
"""

import json
import os
import re
import html
import hashlib
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT_DIR = ROOT / "sake"
OUT_DIR.mkdir(exist_ok=True)

# ------------------------------------------------------------------
# 1. 데이터 로딩
# ------------------------------------------------------------------

def load_sake_db():
    src = (ROOT / "sake_database.js").read_text(encoding="utf-8")
    js_literal = src.split("=", 1)[1].rstrip().rstrip(";").strip()
    return json.loads(js_literal)

def load_flavor_profiles():
    data = json.loads((ROOT / "flavor_profiles.json").read_text(encoding="utf-8"))
    # brandKo -> profile
    return {p["brandKo"]: p for p in data}

# ------------------------------------------------------------------
# 2. URL slug (한글 → ASCII 로마자)
# ------------------------------------------------------------------

# 한글 자모 → 로마자 매핑 (단순화된 한국어 표준 로마자 표기법 기반)
_INITIAL = ['g', 'kk', 'n', 'd', 'tt', 'r', 'm', 'b', 'pp', 's',
            'ss', '', 'j', 'jj', 'ch', 'k', 't', 'p', 'h']
_MEDIAL = ['a', 'ae', 'ya', 'yae', 'eo', 'e', 'yeo', 'ye', 'o', 'wa',
           'wae', 'oe', 'yo', 'u', 'wo', 'we', 'wi', 'yu', 'eu', 'ui', 'i']
# 받침은 7종성법으로 단순화 (k, n, t, l, m, p, ng)
_FINAL = ['', 'k', 'k', 'k', 'n', 'n', 'n', 't', 'l', 'k',
          'm', 'p', 'l', 'l', 'p', 'l', 'm', 'p', 'p', 't',
          't', 'ng', 't', 't', 'k', 't', 'p', 't']

# 메인 페이지에서 직접 링크되는 10개 브랜드는 일본어 헵번 표기 고정
# (이미 배포된 ASCII URL과의 일관성 유지)
_EXPLICIT_SLUG = {
    '닷사이': 'dassai',
    '쿠보타': 'kubota',
    '핫카이산': 'hakkaisan',
    '하쿠츠루': 'hakutsuru',
    '기쿠마사무네': 'kikumasamune',
    '가류바이': 'garyubai',
    '나베시마': 'nabeshima',
    '데와자쿠라': 'dewazakura',
    '키쿠히메': 'kikuhime',
    '카모츠루': 'kamotsuru',
}

def _hangul_to_roman(text: str) -> str:
    out = []
    for ch in text:
        code = ord(ch)
        if 0xAC00 <= code <= 0xD7A3:  # 한글 음절
            offset = code - 0xAC00
            ini = offset // (21 * 28)
            med = (offset % (21 * 28)) // 28
            fin = offset % 28
            out.append(_INITIAL[ini] + _MEDIAL[med] + _FINAL[fin])
        elif ch.isascii() and (ch.isalnum() or ch in '-_'):
            out.append(ch.lower())
        elif ch.isspace() or ch == '-':
            out.append('-')
        # 그 외(한자, 특수기호 등)는 무시
    return ''.join(out)

def make_slug(brand_ko: str) -> str:
    if brand_ko in _EXPLICIT_SLUG:
        return _EXPLICIT_SLUG[brand_ko]
    s = _hangul_to_roman(brand_ko.strip())
    s = re.sub(r"-+", "-", s).strip("-")
    return s or hashlib.md5(brand_ko.encode("utf-8")).hexdigest()[:8]

# ------------------------------------------------------------------
# 3. 등급별 콘텐츠 사전 (반복 회피를 위해 variant 다수)
# ------------------------------------------------------------------

GRADE_DESCRIPTIONS = {
    "블렌디드": [
        "여러 원주를 블렌딩하여 균형감과 복합미를 끌어낸 사케예요. 양조자의 감각이 가장 직접적으로 표현되는 스타일입니다.",
        "다양한 캐릭터의 사케를 조합해 만든 블렌디드 사케. 단일 빈티지에서는 얻기 어려운 입체적인 풍미가 매력입니다.",
        "블렌딩으로 완성한 사케. 향, 단맛, 산미, 감칠맛의 균형을 양조자가 의도적으로 설계한 작품성이 강한 한 잔입니다.",
    ],
    "고구마소주": [
        "엄밀히는 사케가 아닌 일본 증류주(쇼츄). 고구마 특유의 달콤하고 진한 풍미가 인상적이며, 록·미즈와리·오유와리 등 다양한 방식으로 즐길 수 있어요.",
        "고구마 베이스 쇼츄. 향이 진하고 입안에 길게 남는 단맛이 특징입니다. 차가운 물을 섞은 미즈와리로 즐기면 향이 더 살아납니다.",
    ],
    "보리소주": [
        "보리를 주원료로 한 일본 증류주. 깔끔하고 가벼운 풍미라 사케 입문자나 깔끔한 술을 좋아하시는 분께 어울려요. 록이나 하이볼로도 즐깁니다.",
    ],
    "메밀소주": [
        "메밀을 사용한 일본식 증류주. 부드러운 곡물향과 깨끗한 마무리가 특징이라 가벼운 식중주로 즐기기 좋습니다.",
    ],
    "쌀소주": [
        "쌀로 빚은 증류주. 사케의 향과 증류주의 깔끔함이 절묘하게 만나는 스타일입니다. 차게 마시면 향이 또렷하게 살아나요.",
    ],
    "리큐르": [
        "사케 베이스에 과실·꽃 등을 더한 리큐르. 단맛과 향이 풍부해 식전주나 디저트 와인 대신 즐기기 좋습니다.",
    ],
    "다이긴죠": [
        "정미보합 50% 이하까지 깎아낸 쌀로 빚는 최고급 등급입니다. 화려한 과일향과 섬세한 단맛, 그리고 깔끔한 피니시가 특징이에요. 차게 마실수록 향이 또렷하게 살아납니다.",
        "사케 등급 중 가장 정성을 들이는 다이긴조. 핵심부만 남긴 쌀과 저온 장기 발효로 얻어지는 우아한 아로마가 인상적입니다. 와인글라스에 따라 향을 충분히 즐겨보세요.",
        "쌀의 절반 이상을 깎아내고 정성껏 빚어 향과 맛의 균형이 가장 잘 잡힌 등급이에요. 첫 입에 퍼지는 멜론·배·흰꽃 같은 향이 인상적입니다.",
    ],
    "다이긴조": [
        "정미보합 50% 이하의 최고급 등급. 화려한 향과 섬세한 단맛이 동시에 살아 있어요. 8~12℃의 낮은 온도에서 향이 가장 잘 표현됩니다.",
        "쌀의 절반 이상을 깎아낸 다이긴조는 사케의 가장 화려한 얼굴이라 할 수 있어요. 와인글라스에 따라 향을 모아 즐기는 것을 추천합니다.",
    ],
    "준마이다이긴죠": [
        "양조용 알코올을 첨가하지 않고 쌀·물·누룩·효모만으로 빚은 최고급 등급입니다. 다이긴조 특유의 화려한 향에 쌀의 깊은 단맛이 더해져 풍성한 인상을 줍니다.",
        "정미보합 50% 이하, 양조 알코올 무첨가. 쌀이 가진 단맛과 감칠맛을 가장 정직하게 표현한 등급이에요. 음식과 함께 천천히 즐기기 좋습니다.",
    ],
    "준마이다이긴조": [
        "양조 알코올을 쓰지 않은 다이긴조. 쌀의 단맛과 다이긴조 특유의 향이 동시에 살아 있어요. 차갑게 마셔도, 살짝 미지근하게 마셔도 매력적입니다.",
    ],
    "긴죠": [
        "정미보합 60% 이하의 고급 등급. 가볍고 산뜻한 과일향에 깔끔한 마무리가 인상적이에요. 차게 마시면 향이 한층 또렷해집니다.",
        "쌀의 4할 이상을 깎아낸 긴조는 향 중심의 사케예요. 회·생선요리·담백한 일식과 잘 어울립니다.",
    ],
    "긴조": [
        "정미보합 60% 이하의 고급 등급. 산뜻한 과일향과 부드러운 단맛, 깔끔한 피니시가 특징입니다. 차게 즐기는 게 가장 맛있어요.",
    ],
    "준마이긴죠": [
        "양조 알코올을 첨가하지 않은 긴조 등급. 쌀의 단맛과 긴조 특유의 향이 균형 잡혀 있어요. 차게도, 살짝 데워서도 즐길 수 있습니다.",
        "쌀과 누룩만으로 빚은 긴조. 향은 적당히 화려하면서 입에서는 쌀의 단맛이 또렷하게 느껴져요. 일식 전반에 두루 어울립니다.",
    ],
    "준마이긴조": [
        "양조 알코올 없이 빚은 긴조. 단정한 향에 부드러운 쌀의 단맛이 더해져 균형감이 뛰어나요. 8~15℃ 범위에서 맛이 가장 잘 표현됩니다.",
    ],
    "준마이": [
        "쌀·물·누룩·효모만으로 빚은 정통 사케. 쌀의 단맛과 감칠맛이 깊게 느껴지는 등급이에요. 미지근하게 데워(누루칸/조칸) 마시면 풍미가 한층 살아납니다.",
        "양조 알코올을 쓰지 않은 가장 기본적인 정통 사케. 쌀의 향과 단맛, 그리고 살짝 묵직한 바디감이 매력입니다. 식사 술로 폭넓게 활용할 수 있어요.",
        "준마이는 양조 알코올 없이 쌀과 누룩만으로 빚어 쌀 본연의 풍미가 가장 진하게 느껴지는 등급입니다. 따끈하게 데워 마시면 감칠맛이 폭발하는 스타일이에요.",
    ],
    "혼죠죠": [
        "정미보합 70% 이하의 양조 알코올이 소량 첨가된 등급. 깔끔하고 가벼운 마무리가 특징이라 식중주(食中酒)로 즐기기 좋아요.",
        "사케 가운데 가장 부담 없이 마실 수 있는 등급. 차게도, 따뜻하게도 두루 즐길 수 있는 멀티 플레이어입니다.",
    ],
    "혼조조": [
        "정미보합 70% 이하의 깔끔한 사케 등급. 가격 대비 만족도가 높고, 식사와 함께 부담 없이 즐기기 좋은 데일리 사케예요.",
    ],
    "특별준마이": [
        "준마이 등급 중에서도 정미보합이나 양조 기법에서 한 단계 더 신경 쓴 특별판이에요. 쌀의 깊은 맛과 균형감이 한층 강화됩니다.",
    ],
    "기모토 준마이": [
        "전통 양조법 '기모토(生酛)'로 빚어 산미와 감칠맛이 깊게 어우러진 준마이입니다. 진한 풍미를 좋아하시는 분께 추천드려요.",
    ],
    "야마하이 준마이": [
        "전통 산모토 양조법의 변형인 야마하이(山廃)로 빚은 준마이. 깊은 감칠맛과 묵직한 산미가 어우러져 강한 풍미의 음식과 잘 맞습니다.",
    ],
    "나마자케": [
        "가열 살균을 거치지 않은 생사케. 신선하고 발랄한 풍미가 특징이라 차게 마시는 것이 필수입니다.",
    ],
    "나마겐슈": [
        "가열 살균도, 가수도 하지 않은 원액 사케. 알코올 도수가 높고 풍미가 진해 짧은 시간 천천히 음미하기 좋아요.",
    ],
    "스파클링": [
        "병내 2차 발효 또는 탄산 주입으로 거품을 만든 사케. 식전주나 디저트 와인 대용으로 즐기기 좋아요.",
    ],
    "발포 니고리": [
        "탁한 외관에 자연 발효의 거품이 살아있는 스타일. 부드러운 단맛과 청량감이 동시에 느껴져 사케 입문자에게 추천드립니다.",
    ],
    "리큐르": [
        "쌀이나 매실·복숭아 등을 베이스로 한 리큐르 스타일. 부담 없이 즐기는 식전주·식후주로 어울려요.",
    ],
}

PAIRING_BY_PROFILE = {
    "華やか": ["흰살 생선회", "샐러드", "치즈 (브리·카망베르)", "신선한 과일", "백숙·찜닭처럼 담백한 닭요리"],
    "芳醇": ["고기 요리 (특히 양념구이)", "스테이크", "장어구이", "된장 베이스 요리", "치즈 (블루치즈·체다)"],
    "重厚": ["삼겹살 구이", "소고기 스튜", "장조림", "두부 요리 (전골)", "감칠맛이 강한 발효 음식"],
    "穏やか": ["담백한 회·초밥", "두부 요리", "흰살 생선 소금구이", "야채 튀김", "은은한 맛의 찜 요리"],
    "辛口": ["회·초밥 전반", "튀김 요리", "구운 닭꼬치", "오징어·문어 요리", "기름진 안주"],
    "軽快": ["편백찜·물회", "두부김치", "샤브샤브", "냉채", "회덮밥"],
}

POLISH_INTERPRETATIONS = [
    ("60", "비교적 부드럽고 향이 살짝 살아있는 균형형. 부담 없이 마시기 좋아요."),
    ("50", "정미보합 50% 이하의 고급 영역. 향과 맛의 균형이 정교합니다."),
    ("40", "쌀의 60% 이상을 깎아낸 최상급 영역. 화려한 향과 섬세한 단맛이 동시에 표현됩니다."),
    ("30", "정미보합 30%대의 초정밀 영역. 쌀의 핵심부만 남겨 빚은, 우아하고 청정한 풍미."),
]

# ------------------------------------------------------------------
# 4. 콘텐츠 생성 헬퍼
# ------------------------------------------------------------------

def pick_variant(variants: list, brand_ko: str) -> str:
    """브랜드별로 일관된 variant를 선택 (해시 기반)."""
    if not variants:
        return ""
    idx = int(hashlib.md5(brand_ko.encode("utf-8")).hexdigest(), 16) % len(variants)
    return variants[idx]

def grade_explanation(grade: str, brand_ko: str) -> str:
    g = grade.strip()
    if g in GRADE_DESCRIPTIONS:
        return pick_variant(GRADE_DESCRIPTIONS[g], brand_ko + g)
    # 부분 매치 시도
    for key in GRADE_DESCRIPTIONS:
        if key in g or g in key:
            return pick_variant(GRADE_DESCRIPTIONS[key], brand_ko + g)
    return ""

def polish_rate_text(polish: str) -> str:
    s = str(polish).strip().rstrip("%")
    if not s or s == "-":
        return ""
    try:
        v = int(s)
    except ValueError:
        return ""
    if v <= 35:
        return f"정미보합 {v}% — 쌀의 핵심부만 남긴 최상위급. 향이 매우 화려하고 마무리가 깔끔합니다."
    if v <= 50:
        return f"정미보합 {v}% — 다이긴조급에 해당하는 정밀한 정미. 향과 맛의 균형이 잘 잡힙니다."
    if v <= 60:
        return f"정미보합 {v}% — 긴조급 정미. 산뜻한 향과 부드러운 단맛이 살아납니다."
    if v <= 70:
        return f"정미보합 {v}% — 식중주로 두루 즐길 수 있는 친근한 영역."
    return f"정미보합 {v}% — 쌀 본연의 묵직한 풍미가 강조되는 영역."

def flavor_interpretation(flavor: dict) -> tuple:
    """6차원 향미 점수에서 상위 2개를 뽑아 페어링 추천에 활용."""
    items = sorted(flavor.items(), key=lambda x: -x[1])
    top2 = []
    for k, _ in items[:2]:
        # f1_華やか -> 華やか
        label = k.split("_", 1)[-1]
        top2.append(label)
    pairings = []
    for label in top2:
        pairings.extend(PAIRING_BY_PROFILE.get(label, [])[:3])
    return top2, pairings[:6]

def flavor_axis_label(key: str) -> str:
    labels = {
        "華やか": "화려함 (花/果)",
        "芳醇": "방순함 (깊이)",
        "重厚": "중후함 (바디)",
        "穏やか": "온화함 (편안)",
        "辛口": "드라이 (가라구치)",
        "軽快": "경쾌함 (라이트)",
    }
    label = key.split("_", 1)[-1]
    return labels.get(label, label)

def serving_recommendation(grades: set) -> list:
    """브랜드의 등급 구성에 따라 음용법 추천. (제목, 본문) 튜플 리스트 반환."""
    grades_str = " ".join(grades)
    out = []
    if any(g in grades_str for g in ["다이긴", "긴죠", "긴조"]):
        out.append(("8~12℃ (스즈비에 · 하나비에)",
                    "화려한 향이 가장 또렷하게 살아나는 온도대예요. 와인글라스에 따르면 향이 모여 즐기기 좋습니다. 특히 다이긴조·긴조급은 이 온도에서 매력이 극대화됩니다."))
    if any(g in grades_str for g in ["준마이", "혼죠", "혼조", "특별"]) and not any(g in grades_str for g in ["나마"]):
        out.append(("15~20℃ (실온 · 히야)",
                    "쌀의 단맛과 감칠맛이 폭넓게 펼쳐지는 온도. 준마이 계열에서 가장 안정적인 표현을 보여줍니다. 사케잔이나 도자기 술잔이 어울려요."))
    if any(g in grades_str for g in ["준마이", "혼죠", "혼조"]):
        out.append(("40~45℃ (누루칸)",
                    "살짝 데우면 향이 부드럽게 열리고 감칠맛이 한층 진해집니다. 깔끔한 안주보다는 조림·전골 같은 따뜻한 음식과 잘 어울립니다."))
    if "나마" in grades_str:
        out.append(("5~10℃ (유키비에)",
                    "신선한 풍미가 핵심인 생사케는 차갑게 마셔야 제맛이에요. 잔에 따르자마자 한 모금 음미하시길 권합니다."))
    if any(g in grades_str for g in ["스파클링", "발포"]):
        out.append(("5~8℃ (잘 칠링)",
                    "스파클링·발포 스타일은 충분히 차갑게 즐겨야 거품과 산미가 살아납니다. 식전주나 디저트와 함께 드시면 더욱 좋습니다."))
    if any(g in grades_str for g in ["소주", "쇼츄"]):
        out.append(("기호에 따라 (스트레이트·록·미즈와리·오유와리)",
                    "쇼츄는 다양한 음용법으로 즐길 수 있는 술입니다. 스트레이트로 향을 음미해도 좋고, 미즈와리(찬물 1:1)나 오유와리(따뜻한 물)로 마시면 부담이 줄어듭니다."))
    if not out:
        out.append(("10~15℃의 약간 차가운 온도",
                    "사케 본연의 향과 맛을 가장 자연스럽게 즐길 수 있는 기본 온도대예요. 잔은 도자기, 유리잔 어느 쪽이든 좋습니다."))
    return out

# ------------------------------------------------------------------
# 5. 유사 브랜드 찾기 (내부 링크용)
# ------------------------------------------------------------------

def euclidean_similarity(p1: dict, p2: dict) -> float:
    keys = set(p1.keys()) & set(p2.keys())
    if not keys:
        return 0.0
    dist = sum((p1[k] - p2[k]) ** 2 for k in keys) ** 0.5
    return -dist  # 작을수록 유사 -> 음수로 정렬

def similar_brands(target: str, flavors: dict, n=5):
    if target not in flavors:
        return []
    t = flavors[target]["flavor"]
    scored = []
    for other, prof in flavors.items():
        if other == target:
            continue
        scored.append((euclidean_similarity(t, prof["flavor"]), other))
    scored.sort(reverse=True)
    return [b for _, b in scored[:n]]

def same_grade_brands(target_brand: str, target_grades: set, db: dict, n=5):
    """향미 프로필이 없는 브랜드를 위한 폴백: 같은 등급의 다른 브랜드 5개."""
    candidates = []
    for brand, data in db.items():
        if brand == target_brand:
            continue
        their_grades = {p.get("grade", "") for p in data.get("products", [])}
        overlap = target_grades & their_grades
        if overlap:
            candidates.append((len(overlap), brand))
    candidates.sort(reverse=True)
    result = [b for _, b in candidates[:n]]
    # 폴백: 결과가 부족하면 가나다순 인접 브랜드로 채움
    if len(result) < n:
        sorted_brands = sorted(db.keys(), key=lambda x: x.lower())
        if target_brand in sorted_brands:
            idx = sorted_brands.index(target_brand)
            neighbors = []
            for off in range(1, len(sorted_brands)):
                for direction in (-1, 1):
                    j = idx + off * direction
                    if 0 <= j < len(sorted_brands):
                        nb = sorted_brands[j]
                        if nb not in result and nb != target_brand:
                            neighbors.append(nb)
                if len(result) + len(neighbors) >= n:
                    break
            result.extend(neighbors[:n - len(result)])
    return result[:n]

# ------------------------------------------------------------------
# 5.5 브랜드별 고유 콘텐츠 생성 (얇은 페이지 보강용)
# ------------------------------------------------------------------

BRAND_INTRO_TEMPLATES = [
    "{brand}은(는) 일본 사케 양조 문화의 한 단면을 보여주는 브랜드입니다. {n_products}종의 라인업을 통해 양조자의 철학과 지역색이 자연스럽게 드러나죠. 한 잔을 음미하면서 그 안에 담긴 시간과 정성을 느껴보세요.",
    "사케는 단순한 술이 아니라 일본 식문화의 정수가 응축된 음료입니다. {brand}이(가) 빚어낸 {n_products}종의 사케 역시 각각 다른 표정과 이야기를 가지고 있어요. 어떤 한 종을 먼저 만나든, 그것이 {brand}을(를) 이해하는 첫걸음이 됩니다.",
    "{brand}의 사케는 {n_products}종으로 구성되어 있어요. 같은 양조장의 사케라도 등급·정미보합·양조법에 따라 향과 맛이 완전히 달라집니다. 여러 종을 비교 시음해 보면 그 안에 흐르는 '양조자의 손맛'을 발견하실 수 있을 거예요.",
    "사케를 고를 때 우리는 흔히 '이름'에 끌립니다. {brand}이라는 이름이 마음에 드셨다면, 그 안에 담긴 {n_products}종의 제품을 한 번 살펴보세요. 같은 이름 아래에서도 각 제품이 어떻게 다른 인상을 주는지 비교하는 재미가 있습니다.",
]

TASTING_GUIDE_TEMPLATES = [
    "사케를 처음 잔에 따랐을 때 가장 먼저 확인할 것은 '색'입니다. 투명한 백수정 빛깔이라면 정미보합이 낮고 정제된 스타일, 살짝 황금빛이 돈다면 숙성감이나 쌀의 풍미가 살아있는 스타일이에요. 잔을 가볍게 흔들어 잔벽을 흐르는 모습(레그)도 함께 관찰해 보세요. 점성이 진할수록 단맛과 바디감이 강한 경우가 많습니다.",
    "사케의 향은 크게 톱노트(상향)와 미들노트로 나뉩니다. 첫 향에는 멜론·배·사과·바나나 같은 과일향이 또렷하게 느껴지고, 시간이 지나며 쌀·곡물·꿀·견과 같은 깊은 향이 따라옵니다. 한 잔에 5~10초 정도 천천히 향을 맡아 보시면 사케 하나가 가진 향의 폭이 의외로 넓다는 걸 알게 됩니다.",
    "입에 머금었을 때는 단맛-산미-감칠맛-쌉쌀함의 순서로 표현이 펼쳐집니다. 사케는 와인보다 산도가 낮고, 대신 아미노산이 만드는 감칠맛(우마미)이 풍부해요. 와인 잔에 따라 향을 모은 뒤 한 모금을 입 안에 6~8초 머무르게 하면, 시간차로 펼쳐지는 풍미를 더 또렷하게 느끼실 수 있습니다.",
    "사케의 마무리(피니시)는 그 사케의 격을 가장 잘 보여주는 부분이에요. 깔끔하게 떨어지는 사케는 식중주로, 길게 여운이 남는 사케는 음미용으로 더 적합합니다. 한 모금을 삼킨 뒤 코로 내쉬는 숨에서 느껴지는 향(레트로내이절)까지 확인해 보면 사케 테이스팅이 한층 입체적이 됩니다.",
    "사케 테이스팅을 처음 시작하실 때는 한 번에 너무 많은 표현을 적으려 하지 마세요. '단맛 → 산미 → 감칠맛 → 쓴맛 → 떫음' 다섯 가지 기본 축을 0~5점으로 평가하는 것만으로도 충분히 의미 있는 노트가 됩니다. 이렇게 누적된 점수가 10병만 모여도 자신의 취향이 어디에 있는지 또렷이 보이기 시작해요.",
]

STORAGE_GUIDE_TEMPLATES = [
    "사케는 빛과 온도에 매우 민감한 술입니다. 개봉 전에는 햇빛이 닿지 않는 서늘한 곳, 가능하면 냉장(5~12℃)에 보관하세요. 특히 나마자케·다이긴조 같은 향 중심의 사케는 실온에 두면 며칠만에 향이 빠르게 변할 수 있습니다.",
    "병을 개봉한 뒤에는 가능한 한 빨리, 늦어도 2주 안에 드시는 것이 좋아요. 공기와의 접촉으로 산화가 진행되면서 처음의 또렷한 향이 흐려집니다. 도쿠리(작은 술병)에 옮겨 담아 냉장 보관하면 산화 속도를 늦출 수 있어요.",
    "사케의 가장 큰 적은 빛, 그중에서도 자외선입니다. 자외선을 받으면 '히야레(日焼け)'라는 변질이 일어나 시큼한 냄새가 나기 시작해요. 보관할 때는 항상 종이박스에 넣거나 어두운 곳에 두시는 것을 추천합니다.",
]

def brand_intro(brand_ko: str, n_products: int) -> str:
    template = pick_variant(BRAND_INTRO_TEMPLATES, brand_ko + "intro")
    return template.format(brand=brand_ko, n_products=n_products)

def tasting_guide_paragraph(brand_ko: str) -> str:
    return pick_variant(TASTING_GUIDE_TEMPLATES, brand_ko + "tasting")

def storage_guide_paragraph(brand_ko: str) -> str:
    return pick_variant(STORAGE_GUIDE_TEMPLATES, brand_ko + "storage")

# ------------------------------------------------------------------
# 6. HTML 템플릿
# ------------------------------------------------------------------

PAGE_TEMPLATE = """<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <meta name="description" content="{meta_desc}">
    <meta name="keywords" content="{keywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://sakeview.com/sake/{slug}.html">

    <meta property="og:type" content="article">
    <meta property="og:url" content="https://sakeview.com/sake/{slug}.html">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{meta_desc}">
    <meta property="og:image" content="https://sakeview.com/og-image.png">
    <meta property="og:locale" content="ko_KR">
    <meta property="og:site_name" content="사케를 보다">

    <meta name="theme-color" content="#383961">
    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link rel="apple-touch-icon" sizes="192x192" href="/icons/icon-192x192.png">
    <link href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;700&family=Cormorant+Garamond:wght@400;500;600;700&family=Pretendard:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1907306190071217" crossorigin="anonymous"></script>

    <script type="application/ld+json">
    {{
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": "{title_safe_json}",
        "description": "{meta_desc_safe_json}",
        "datePublished": "{today}",
        "dateModified": "{today}",
        "author": {{ "@type": "Organization", "name": "사케를 보다" }},
        "publisher": {{
            "@type": "Organization",
            "name": "사케를 보다",
            "logo": {{ "@type": "ImageObject", "url": "https://sakeview.com/og-image.png" }}
        }},
        "mainEntityOfPage": "https://sakeview.com/sake/{slug}.html"
    }}
    </script>

    <style>
        :root {{
            --bg-primary: #fdfcfa; --bg-secondary: #fff; --bg-tertiary: #f8f6f2;
            --text-primary: #1a1a1a; --text-secondary: #5a5a5a; --text-muted: #9a9a9a;
            --accent-primary: #383961; --accent-gold: #DBDFAC; --border-light: rgba(56,57,97,0.08);
            --card-bg: #fff;
        }}
        body.dark-mode {{
            --bg-primary: #0a0a0f; --bg-secondary: #12121a; --bg-tertiary: #1a1a24;
            --text-primary: #f0f0f0; --text-secondary: #a0a0a0; --text-muted: #707070;
            --accent-primary: #7A7CB0; --accent-gold: #E5E8C0; --border-light: rgba(122,124,176,0.1);
            --card-bg: #12121a;
        }}
        * {{ margin:0; padding:0; box-sizing:border-box; }}
        body {{
            font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-primary); color: var(--text-primary);
            line-height: 1.85; transition: background-color .3s, color .3s;
        }}
        .container {{ max-width: 900px; margin: 0 auto; padding: 32px 20px 80px; }}
        .breadcrumb {{ font-size: .9em; color: var(--text-muted); margin-bottom: 24px; }}
        .breadcrumb a {{ color: var(--text-secondary); text-decoration: none; }}
        .breadcrumb a:hover {{ color: var(--accent-primary); }}
        .page-header {{ text-align: center; margin: 40px 0 50px; }}
        .brand-jp {{ color: var(--text-muted); font-family: 'Noto Serif KR', serif; font-size: 1.4em; }}
        .page-header h1 {{
            font-size: 2.6em; margin: 12px 0 18px;
            color: var(--accent-primary); font-family: 'Cormorant Garamond','Noto Serif KR',serif;
            letter-spacing: -.02em;
        }}
        .page-header p.subtitle {{ color: var(--text-secondary); font-size: 1.05em; max-width: 640px; margin: 0 auto; }}
        .divider {{ width: 60px; height: 2px; background: var(--accent-gold); margin: 18px auto; }}
        .section {{
            background: var(--card-bg); padding: 36px; border-radius: 20px;
            margin-bottom: 32px; border: 1px solid var(--border-light);
        }}
        .section h2 {{
            color: var(--accent-primary); margin-bottom: 22px;
            font-family: 'Cormorant Garamond','Noto Serif KR',serif; font-size: 1.7em;
            letter-spacing: -.01em;
        }}
        .section h3 {{
            color: var(--accent-primary); margin: 24px 0 12px; font-size: 1.15em;
        }}
        .section p {{ color: var(--text-secondary); margin-bottom: 14px; }}
        .section ul {{ margin: 8px 0 16px 22px; color: var(--text-secondary); }}
        .section ul li {{ margin-bottom: 6px; }}
        .product-list {{ display: grid; gap: 14px; }}
        .product-card {{
            background: var(--bg-tertiary); padding: 18px 22px; border-radius: 12px;
            border-left: 4px solid var(--accent-gold);
        }}
        .product-card .pname {{ color: var(--text-primary); font-weight: 600; font-size: 1.05em; margin-bottom: 4px; }}
        .product-card .pjp {{ color: var(--text-muted); font-size: .92em; font-family: 'Noto Serif KR', serif; margin-bottom: 8px; }}
        .product-card .pmeta {{ display: flex; gap: 16px; flex-wrap: wrap; font-size: .9em; color: var(--text-secondary); }}
        .product-card .pmeta span {{ background: var(--bg-secondary); padding: 3px 10px; border-radius: 999px; border: 1px solid var(--border-light); }}
        .flavor-grid {{
            display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
            gap: 14px; margin: 18px 0;
        }}
        .flavor-cell {{
            background: var(--bg-tertiary); padding: 16px; border-radius: 12px; text-align: center;
        }}
        .flavor-cell .axis {{ color: var(--accent-gold); font-size: .9em; margin-bottom: 6px; font-weight: 500; }}
        .flavor-cell .score {{ color: var(--text-primary); font-size: 1.6em; font-weight: 700; }}
        .flavor-cell .bar {{ height: 6px; background: var(--border-light); border-radius: 999px; margin-top: 8px; overflow: hidden; }}
        .flavor-cell .bar > div {{ height: 100%; background: var(--accent-gold); border-radius: 999px; }}
        .pairing-grid {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; margin-top: 12px; }}
        .pairing-card {{ background: var(--bg-tertiary); padding: 12px 16px; border-radius: 10px; color: var(--text-secondary); font-size: .95em; }}
        .similar-grid {{
            display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;
        }}
        .similar-card {{
            background: var(--bg-tertiary); padding: 16px; border-radius: 12px;
            text-decoration: none; color: var(--text-primary); transition: transform .2s, border-color .2s;
            border: 1px solid transparent; display: block;
        }}
        .similar-card:hover {{ transform: translateY(-2px); border-color: var(--accent-gold); }}
        .similar-card .sname {{ font-weight: 600; margin-bottom: 4px; }}
        .similar-card .sjp {{ color: var(--text-muted); font-size: .85em; font-family: 'Noto Serif KR', serif; }}
        .ad-slot {{ margin: 32px 0; text-align: center; min-height: 100px; }}
        .meta-bar {{
            background: var(--bg-tertiary); padding: 14px 22px; border-radius: 12px;
            color: var(--text-muted); font-size: .9em; margin-bottom: 24px;
            display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
        }}
        .top-actions {{ display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 22px; }}
        .btn {{
            padding: 10px 18px; border-radius: 999px; text-decoration: none;
            font-size: .95em; transition: opacity .2s; display: inline-flex; align-items: center; gap: 6px;
            border: 1px solid var(--border-light); color: var(--text-secondary); background: var(--card-bg);
        }}
        .btn:hover {{ opacity: .75; }}
        .btn.primary {{ background: var(--accent-primary); color: #fff; border-color: var(--accent-primary); }}
        .age-notice {{
            background: var(--bg-tertiary); padding: 12px 18px; border-radius: 10px;
            color: var(--text-muted); font-size: .85em; margin-top: 30px; text-align: center;
        }}
        @media (max-width: 600px) {{
            .page-header h1 {{ font-size: 2em; }}
            .section {{ padding: 24px 20px; }}
        }}
    </style>
</head>
<body>
    <div class="container">
        <nav class="breadcrumb" aria-label="breadcrumb">
            <a href="/">사케를 보다</a> &rsaquo;
            <a href="/sake/">사케 사전</a> &rsaquo;
            <span>{brand_ko}</span>
        </nav>

        <header class="page-header">
            {brand_jp_block}
            <h1>{brand_ko}</h1>
            <div class="divider"></div>
            <p class="subtitle">{subtitle}</p>
        </header>

        <div class="meta-bar">
            <span>📅 업데이트: {today_kr}</span>
            <span>🍶 제품 {n_products}종</span>
            <span>🏷️ 등급 {n_grades}종류</span>
        </div>

        <div class="top-actions">
            <a class="btn primary" href="/?brand={slug}#new">📝 이 사케 테이스팅 노트 쓰기</a>
            <a class="btn" href="/sake/">← 전체 사케 목록</a>
        </div>

{sections}

        <!-- AdSense Ad Slot -->
        <div class="ad-slot">
            <ins class="adsbygoogle"
                 style="display:block"
                 data-ad-client="ca-pub-1907306190071217"
                 data-ad-slot="auto"
                 data-ad-format="auto"
                 data-full-width-responsive="true"></ins>
            <script>(adsbygoogle = window.adsbygoogle || []).push({{}});</script>
        </div>

        <p class="age-notice">
            본 페이지는 만 19세 이상의 사케 애호가를 위한 정보 제공 목적으로 작성되었습니다.
            과도한 음주는 건강을 해칩니다.
        </p>
    </div>
</body>
</html>
"""

def esc(s):
    return html.escape(str(s) if s is not None else "")

def esc_json(s):
    return json.dumps(str(s) if s is not None else "", ensure_ascii=False)[1:-1]

# ------------------------------------------------------------------
# 7. 페이지 빌드
# ------------------------------------------------------------------

def build_brand_page(brand_ko: str, brand_data: dict, db: dict, flavors: dict, slug_map: dict) -> str:
    brand_jp = brand_data.get("brandJp", "").strip()
    products = brand_data.get("products", [])
    grades = sorted({p.get("grade", "").strip() for p in products if p.get("grade", "").strip()})
    flavor_entry = flavors.get(brand_ko)

    # ----- subtitle / meta -----
    if flavor_entry and flavor_entry.get("description"):
        subtitle = flavor_entry["description"]
    else:
        if grades:
            subtitle = f"{', '.join(grades[:3])} 등 {len(products)}종의 제품을 보유한 사케 브랜드"
        else:
            subtitle = f"{len(products)}종의 사케를 빚는 양조 브랜드"

    title = f"{brand_ko}" + (f" ({brand_jp})" if brand_jp else "") + " 사케 정보 — 사케를 보다"
    meta_desc = subtitle[:155]
    kw = [brand_ko, "사케", "테이스팅 노트", "일본술", "니혼슈"]
    if brand_jp:
        kw.append(brand_jp)
    kw.extend(grades[:4])
    keywords = ", ".join(dict.fromkeys(kw))

    # ----- 섹션 빌드 -----
    sections = []

    # 섹션 0: 브랜드 인트로 (모든 페이지 공통, variant 회전)
    intro_para = brand_intro(brand_ko, len(products))
    intro_details = []
    if grades:
        if len(grades) == 1:
            intro_details.append(f"이 브랜드의 사케는 모두 <strong>{esc(grades[0])}</strong> 등급으로 분류되는 단일 라인업입니다.")
        else:
            intro_details.append(f"보유 등급은 <strong>{esc(', '.join(grades[:4]))}</strong>" + (f" 외 {len(grades)-4}종" if len(grades) > 4 else "") + "으로, 같은 양조원 안에서 다양한 스타일을 비교 시음하실 수 있어요.")
    polishes = sorted({p.get("polishRate", "").strip() for p in products if p.get("polishRate", "").strip() and p.get("polishRate", "").strip() not in ("-", "")})
    if polishes:
        intro_details.append(f"정미보합은 <strong>{esc(', '.join(polishes[:4]))}</strong>" + ("%" if not any('%' in x for x in polishes[:4]) else "") + " 범위로, 정미율에 따른 풍미의 변화를 직접 비교해 볼 수 있는 라인업입니다.")
    sections.append(f"""
        <section class="section">
            <h2>🍶 {esc(brand_ko)} 소개</h2>
            <p>{intro_para}</p>
            {''.join(f'<p>{d}</p>' for d in intro_details)}
        </section>""")

    # 섹션 1: 향미 프로필 (flavor_profiles 있는 브랜드만)
    if flavor_entry:
        flavor = flavor_entry["flavor"]
        cells = []
        for axis_key, score in flavor.items():
            label = flavor_axis_label(axis_key)
            score_int = int(round(score))
            cells.append(f"""
            <div class="flavor-cell">
                <div class="axis">{esc(label)}</div>
                <div class="score">{score_int}</div>
                <div class="bar"><div style="width:{min(100, score_int)}%"></div></div>
            </div>""")
        top_axes, pairings = flavor_interpretation(flavor)
        top_axes_kr = [flavor_axis_label("_" + a) for a in top_axes]
        interp = (
            f"{brand_ko}는 <strong>{top_axes_kr[0]}</strong>"
            + (f" 와 <strong>{top_axes_kr[1]}</strong>" if len(top_axes_kr) > 1 else "")
            + " 특성이 두드러지는 사케입니다. "
            + f"한국어로 풀어 표현하면 '{esc(flavor_entry['description'])}'에 가까운 인상이에요."
        )
        sections.append(f"""
        <section class="section">
            <h2>🍶 {esc(brand_ko)}의 향미 프로필</h2>
            <p>{interp}</p>
            <div class="flavor-grid">{''.join(cells)}</div>
            <p style="font-size:.9em;color:var(--text-muted);margin-top:14px;">
                ※ 향미 점수는 일본 사케 평가 6축(華やか·芳醇·重厚·穏やか·辛口·軽快) 기준이며,
                숫자가 높을수록 해당 특성이 강하게 나타납니다.
            </p>
        </section>""")

    # 섹션 2: 제품 라인업
    product_cards = []
    for p in products:
        name = p.get("name", "")
        jp = p.get("japanese", "")
        grade = p.get("grade", "")
        polish = p.get("polishRate", "")
        meta_parts = []
        if grade and grade != "-":
            meta_parts.append(f"<span>등급 · {esc(grade)}</span>")
        if polish and polish != "-":
            meta_parts.append(f"<span>정미보합 · {esc(polish)}</span>")
        product_cards.append(f"""
            <div class="product-card">
                <div class="pname">{esc(name)}</div>
                {f'<div class="pjp">{esc(jp)}</div>' if jp else ''}
                <div class="pmeta">{''.join(meta_parts) or '<span>상세 정보 준비 중</span>'}</div>
            </div>""")
    sections.append(f"""
        <section class="section">
            <h2>📋 {esc(brand_ko)}의 제품 라인업</h2>
            <p>{esc(brand_ko)}에서 출시한 {len(products)}종의 사케입니다. 각 제품의 등급과 정미보합을 함께 확인해 보세요.</p>
            <div class="product-list">{''.join(product_cards)}</div>
        </section>""")

    # 섹션 3: 등급 가이드
    grade_blocks = []
    seen_explanations = set()
    for g in grades:
        explanation = grade_explanation(g, brand_ko)
        if explanation and explanation not in seen_explanations:
            seen_explanations.add(explanation)
            grade_blocks.append(f"<h3>{esc(g)}</h3><p>{esc(explanation)}</p>")
    polish_rates = sorted({p.get("polishRate", "").strip() for p in products if p.get("polishRate", "").strip() and p.get("polishRate", "").strip() != "-"})
    if polish_rates:
        for pr in polish_rates[:3]:
            t = polish_rate_text(pr)
            if t:
                grade_blocks.append(f"<p>{esc(t)}</p>")
    if grade_blocks:
        sections.append(f"""
        <section class="section">
            <h2>📖 등급으로 보는 {esc(brand_ko)}</h2>
            <p>이 브랜드가 출시한 제품들의 등급과 정미보합을 풀어 설명드릴게요.</p>
            {''.join(grade_blocks)}
        </section>""")

    # 섹션 4: 음용법 추천
    serving = serving_recommendation(set(grades))
    serving_blocks = []
    for s_title, s_body in serving:
        serving_blocks.append(f"<h3>{esc(s_title)}</h3><p>{esc(s_body)}</p>")
    sections.append(f"""
        <section class="section">
            <h2>🌡 이렇게 마셔보세요</h2>
            <p>{esc(brand_ko)}의 제품 구성을 고려한 추천 음용법입니다. 같은 사케라도 온도에 따라 향과 맛의 인상이 달라져요. 한 병을 사면 여러 온도로 비교해 보시길 추천합니다.</p>
            {''.join(serving_blocks)}
        </section>""")

    # 섹션 5: 페어링 (향미 데이터 있는 브랜드만)
    if flavor_entry:
        top_axes, pairings = flavor_interpretation(flavor_entry["flavor"])
        if pairings:
            cards = "".join(f'<div class="pairing-card">🍽 {esc(p)}</div>' for p in pairings)
            sections.append(f"""
        <section class="section">
            <h2>🍽 어울리는 음식</h2>
            <p>{esc(brand_ko)}의 향미 특성을 고려할 때 함께 즐기시면 좋은 음식들이에요.</p>
            <div class="pairing-grid">{cards}</div>
        </section>""")

    # 섹션 5.5: 테이스팅 & 보관 가이드 (얇은 페이지 보강용, variant 회전)
    sections.append(f"""
        <section class="section">
            <h2>🎯 {esc(brand_ko)}을(를) 더 잘 즐기는 법</h2>
            <h3>테이스팅 포인트</h3>
            <p>{esc(tasting_guide_paragraph(brand_ko))}</p>
            <h3>개봉 후 보관</h3>
            <p>{esc(storage_guide_paragraph(brand_ko))}</p>
        </section>""")

    # 섹션 6: 비슷한 사케 (내부 링크 — SEO 강화)
    if flavor_entry:
        sims = similar_brands(brand_ko, flavors, n=5)
    else:
        sims = same_grade_brands(brand_ko, set(grades), db, n=5)
    if sims:
        cards = []
        for b in sims:
            b_slug = slug_map.get(b)
            if not b_slug:
                continue
            b_jp = db.get(b, {}).get("brandJp", "")
            cards.append(f"""
                <a class="similar-card" href="/sake/{b_slug}.html">
                    <div class="sname">{esc(b)}</div>
                    {f'<div class="sjp">{esc(b_jp)}</div>' if b_jp else ''}
                </a>""")
        if cards:
            sections.append(f"""
        <section class="section">
            <h2>🔗 비슷한 사케 찾기</h2>
            <p>{esc(brand_ko)}이(가) 마음에 드셨다면 이런 사케들도 살펴보세요.</p>
            <div class="similar-grid">{''.join(cards)}</div>
        </section>""")

    # ----- 조립 -----
    today = date.today().isoformat()
    today_kr = date.today().strftime("%Y년 %-m월" if os.name != "nt" else "%Y년 %#m월")

    brand_jp_block = f'<div class="brand-jp">{esc(brand_jp)}</div>' if brand_jp else ""

    return PAGE_TEMPLATE.format(
        title=esc(title),
        title_safe_json=esc_json(title),
        meta_desc=esc(meta_desc),
        meta_desc_safe_json=esc_json(meta_desc),
        keywords=esc(keywords),
        slug=slug_map[brand_ko],
        brand_ko=esc(brand_ko),
        brand_jp_block=brand_jp_block,
        subtitle=esc(subtitle),
        sections="\n".join(sections),
        n_products=len(products),
        n_grades=len(grades),
        today=today,
        today_kr=today_kr,
    )

# ------------------------------------------------------------------
# 8. 인덱스 (허브) 페이지
# ------------------------------------------------------------------

def build_index_page(db: dict, slug_map: dict, flavors: dict) -> str:
    sorted_brands = sorted(db.keys(), key=lambda x: x.lower())
    # 한글 자음별 그룹
    groups = {}
    for brand in sorted_brands:
        ch = brand[0]
        if "가" <= ch <= "힣":
            # 한글 첫자음
            base = (ord(ch) - 0xAC00) // 588
            initials = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ"
            key = initials[base] if base < len(initials) else "기타"
        elif ch.isalpha():
            key = ch.upper()
        else:
            key = "기타"
        groups.setdefault(key, []).append(brand)

    group_order = list("ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ") + sorted(k for k in groups if k.isalpha() and len(k) == 1 and k.isascii()) + ["기타"]
    sections = []
    for key in group_order:
        if key not in groups:
            continue
        items = "".join(
            f'<a class="brand-link" href="/sake/{slug_map[b]}.html">'
            f'<span class="bname">{esc(b)}</span>'
            f'{("<span class=bjp>" + esc(db[b].get("brandJp","")) + "</span>") if db[b].get("brandJp") else ""}'
            f'</a>'
            for b in groups[key]
        )
        sections.append(f'<section class="alpha-section"><h2>{esc(key)}</h2><div class="brand-grid">{items}</div></section>')

    total_brands = len(db)
    total_products = sum(len(d.get("products", [])) for d in db.values())
    n_with_flavor = len(flavors)

    today = date.today().isoformat()

    return f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>사케 사전 — 367개 브랜드 1,316종 제품 — 사케를 보다</title>
    <meta name="description" content="사케를 보다가 정리한 사케 브랜드 사전. 367개 일본 사케 브랜드의 제품 라인업과 향미 프로필, 등급, 정미보합 정보를 확인하세요.">
    <meta name="keywords" content="사케 사전, 사케 브랜드, 사케 종류, 일본술, 니혼슈, 준마이, 다이긴조, 긴조">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="https://sakeview.com/sake/">

    <meta property="og:type" content="website">
    <meta property="og:url" content="https://sakeview.com/sake/">
    <meta property="og:title" content="사케 사전 — 367개 브랜드 1,316종 제품">
    <meta property="og:description" content="367개 일본 사케 브랜드의 정보를 한 페이지에. 브랜드별 향미 프로필, 등급, 정미보합까지 모두 확인할 수 있습니다.">
    <meta property="og:image" content="https://sakeview.com/og-image.png">

    <link rel="icon" type="image/svg+xml" href="/icon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Pretendard:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1907306190071217" crossorigin="anonymous"></script>
    <style>
        :root {{
            --bg-primary:#fdfcfa; --bg-secondary:#fff; --bg-tertiary:#f8f6f2;
            --text-primary:#1a1a1a; --text-secondary:#5a5a5a; --text-muted:#9a9a9a;
            --accent-primary:#383961; --accent-gold:#DBDFAC; --border-light:rgba(56,57,97,0.08);
        }}
        * {{ margin:0; padding:0; box-sizing:border-box; }}
        body {{ font-family:'Pretendard',sans-serif; background:var(--bg-primary); color:var(--text-primary); line-height:1.7; }}
        .container {{ max-width:1100px; margin:0 auto; padding:32px 20px 80px; }}
        .breadcrumb {{ font-size:.9em; color:var(--text-muted); margin-bottom:18px; }}
        .breadcrumb a {{ color:var(--text-secondary); text-decoration:none; }}
        h1 {{ font-family:'Cormorant Garamond',serif; font-size:3em; color:var(--accent-primary); text-align:center; margin:30px 0 10px; }}
        .stats {{ text-align:center; color:var(--text-muted); margin-bottom:18px; font-size:1.05em; }}
        .intro {{ max-width:720px; margin:0 auto 50px; color:var(--text-secondary); text-align:center; font-size:1.02em; line-height:1.9; }}
        .alpha-jump {{ display:flex; flex-wrap:wrap; gap:8px; justify-content:center; margin-bottom:40px; padding:18px; background:var(--bg-tertiary); border-radius:14px; }}
        .alpha-jump a {{ padding:6px 12px; background:var(--bg-secondary); border-radius:8px; color:var(--text-secondary); text-decoration:none; font-weight:500; border:1px solid var(--border-light); }}
        .alpha-jump a:hover {{ color:var(--accent-primary); border-color:var(--accent-gold); }}
        .alpha-section {{ margin-bottom:46px; }}
        .alpha-section h2 {{ color:var(--accent-primary); font-size:1.8em; margin-bottom:18px; padding-bottom:10px; border-bottom:2px solid var(--accent-gold); }}
        .brand-grid {{ display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:12px; }}
        .brand-link {{ padding:14px 18px; background:var(--bg-secondary); border-radius:10px; text-decoration:none; color:var(--text-primary); border:1px solid var(--border-light); transition:.2s; display:flex; flex-direction:column; gap:2px; }}
        .brand-link:hover {{ border-color:var(--accent-gold); transform:translateY(-1px); }}
        .bname {{ font-weight:600; }}
        .bjp {{ color:var(--text-muted); font-size:.85em; }}
    </style>
</head>
<body>
    <div class="container">
        <nav class="breadcrumb"><a href="/">사케를 보다</a> &rsaquo; <span>사케 사전</span></nav>
        <h1>사케 사전</h1>
        <p class="stats">{total_brands}개 브랜드 · {total_products}종 제품 · 향미 프로필 {n_with_flavor}개</p>
        <p class="intro">
            일본 전역의 대표 사케 브랜드를 가나다순으로 정리했습니다.
            각 브랜드 페이지에서 제품 라인업, 등급, 정미보합, 향미 프로필,
            추천 페어링까지 한눈에 확인하실 수 있어요.
        </p>
        <nav class="alpha-jump" aria-label="자음 점프">
            {"".join(f'<a href="#{key}">{esc(key)}</a>' for key in group_order if key in groups)}
        </nav>
        {"".join(s.replace('<section class="alpha-section">', f'<section class="alpha-section" id="' + (g if isinstance(g,str) else "기타") + '">') for s,g in zip(sections, [k for k in group_order if k in groups]))}
    </div>
</body>
</html>
"""

# ------------------------------------------------------------------
# 9. sitemap.xml 업데이트
# ------------------------------------------------------------------

def update_sitemap(slug_map: dict):
    today = date.today().isoformat()
    url_lines = []
    # 기존 페이지들
    base_pages = [
        ("/", "1.0", "weekly"),
        ("/about.html", "0.8", "monthly"),
        ("/guide.html", "0.9", "monthly"),
        ("/regions.html", "0.8", "monthly"),
        ("/brewing.html", "0.8", "monthly"),
        ("/etiquette.html", "0.7", "monthly"),
        ("/recommendations.html", "0.8", "weekly"),
        ("/glossary.html", "0.8", "monthly"),
        ("/faq.html", "0.7", "monthly"),
        ("/kikizakeshi.html", "0.7", "monthly"),
        ("/howto.html", "0.7", "monthly"),
        ("/contact.html", "0.6", "monthly"),
        ("/privacy.html", "0.5", "yearly"),
        ("/terms.html", "0.5", "yearly"),
        ("/sake/", "0.9", "weekly"),
    ]
    for path, priority, freq in base_pages:
        url_lines.append(
            f"  <url>\n    <loc>https://sakeview.com{path}</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>{freq}</changefreq>\n"
            f"    <priority>{priority}</priority>\n  </url>"
        )
    # 367개 brand 페이지
    for brand, slug in sorted(slug_map.items()):
        url_lines.append(
            f"  <url>\n    <loc>https://sakeview.com/sake/{slug}.html</loc>\n"
            f"    <lastmod>{today}</lastmod>\n"
            f"    <changefreq>monthly</changefreq>\n"
            f"    <priority>0.7</priority>\n  </url>"
        )
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + "\n".join(url_lines) + "\n</urlset>\n"
    (ROOT / "sitemap.xml").write_text(xml, encoding="utf-8")

# ------------------------------------------------------------------
# 10. main
# ------------------------------------------------------------------

def main():
    db = load_sake_db()
    flavors = load_flavor_profiles()

    # slug 충돌 방지
    slug_map = {}
    used = set()
    for brand in sorted(db.keys(), key=lambda x: x.lower()):
        s = make_slug(brand)
        orig = s
        i = 2
        while s in used:
            s = f"{orig}-{i}"
            i += 1
        used.add(s)
        slug_map[brand] = s

    print(f"브랜드: {len(db)}개 / 향미 프로필 보유: {len(flavors)}개")
    print(f"슬러그 생성: {len(slug_map)}개 (충돌 회피 포함)")

    # 개별 브랜드 페이지
    for i, (brand, brand_data) in enumerate(db.items(), 1):
        html_content = build_brand_page(brand, brand_data, db, flavors, slug_map)
        out_path = OUT_DIR / f"{slug_map[brand]}.html"
        out_path.write_text(html_content, encoding="utf-8")
        if i % 50 == 0:
            print(f"  진행: {i}/{len(db)}")

    # 인덱스(허브) 페이지
    index_html = build_index_page(db, slug_map, flavors)
    (OUT_DIR / "index.html").write_text(index_html, encoding="utf-8")

    # sitemap.xml 갱신
    update_sitemap(slug_map)

    print(f"\n✅ 완료")
    print(f"  - 개별 브랜드 페이지: {len(db)}개 → /sake/")
    print(f"  - 허브 페이지: /sake/index.html")
    print(f"  - sitemap.xml: {len(db) + 15}개 URL")

if __name__ == "__main__":
    main()
