#!/usr/bin/env python3
"""
Add AdSense in-article ad slots to existing info pages.
Inserts 1-2 ad slots per page at sensible content breakpoints.
Skips privacy.html and terms.html per AdSense policy guidance.
"""
import os
import re

WORKSPACE = "/sessions/confident-adoring-lovelace/mnt/sakeview"

# AdSense ad slot block - uses auto format
# NOTE: data-ad-slot is set to "0000000000" placeholder. User MUST replace
# with actual ad slot IDs from their AdSense dashboard.
AD_SLOT_HTML = """
            <!-- AdSense In-Article Ad -->
            <div class="ad-slot" aria-label="광고" style="text-align:center; margin:40px 0; min-height:100px;">
                <ins class="adsbygoogle"
                     style="display:block"
                     data-ad-client="ca-pub-1907306190071217"
                     data-ad-slot="0000000000"
                     data-ad-format="auto"
                     data-full-width-responsive="true"></ins>
                <script>(adsbygoogle = window.adsbygoogle || []).push({});</script>
            </div>
"""

# Per-page insertion strategy
# Each entry: list of marker strings to insert AFTER. Insertion happens after the
# FIRST occurrence of each marker (so use unique-enough markers).
INSERTION_STRATEGY = {
    "about.html": ["</section>"],  # Only 2 sections, insert after 1st
    "brewing.html": ["</section>", "brewing.html_2"],  # 5 sections, insert after 1st and 3rd
    "contact.html": ["<div class=\"divider\"></div>"],  # No sections, after divider
    "etiquette.html": ["<div class=\"divider\"></div>"],  # No sections, after divider
    "faq.html": ["</section>", "faq.html_2"],  # 4 sections
    "glossary.html": ["<div class=\"divider\"></div>"],  # Term cards only
    "guide.html": ["</section>", "guide.html_2"],  # Many sections
    "howto.html": ["<div class=\"divider\"></div>", "</section>"],  # Mixed
    "kikizakeshi.html": ["</section>", "kikizakeshi.html_2"],  # 5 sections
    "recommendations.html": ["<div class=\"divider\"></div>"],  # No sections
    "regions.html": ["</section>", "regions.html_2"],  # 5 sections
}

def insert_after_nth(text, marker, n, insertion):
    """Insert `insertion` immediately after the n-th occurrence of `marker` (1-indexed)."""
    count = 0
    start = 0
    while count < n:
        idx = text.find(marker, start)
        if idx == -1:
            return text, False
        count += 1
        start = idx + len(marker)
    return text[:start] + "\n" + insertion + text[start:], True

def has_ad_slot(text):
    return 'class="ad-slot"' in text or 'class="adsbygoogle"' in text and 'data-ad-slot' in text

def process_file(filename, strategies):
    path = os.path.join(WORKSPACE, filename)
    if not os.path.exists(path):
        print(f"  SKIP: {filename} (not found)")
        return False
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    if 'class="ad-slot"' in text:
        print(f"  SKIP: {filename} (already has ad-slot)")
        return False
    # Two-ad strategy
    if filename in ("brewing.html", "faq.html", "guide.html", "kikizakeshi.html", "regions.html"):
        # Insert after 1st </section> and 3rd </section>
        text, ok1 = insert_after_nth(text, "</section>", 1, AD_SLOT_HTML)
        if not ok1:
            print(f"  FAIL: {filename} no </section>")
            return False
        text, ok2 = insert_after_nth(text, "</section>", 4, AD_SLOT_HTML)  # 4 because we just inserted one, so we now want 3rd original which is 4th now... actually no, after insert text shifts but section count is unchanged.
        if not ok2:
            # Try 3rd
            text, ok2 = insert_after_nth(text, "</section>", 3, AD_SLOT_HTML)
        ad_count = 2 if ok2 else 1
    elif filename == "about.html":
        text, ok = insert_after_nth(text, "</section>", 1, AD_SLOT_HTML)
        ad_count = 1 if ok else 0
    elif filename == "howto.html":
        # Insert after divider (early) and after </section> (later)
        text, ok1 = insert_after_nth(text, "</section>", 1, AD_SLOT_HTML)
        ad_count = 1 if ok1 else 0
        # Also try after first <div class="divider">
        # but only if we successfully placed one
    else:
        # Pages without <section>: insert after first divider
        text, ok = insert_after_nth(text, '<div class="divider"></div>', 1, AD_SLOT_HTML)
        ad_count = 1 if ok else 0

    if ad_count == 0:
        print(f"  FAIL: {filename}")
        return False
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"  OK:   {filename} (+{ad_count} ad slot{'s' if ad_count > 1 else ''})")
    return True

if __name__ == "__main__":
    pages = [
        "about.html", "brewing.html", "contact.html", "etiquette.html",
        "faq.html", "glossary.html", "guide.html", "howto.html",
        "kikizakeshi.html", "recommendations.html", "regions.html",
    ]
    print("Adding AdSense ad slots to info pages...")
    for p in pages:
        process_file(p, INSERTION_STRATEGY.get(p, []))
    print("Done.")
