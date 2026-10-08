#!/usr/bin/env python3
"""Generates the static HTML pages for the Eliana Capital prototype.
Run from anywhere:  python3 tools/build.py
Edit contact placeholders in CONTACT below, then re-run."""
import os
import re
import json
import html as html_lib

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

# ---- Placeholders to replace with real details ----
ICON_PLACEHOLDERS = {'[[I_WA]]': '<span class="ic ic-wa" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg></span>', '[[I_TEL]]': '<span class="ic ic-tel" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></span>', '[[I_MAIL]]': '<span class="ic ic-mail" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg></span>', '[[I_PIN]]': '<span class="ic ic-pin" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg></span>'}

CONTACT = {
    "[[PHONE_D]]": "+254 721881177",
    "[[PHONE]]": "+254721881177",
    "[[WA]]": "254721881177",
    "[[MAIL]]": "support@eliana-capital.com",
}

NAV = [
    ("index.html", "Home"), ("about.html", "About us"), ("services.html", "Our services"),
    ("how-it-works.html", "How it works"), ("customer-stories.html", "Customer stories"),
    ("faqs.html", "FAQs"), ("contact.html", "Contact us"),
]

HANDS_D = ["M-0.5421 -0.8071C-0.5138 -0.8379 -0.483 -0.8662 -0.4508 -0.893C-0.4995 -0.8702 -0.5468 -0.8428 -0.5923 -0.8108C-0.8623 -0.6204 -1.0 -0.3123 -0.9848 -0.005C-0.9817 0.0373 -0.977 0.0809 -0.9701 0.1255C-0.9552 0.2226 -0.9305 0.3249 -0.8929 0.4309C-0.8872 0.4468 -0.8787 0.4589 -0.8642 0.4573C-0.8462 0.4553 -0.8404 0.437 -0.8433 0.4225C-0.8638 0.321 -0.8613 0.2533 -0.8386 0.2442C-0.8255 0.2388 -0.8124 0.2438 -0.8025 0.2947C-0.7878 0.3706 -0.7735 0.4731 -0.7491 0.551C-0.744 0.5673 -0.7277 0.5849 -0.7036 0.5771C-0.6877 0.5719 -0.679 0.5518 -0.6857 0.5261C-0.7079 0.441 -0.7255 0.3503 -0.7182 0.2696C-0.7165 0.2501 -0.7062 0.242 -0.6956 0.242C-0.6833 0.242 -0.6747 0.2492 -0.664 0.2784C-0.6319 0.3665 -0.577 0.5302 -0.5308 0.5815C-0.5208 0.5927 -0.5078 0.594 -0.4955 0.5867C-0.4833 0.5794 -0.4786 0.5604 -0.4859 0.5401C-0.5093 0.4749 -0.5723 0.3313 -0.5963 0.2052C-0.5985 0.1935 -0.5862 0.1763 -0.5712 0.1813C-0.5466 0.1894 -0.4301 0.3817 -0.3684 0.4481C-0.3304 0.4888 -0.293 0.4665 -0.3125 0.423C-0.3293 0.3852 -0.3784 0.3224 -0.4196 0.2522C-0.4905 0.1312 -0.5581 -0.0073 -0.5413 -0.0453C-0.5137 -0.1076 -0.4138 -0.0891 -0.3497 -0.0561C-0.3001 -0.0305 -0.2547 0.0062 -0.2202 -0.0247C-0.1879 -0.0535 -0.232 -0.0949 -0.2964 -0.1371C-0.355 -0.1755 -0.4464 -0.216 -0.5332 -0.2616C-0.6337 -0.3143 -0.6927 -0.4234 -0.6792 -0.5361C-0.6789 -0.5386 -0.6786 -0.541 -0.6782 -0.5435C-0.664 -0.6429 -0.6101 -0.7332 -0.5421 -0.8071Z", "M0.818 -0.5441C0.8472 -0.5161 0.8738 -0.4859 0.8989 -0.4544C0.8779 -0.5017 0.8525 -0.5479 0.8226 -0.5923C0.6447 -0.8562 0.3507 -0.995 0.0545 -0.9866C0.0137 -0.9845 -0.0284 -0.9808 -0.0715 -0.9751C-0.1653 -0.9627 -0.2644 -0.941 -0.3672 -0.9069C-0.3827 -0.9017 -0.3944 -0.8938 -0.3932 -0.8798C-0.3916 -0.8624 -0.3741 -0.8564 -0.3602 -0.859C-0.262 -0.8766 -0.1968 -0.8729 -0.1884 -0.8509C-0.1836 -0.8381 -0.1887 -0.8255 -0.2379 -0.8171C-0.3113 -0.8044 -0.4103 -0.7928 -0.4857 -0.7708C-0.5016 -0.7662 -0.5189 -0.7509 -0.5118 -0.7275C-0.5072 -0.7121 -0.488 -0.7033 -0.4631 -0.7093C-0.3806 -0.729 -0.2929 -0.744 -0.2154 -0.7354C-0.1967 -0.7333 -0.189 -0.7233 -0.1893 -0.713C-0.1895 -0.7012 -0.1966 -0.693 -0.2249 -0.6834C-0.3104 -0.6542 -0.4692 -0.6047 -0.5196 -0.5612C-0.5306 -0.5517 -0.5321 -0.5393 -0.5253 -0.5273C-0.5185 -0.5154 -0.5003 -0.5105 -0.4806 -0.5171C-0.4173 -0.5383 -0.2777 -0.5961 -0.1558 -0.6167C-0.1445 -0.6186 -0.1282 -0.6064 -0.1333 -0.5921C-0.1416 -0.5685 -0.3292 -0.4602 -0.3944 -0.402C-0.4344 -0.3664 -0.4136 -0.3299 -0.3713 -0.3477C-0.3346 -0.3632 -0.2731 -0.4092 -0.2046 -0.4474C-0.0867 -0.5133 0.0481 -0.5756 0.0843 -0.5587C0.1438 -0.5308 0.124 -0.435 0.0908 -0.3738C0.0652 -0.3267 0.029 -0.2836 0.058 -0.2498C0.0851 -0.2182 0.1259 -0.2598 0.1678 -0.3209C0.206 -0.3766 0.2469 -0.4638 0.2925 -0.5465C0.3453 -0.6422 0.4516 -0.6969 0.5598 -0.6815C0.5621 -0.6812 0.5645 -0.6808 0.5669 -0.6804C0.6623 -0.6647 0.7482 -0.611 0.818 -0.5441Z", "M0.5132 0.7895C0.484 0.8154 0.4528 0.8386 0.4205 0.8604C0.4677 0.8439 0.5142 0.823 0.5593 0.7976C0.8273 0.647 0.9839 0.3747 0.9988 0.0888C1.0 0.0493 0.9997 0.0086 0.9976 -0.0334C0.9929 -0.1247 0.9798 -0.2217 0.9549 -0.3234C0.9512 -0.3387 0.9445 -0.3506 0.9309 -0.3505C0.914 -0.3504 0.9069 -0.334 0.9082 -0.3204C0.9176 -0.2245 0.909 -0.162 0.8871 -0.1557C0.8744 -0.152 0.8627 -0.1579 0.8584 -0.2059C0.8519 -0.2776 0.8484 -0.3738 0.8332 -0.4482C0.83 -0.4638 0.8166 -0.4816 0.7935 -0.4767C0.7783 -0.4734 0.7684 -0.4556 0.7722 -0.4312C0.7847 -0.3502 0.7924 -0.2646 0.778 -0.1906C0.7745 -0.1727 0.7643 -0.1662 0.7544 -0.1672C0.743 -0.1684 0.7358 -0.1759 0.7287 -0.2038C0.7072 -0.2884 0.6719 -0.4452 0.634 -0.4971C0.6257 -0.5084 0.6139 -0.5109 0.6018 -0.5052C0.5898 -0.4996 0.5837 -0.4825 0.5885 -0.463C0.604 -0.4004 0.6488 -0.2615 0.659 -0.1425C0.66 -0.1315 0.647 -0.1167 0.6336 -0.1227C0.6115 -0.1326 0.5219 -0.3216 0.471 -0.3889C0.4397 -0.4302 0.403 -0.4131 0.4168 -0.371C0.4289 -0.3344 0.4684 -0.2716 0.4999 -0.2027C0.5541 -0.084 0.6036 0.0506 0.5845 0.0841C0.553 0.1393 0.4623 0.1127 0.406 0.076C0.3625 0.0477 0.324 0.0094 0.2891 0.0347C0.2565 0.0584 0.2934 0.1009 0.349 0.1461C0.3997 0.1871 0.4805 0.2333 0.5565 0.2836C0.6445 0.342 0.6889 0.4485 0.6657 0.5515C0.6652 0.5538 0.6647 0.5561 0.6641 0.5583C0.6415 0.649 0.5831 0.7275 0.5132 0.7895Z", "M-0.6783 0.6816C-0.7083 0.6622 -0.7365 0.6404 -0.7637 0.6173C-0.7375 0.6549 -0.7076 0.6908 -0.6741 0.7243C-0.4749 0.9239 -0.1958 0.995 0.0604 0.9377C0.0955 0.9291 0.1314 0.9187 0.168 0.9065C0.2475 0.8799 0.3299 0.8443 0.4136 0.7973C0.4262 0.7902 0.4351 0.7814 0.4316 0.7694C0.4274 0.7545 0.4111 0.7523 0.3994 0.7568C0.317 0.7887 0.2597 0.7965 0.2487 0.7788C0.2424 0.7685 0.2447 0.7567 0.286 0.741C0.3477 0.7177 0.4319 0.6908 0.4938 0.659C0.5068 0.6523 0.5192 0.6362 0.5092 0.617C0.5025 0.6043 0.4843 0.6 0.4637 0.6093C0.3953 0.6403 0.3216 0.6682 0.2527 0.6738C0.2361 0.6752 0.2277 0.6677 0.2262 0.6588C0.2244 0.6484 0.2292 0.6401 0.2522 0.627C0.3216 0.5872 0.4514 0.5173 0.4879 0.471C0.4958 0.4609 0.4951 0.4499 0.4871 0.4406C0.4792 0.4314 0.4626 0.4302 0.4466 0.4393C0.3951 0.4684 0.2834 0.5422 0.1809 0.5806C0.1714 0.5842 0.1551 0.5763 0.1571 0.563C0.1604 0.5411 0.3052 0.4153 0.3521 0.3537C0.3809 0.316 0.3567 0.2877 0.3229 0.3103C0.2936 0.33 0.2479 0.3804 0.1948 0.4252C0.1033 0.5024 -0.0034 0.5793 -0.0377 0.5706C-0.0941 0.5565 -0.0931 0.4698 -0.0745 0.411C-0.0602 0.3656 -0.036 0.3221 -0.0669 0.2976C-0.0958 0.2746 -0.1243 0.3177 -0.1504 0.378C-0.1743 0.4328 -0.1951 0.5156 -0.2208 0.5952C-0.2506 0.6873 -0.3338 0.7527 -0.4305 0.7576C-0.4326 0.7578 -0.4347 0.7578 -0.4369 0.7579C-0.5225 0.7603 -0.6063 0.7281 -0.6783 0.6816Z"]

SYMBOLS = """<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false"><defs>
<g id="hands">""" + "".join(f'<path id="hand{i+1}" d="{d}"/>' for i, d in enumerate(HANDS_D)) + """</g>
</defs></svg>"""


COMPANION = """<div class="mk" aria-hidden="true"><svg viewBox="-1.05 -1.05 2.1 2.1" focusable="false"><g class="mk-rot">
<g class="mk-h mk-h1"><use href="#hand1"/></g><g class="mk-h mk-h2"><use href="#hand2"/></g><g class="mk-h mk-h3"><use href="#hand3"/></g><g class="mk-h mk-h4"><use href="#hand4"/></g>
</g></svg></div>"""


def logo(cls=""):
    return ('<a class="logo ' + cls + '" href="index.html" aria-label="Eliana Capital, home">'
            '<img class="logo-on-dark" src="assets/logo-white.svg" alt="Eliana Capital, we grow together" width="134" height="46">'
            '<img class="logo-on-light" src="assets/logo-color.svg" alt="" width="134" height="46" aria-hidden="true"></a>')


LOGO = logo()
LOGO_FOOT = logo("logo--foot")

FAQS = [
    ("How much can I borrow?", "<p>Imaarika loans range from KES 5,000 to KES 15,000, sized to what your business can comfortably repay.</p>"),
    ("How long do I have to repay?", "<p>Up to 30 days, with daily repayments. Daily instalments are small, so they fit the way market and shop income arrives.</p>"),
    ("What will it cost?", "<p>A KES 500 processing fee and 27% interest. Any penalties are stated up front, and there are no hidden charges. You see the full price before you accept, and you decide.</p>"),
    ("How fast can I get a decision?", "<p>Our target is two hours on a complete application. We never skip identity checks, affordability or approval, so an incomplete file takes longer.</p>"),
    ("Who can apply?", "<p>Micro and small business owners, informal-sector earners with genuine cash flow, and households that need short-term working capital. We are especially glad to back women entrepreneurs.</p>"),
    ("Can I repay early?", "<p>Yes. Early repayment is welcome and carries no punitive charges. Good repayment also earns you faster access the next time you need support.</p>"),
    ("How do I receive and repay my loan?", "<p>Our systems settle by mobile money, so you do not need to queue for cash. Your loan officer will walk you through it.</p>"),
    ("What happens to my personal information?", "<p>We collect what we need to assess and serve you, explain why in our <a href=\"privacy.html\">privacy notice</a>, and handle your data as carefully as your money.</p>"),
    ("What if I am struggling to repay?", "<p>Talk to us early. We follow up firmly and courteously, and we never intimidate a customer.</p>"),
    ("How do I make a complaint?", "<p>Use the <a href=\"contact.html#complaint\">complaint form</a>, call us, or send a WhatsApp message. Every complaint is recorded so it cannot get lost.</p>"),
    ("Where are your branches?", "<p>Kawangware, Utawala and Thika, with our head office in Nairobi. Six more branches are planned.</p>"),
]


def faq_html(items):
    return '<div class="faq">' + "".join(
        f'<details><summary>{q}</summary><div class="ans">{a}</div></details>' for q, a in items) + "</div>"


# ---- Site-wide SEO settings (used by every page's <head>) ----
# Change SITE_URL to the real domain before launch, then run:  python3 tools/build.py
SITE_URL = "https://eliana-capital.com"
SITE_NAME = "Eliana Capital"
LEGAL_NAME = "Eliana Capital Limited"
TAGLINE = "We Grow Together"
OG_IMAGE = "og-image.png"          # 1200 x 630, in the site root
PAGE_DATE = "2026-10-03"           # sitemap lastmod

PAGE_KW = {
    "index.html": "eliana capital, eliana capital kenya, microfinance kenya, digital lender kenya, small business loan kenya, "
                  "working capital loan, imaarika loan, market trader loan, women entrepreneurs loan, mobile money loan, "
                  "responsible lending kenya, kawangware, utawala, thika, nairobi",
    "about.html": "about eliana capital, digital microfinance institution kenya, responsible lender nairobi, women entrepreneurs kenya, we grow together",
    "services.html": "imaarika loan, working capital loan kenya, small business loan KES 5000 to 15000, daily repayment loan, loan prices kenya",
    "how-it-works.html": "how to get a loan kenya, eliana capital loan process, loan application kenya, daily repayments, mobile money loan",
    "customer-stories.html": "eliana capital customer stories, small business success kenya, market trader story, dressmaker kenya, farmers kenya",
    "faqs.html": "eliana capital faqs, loan questions kenya, imaarika loan cost, how to repay loan kenya, microfinance faq",
    "contact.html": "contact eliana capital, apply for a loan kenya, request a call back, eliana capital whatsapp, make a complaint",
    "privacy.html": "eliana capital privacy notice, data protection kenya, personal data microfinance",
    "terms.html": "eliana capital terms of use, website terms",
    "accessibility.html": "eliana capital accessibility statement, accessible website kenya",
}
STORY_KW = "eliana capital customer story, small business kenya, imaarika loan story, we grow together"

BRANCHES = ["Kawangware", "Utawala", "Thika"]
WRITTEN = []   # filled by layout(); used for sitemap.xml


def _jsonld(obj):
    """One <script type=application/ld+json> block, indented to match the page source."""
    body = json.dumps(obj, indent=2, ensure_ascii=False)
    body = "\n".join("    " + ln for ln in body.splitlines())
    return '    <script type="application/ld+json">\n' + body + "\n    </script>"


def _plain(html_fragment):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", html_fragment)).strip()


def head_block(fname, title, desc):
    """Builds the whole <head>, laid out in labelled sections the way mylk-co.com's source is."""
    url = SITE_URL + "/" + ("" if fname == "index.html" else fname)
    esc = lambda t: html_lib.escape(t, quote=True)
    t, d = esc(title), esc(desc)
    kw = esc(PAGE_KW.get(fname, STORY_KW))
    page_name = title.split(" | ")[0]
    img = SITE_URL + "/" + OG_IMAGE
    is_home = fname == "index.html"

    org_id, biz_id = SITE_URL + "/#organization", SITE_URL + "/#business"
    contact = {"@type": "ContactPoint", "telephone": CONTACT["[[PHONE]]"], "email": CONTACT["[[MAIL]]"],
               "contactType": "customer service", "areaServed": "KE", "availableLanguage": ["English", "Swahili"]}
    organization = {
        "@context": "https://schema.org", "@type": "Organization", "@id": org_id,
        "name": SITE_NAME, "legalName": LEGAL_NAME, "slogan": TAGLINE, "url": SITE_URL + "/",
        "logo": SITE_URL + "/favicon/android-chrome-512x512.png", "image": img,
        "description": "Eliana Capital is a Kenyan digital microfinance lender offering responsible working-capital loans to micro and small business owners.",
        "email": CONTACT["[[MAIL]]"], "telephone": CONTACT["[[PHONE]]"],
        "areaServed": {"@type": "Country", "name": "Kenya"}, "contactPoint": contact,
    }
    business = {
        "@context": "https://schema.org", "@type": ["FinancialService", "LocalBusiness"], "@id": biz_id,
        "name": SITE_NAME, "legalName": LEGAL_NAME, "url": SITE_URL + "/", "image": [img, SITE_URL + "/favicon/android-chrome-512x512.png"],
        "description": "Accessible, responsible lending for the people who keep Kenya's markets moving. Imaarika working-capital loans of KES 5,000 to 15,000, repaid daily over up to 30 days.",
        "email": CONTACT["[[MAIL]]"], "telephone": CONTACT["[[PHONE]]"], "parentOrganization": {"@id": org_id},
        "address": {"@type": "PostalAddress", "addressLocality": "Nairobi", "addressCountry": "KE"},
        "areaServed": {"@type": "Country", "name": "Kenya"},
        "currenciesAccepted": "KES", "paymentAccepted": "Mobile money",
        "department": [{"@type": "FinancialService", "name": f"{SITE_NAME}, {b} branch",
                        "address": {"@type": "PostalAddress", "addressLocality": b, "addressCountry": "KE"}} for b in BRANCHES],
        "hasOfferCatalog": {"@type": "OfferCatalog", "name": "Eliana Capital loans", "itemListElement": [{
            "@type": "Offer", "itemOffered": {
                "@type": "LoanOrCredit", "name": "Imaarika working-capital loan",
                "description": "Short-term working capital for stock, supplies or a gap in cash flow, repaid in daily instalments.",
                "currency": "KES",
                "amount": {"@type": "MonetaryAmount", "currency": "KES", "minValue": 5000, "maxValue": 15000},
                "loanTerm": {"@type": "QuantitativeValue", "maxValue": 30, "unitCode": "DAY"},
                "feesAndCommissionsSpecification": "KES 500 processing fee and 27% interest. Penalties are stated up front; no hidden charges."}}]},
    }
    website = {
        "@context": "https://schema.org", "@type": "WebSite", "@id": SITE_URL + "/#website", "name": SITE_NAME,
        "alternateName": ["Eliana", "Eliana Capital Kenya"], "url": SITE_URL + "/", "inLanguage": "en-KE",
        "description": "Eliana Capital: credit that empowers, never traps.", "publisher": {"@id": org_id},
    }
    webpage = {
        "@context": "https://schema.org", "@type": "WebPage", "@id": url + "#webpage", "url": url, "name": title,
        "description": desc, "inLanguage": "en-KE", "isPartOf": {"@id": SITE_URL + "/#website"}, "about": {"@id": biz_id},
        "primaryImageOfPage": {"@type": "ImageObject", "url": img},
    }
    crumbs = [("Home", SITE_URL + "/")]
    if not is_home:
        if fname.startswith("story-"):
            crumbs.append(("Customer stories", SITE_URL + "/customer-stories.html"))
        crumbs.append((page_name, url))
    breadcrumb = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(crumbs)]}

    ld = [("Organization", organization), ("FinancialService / LocalBusiness", business)]
    if is_home:
        ld.append(("WebSite", website))
    ld.append(("WebPage", webpage))
    if not is_home:
        ld.append(("BreadcrumbList", breadcrumb))
    if fname == "faqs.html":
        ld.append(("FAQPage", {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
            {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": _plain(a)}} for q, a in FAQS]}))

    def sec(label):
        return f"\n    <!-- ── {label} " + "─" * max(4, 62 - len(label)) + " -->\n"

    ld_html = "".join(sec("JSON-LD Structured Data: " + n) + _jsonld(o) + "\n" for n, o in ld)

    return f"""<head>
    <!-- ═══════════════════════════════════════════════════════════════════
         {SITE_NAME} — {TAGLINE}
         SEO Meta Configuration · {url}
         ═══════════════════════════════════════════════════════════════════ -->
    <meta charset="utf-8">
    <meta name="viewport" content="width=1280, viewport-fit=cover">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
{sec("Primary SEO Meta")}    <title>{t}</title>
    <meta name="description" content="{d}">
    <meta name="keywords" content="{kw}">
    <meta name="author" content="{LEGAL_NAME}">
    <meta name="publisher" content="{LEGAL_NAME}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="bingbot" content="index, follow">
    <link rel="canonical" href="{url}">
    <meta name="rating" content="General">
    <meta name="distribution" content="global">
    <meta name="language" content="English">
    <meta name="geo.region" content="KE-110">
    <meta name="geo.placename" content="Nairobi">
    <meta name="geo.position" content="-1.2921;36.8219">
    <meta name="ICBM" content="-1.2921, 36.8219">
{sec("Open Graph (Facebook, LinkedIn, WhatsApp, etc.)")}    <meta property="og:type" content="website">
    <meta property="og:site_name" content="{SITE_NAME}">
    <meta property="og:title" content="{t}">
    <meta property="og:description" content="{d}">
    <meta property="og:url" content="{url}">
    <meta property="og:image" content="{img}">
    <meta property="og:image:alt" content="{SITE_NAME}: {TAGLINE}. Responsible working-capital loans in Kenya.">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="en_KE">
{sec("Twitter / X Card")}    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{t}">
    <meta name="twitter:description" content="{d}">
    <meta name="twitter:image" content="{img}">
    <meta name="twitter:image:alt" content="{SITE_NAME}: {TAGLINE}. Responsible working-capital loans in Kenya.">
{sec("Favicons & App Icons")}    <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
    <link rel="icon" type="image/x-icon" href="favicon/favicon.ico">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon/favicon-16x16.png">
    <link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon/apple-touch-icon.png">
    <link rel="icon" type="image/png" sizes="192x192" href="favicon/android-chrome-192x192.png">
    <link rel="icon" type="image/png" sizes="512x512" href="favicon/android-chrome-512x512.png">
    <link rel="manifest" href="site.webmanifest">
{sec("Theme & Browser Chrome")}    <meta name="theme-color" content="#fefdf3">
    <meta name="msapplication-TileColor" content="#010395">
    <meta name="msapplication-TileImage" content="favicon/android-chrome-192x192.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="{SITE_NAME}">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="application-name" content="{SITE_NAME}">
    <meta name="format-detection" content="telephone=no">
{sec("Performance: Preconnect & DNS Prefetch")}    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="https://fonts.googleapis.com">
    <link rel="dns-prefetch" href="https://fonts.gstatic.com">
{ld_html}{sec("Fonts & Stylesheets")}    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="css/v9.css">
    <link rel="stylesheet" href="css/v10.css">
    <link rel="stylesheet" href="css/v12.css">
    <link rel="stylesheet" href="css/v13.css">
    <link rel="stylesheet" href="css/v19.css">
    <link rel="stylesheet" href="css/v14.css">
</head>"""


# Home hero photo (v12): a full-bleed golden-hour Nairobi skyline behind the headline and the hands mark, as on mylk-co.com.
# assets/hero-nairobi.jpg (landscape, desktop) and assets/hero-nairobi-m.jpg (portrait, phones) are made from offer-3.jpg.
# For a sharper result drop a larger photo (2400px+ wide) over assets/hero-nairobi.jpg.
def hero_photo():
    return ('<div class="hero-photo" aria-hidden="true"><picture>'
            '<source media="(max-width:760px)" srcset="assets/hero-nairobi-m.jpg">'
            '<img src="assets/hero-nairobi.jpg" alt="" width="2160" height="1620" fetchpriority="high" decoding="async"></picture></div>\n')


def layout(fname, title, desc, hero, body, gl=True, home=False):
    nav = "".join(
        f'<li><a href="{h}"{" aria-current=\"page\"" if h == fname else ""}>{t}</a></li>' for h, t in NAV)
    foot_nav = "".join(f'<li><a href="{h}">{t}</a></li>' for h, t in NAV)
    body = body.replace('<section class="cta sec--green">', VEL + '<section class="cta sec--green">', 1)
    has_photos = "has-img" in body
    imgdata = '<script src="js/imgdata.js"></script>\n' if (gl and has_photos) else ""
    SCRIPTS = (imgdata + '<script src="assets/vendor/three.min.js"></script>\n<script src="js/scene3d.js"></script>\n' if gl else "") + '<script src="js/main.js"></script>\n<script src="js/fx.js"></script>\n' + ('<script src="js/gl-images.js"></script>\n' if (gl and has_photos) else "") + '<script src="js/flow.js"></script>\n<script src="js/motion.js"></script>\n<script src="js/touch.js"></script>\n<script src="js/swipe.js"></script>\n<script src="js/v9.js"></script>\n<script src="js/v10.js"></script>\n<script src="js/v12.js"></script>\n<script src="js/v13.js"></script>\n<script src="js/hero-scene.js"></script>\n<script src="js/phone3d.js"></script>\n<script src="js/v14.js"></script>'
    if home:
        SCRIPTS = ('<script src="js/imgdata.js"></script>\n<script src="assets/vendor/three.min.js"></script>\n<script src="js/main.js"></script>\n'
                   '<script src="js/v12.js"></script>\n<script src="js/home.js"></script>\n<script src="js/v16.js"></script>\n<script src="js/v17.js"></script>\n<script src="js/v18.js"></script>\n<script src="js/phone-pop.js"></script>')
    companion = (COMPANION + "\n") if (fname == "index.html" and not home) else ""
    html = f"""<!doctype html>
<html lang="en" prefix="og: https://ogp.me/ns#">
{head_block(fname, title, desc)}
<body>
<!-- ── Page transition curtain ─────────────────────────────────────── -->
<div class="curtain" aria-hidden="true"><svg viewBox="-1.05 -1.05 2.1 2.1"><use href="#hands"/></svg></div>
<noscript><style>.curtain{{display:none}}</style></noscript>
<!-- ── Accessibility: skip to content link ─────────────────────────── -->
<a class="skip" href="#main">Skip to content</a>
<!-- ── Shared SVG symbols (the four hands) ─────────────────────────── -->
{SYMBOLS}
<!-- ── Header & menu ───────────────────────────────────────────────── -->
{companion}<header class="hdr"><div class="container">
{LOGO}
<div class="hdr-right"><a class="btn btn-sm" href="contact.html#apply">Apply now</a>
<button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span>Menu</span><i></i></button></div>
</div></header>
<nav class="menu" id="menu" aria-label="Main">
<ul>{nav}</ul>
<aside><h2>Talk to us</h2><ul class="reach"><li><a href="tel:[[PHONE]]">[[I_TEL]]<span>[[PHONE_D]]</span></a></li><li><a href="https://wa.me/[[WA]]">[[I_WA]]<span>WhatsApp us</span></a></li><li><a href="mailto:[[MAIL]]">[[I_MAIL]]<span>[[MAIL]]</span></a></li></ul>
<h2>Find us</h2><p class="reach-pin">[[I_PIN]]<span>Kawangware, Utawala, Thika<br>Head office, Nairobi</span></p></aside>
</nav>
<!-- ── Page content ────────────────────────────────────────────────── -->
<main id="main">
{hero}
{body}
</main>
<!-- ── Footer ──────────────────────────────────────────────────────── -->
<footer class="foot">
<div class="container foot-grid">
<div>{LOGO_FOOT}<p class="tag">Accessible, responsible lending for the people who keep Kenya's markets moving.</p></div>
<div><h2>Explore</h2><ul>{foot_nav}</ul></div>
<div><h2>Reach us</h2><ul class="reach"><li><a href="tel:[[PHONE]]">[[I_TEL]]<span>[[PHONE_D]]</span></a></li><li><a href="https://wa.me/[[WA]]">[[I_WA]]<span>WhatsApp</span></a></li><li><a href="mailto:[[MAIL]]">[[I_MAIL]]<span>[[MAIL]]</span></a></li></ul></div>
<div><h2>Good to know</h2><ul><li><a href="privacy.html">Privacy notice</a></li><li><a href="terms.html">Terms of use</a></li><li><a href="accessibility.html">Accessibility statement</a></li><li><a href="contact.html#complaint">Make a complaint</a></li><li><a href="faqs.html">Questions about pricing</a></li></ul></div>
</div>
<div class="foot-word" aria-hidden="true">Eliana</div>
<div class="foot-base"><div class="container" style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px"><span>&copy; <span data-year>2026</span> Eliana Capital Limited. We grow together.</span><span class="foot-legal"><a href="privacy.html">Privacy</a><a href="terms.html">Terms</a><a href="accessibility.html">Accessibility</a></span></div></div>
</footer>
<!-- ── Scripts ─────────────────────────────────────────────────────── -->
{SCRIPTS}
<script src="js/v19.js"></script>
</body>
</html>"""
    if home:
        import re as _re
        for n in ("v10", "v14"):
            html = html.replace('    <link rel="stylesheet" href="css/%s.css">\n' % n, "")
        html = html.replace('<link rel="stylesheet" href="css/v13.css">', '<link rel="stylesheet" href="css/v13.css">\n    <link rel="stylesheet" href="css/home.css">\n    <link rel="stylesheet" href="css/v16.css">\n    <link rel="stylesheet" href="css/v17.css">\n    <link rel="stylesheet" href="css/v18.css">')
        html = _re.sub(r'<div class="curtain".*?</div>\n', "", html, flags=_re.S)
        html = html.replace('<body>', '<body class="is-home">\n<script>document.documentElement.classList.add("js")</script>', 1)
    for k, v in ICON_PLACEHOLDERS.items():
        html = html.replace(k, v)
    for k, v in CONTACT.items():
        html = html.replace(k, v)
    with open(os.path.join(ROOT, fname), "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", fname)
    WRITTEN.append(fname)


def phero(label, h1, lead, variant="mark"):
    return f"""<section class="phero"><canvas data-flow aria-hidden="true"></canvas><canvas data-scene="page" data-variant="{variant}" aria-hidden="true"></canvas><div class="container">
<p class="label">{label}</p><h1>{h1}</h1><p class="lead">{lead}</p></div></section>"""


STORY_PAGES = {"tailor.jpg": "story-dressmaker.html", "shop.jpg": "story-market-seller.html",
               "farmers.jpg": "story-farmers.html", "couple.jpg": "story-farming-couple.html"}


def pic(src, alt, caption="", pos="50% 50%", extra="", link=False):
    cap = f"<figcaption>{caption}</figcaption>" if caption else ""
    lk = (f'<a class="photo-link" href="{STORY_PAGES[src]}" aria-label="Read the story: {caption or alt}"><span>Read story</span></a>' if link else "")
    return (f'<figure class="photo has-img {extra}" data-tilt><img src="assets/{src}" alt="{alt}" loading="lazy" '
            f'style="object-position:{pos}">{cap}{lk}</figure>')


def portrait(src, name, initials):
    """Round director portrait. If the image file is missing, the initials show instead."""
    return (f'<div class="portrait" data-initials="{initials}"><img src="assets/{src}" alt="Portrait of {name}" loading="lazy" '
            f'onerror="this.parentNode.classList.add(\'no-img\');this.remove()"></div>')


def photo(cls, title, note, extra=""):
    return f'<figure class="photo {cls} {extra}"><figcaption><b>{title}</b>{note}</figcaption></figure>'


PANELS = [
    ("p1", "Right first time", "No file moves until identity checks, affordability and approval are complete. Our records are accurate, documented and ready to be audited. Speed never becomes a reason to skip a control."),
    ("p2", "Respect earns repayment", "We price in plain language, with no hidden charges, ever. We follow up firmly and courteously and never intimidate a customer. We handle your data as carefully as your money."),
    ("p3", "Own the outcome", "We know our targets daily and say where we stand. We raise arrears, errors and risks early, and we do what we said by when we said."),
    ("p4", "Lift as you raise", "We coach openly, share what is working in each market, and recognise good work out loud. Feedback is a tool, not a verdict."),
]


PANEL_IMG = {
    "p1": ("how-right-first-time.jpg", "A shopkeeper smiling as he checks his phone in his stocked shop", "50% 30%"),
    "p2": ("how-respect.jpg", "A customer and a shop owner shaking hands in a doorway", "88% 40%"),
    "p3": ("how-own-outcome.jpg", "A dressmaker in her workshop with a tape measure around her neck", "30% 25%"),
    "p4": ("how-lift.jpg", "A market trader smiling behind a stall of fresh tomatoes and greens", "40% 35%"),
}


def panels_html():
    out = '<div class="panels">'
    for c, t, b in PANELS:
        f, alt, pos = PANEL_IMG[c]
        out += (f'<div class="panel {c}" role="button" tabindex="0" aria-expanded="false">'
                f'<img class="pimg" src="assets/{f}" alt="{alt}" loading="lazy" style="object-position:{pos}">'
                f'<span class="shade" aria-hidden="true"></span>'
                f'<span class="corner" aria-hidden="true">+</span><span class="vt" aria-hidden="true">{t}</span>'
                f'<h3 class="ht">{t}</h3><div class="body"><p>{b}</p></div></div>')
    return out + "</div>"


SCENES = """
<svg class="scene" viewBox="0 0 480 600" role="img" aria-label="Three bars rising from KES 5,000 to KES 15,000, topped with a sprout, over a market trader smiling at her stall"><defs><linearGradient id="sh1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#010395" stop-opacity=".62"/><stop offset=".55" stop-color="#010395" stop-opacity=".34"/><stop offset="1" stop-color="#00014f" stop-opacity=".9"/></linearGradient></defs>
<rect width="480" height="600" fill="#010395"/><image class="bg" href="assets/offer-1.jpg" x="-20" y="-20" width="520" height="650" preserveAspectRatio="xMidYMid slice"/><rect width="480" height="600" fill="url(#sh1)"/>
<rect x="70" y="350" width="100" height="130" rx="18" fill="#a6dd99"/><rect x="190" y="270" width="100" height="210" rx="18" fill="#7fc16f"/><rect x="310" y="170" width="100" height="310" rx="18" fill="#5fa052"/>
<g fill="#fff" font-size="21" font-weight="600" text-anchor="middle"><text x="120" y="520">5,000</text><text x="240" y="520">10,000</text><text x="360" y="520">15,000</text></g>
<text x="70" y="90" fill="#fff" font-size="26" font-weight="500">Imaarika, in KES</text>
<g transform="translate(360 170)"><path d="M0 0 V-46" stroke="#a6dd99" stroke-width="7" stroke-linecap="round"/><path d="M0 -30 C-34 -34 -44 -62 -40 -76 C-14 -76 0 -58 0 -30Z" fill="#a6dd99"/><path d="M0 -40 C30 -42 42 -66 38 -82 C14 -80 0 -64 0 -40Z" fill="#fff"/></g></svg>
<svg class="scene" viewBox="0 0 480 600" role="img" aria-label="A receipt listing fee, interest and no hidden charges, over a handshake between a shop owner and a customer"><defs><linearGradient id="sh2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f6a2a" stop-opacity=".55"/><stop offset="1" stop-color="#1d4a1a" stop-opacity=".88"/></linearGradient></defs>
<rect width="480" height="600" fill="#2f6a2a"/><image class="bg" href="assets/offer-2.jpg" x="-20" y="-20" width="520" height="650" preserveAspectRatio="xMidYMid slice"/><rect width="480" height="600" fill="url(#sh2)"/>
<path d="M90 70 H390 V500 L367 484 L343 500 L318 484 L294 500 L270 484 L245 500 L221 484 L197 500 L172 484 L148 500 L124 484 L90 500Z" fill="#fff"/>
<g fill="#101340" font-size="22" font-weight="600"><text x="122" y="130">Your Imaarika loan</text></g>
<g fill="#393b63" font-size="19"><text x="122" y="200">Processing fee</text><text x="122" y="262">Interest</text><text x="122" y="324">Penalties</text><text x="122" y="386">Hidden charges</text></g>
<g fill="#101340" font-size="19" font-weight="600" text-anchor="end"><text x="358" y="200">KES 500</text><text x="358" y="262">27%</text><text x="358" y="324">Stated first</text><text x="358" y="386" fill="#2f6a2a">None</text></g>
<g stroke="#d8daf4" stroke-width="2" stroke-dasharray="6 6"><path d="M122 150 H358"/></g>
<circle cx="240" cy="440" r="26" fill="#5fa052"/><path d="M227 440 l9 10 l18 -21" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
<svg class="scene" viewBox="0 0 480 600" role="img" aria-label="Branch locations in Kawangware, Utawala and Thika connected to a mobile phone, over the Nairobi skyline at sunset"><defs><linearGradient id="sh3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#010395" stop-opacity=".5"/><stop offset=".6" stop-color="#010395" stop-opacity=".42"/><stop offset="1" stop-color="#00014f" stop-opacity=".88"/></linearGradient></defs>
<rect width="480" height="600" fill="#010395"/><image class="bg" href="assets/offer-3.jpg" x="-20" y="-20" width="520" height="650" preserveAspectRatio="xMidYMid slice"/><rect width="480" height="600" fill="url(#sh3)"/>
<g stroke="#fff" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" fill="none" opacity=".9"><path d="M96 150 Q170 230 210 280"/><path d="M96 450 Q170 380 210 330"/><path d="M400 120 Q330 210 285 270"/></g>
<g fill="#5fa052"><circle cx="96" cy="150" r="22"/><circle cx="96" cy="450" r="22"/><circle cx="400" cy="120" r="22"/></g><g fill="#fff"><circle cx="96" cy="150" r="8"/><circle cx="96" cy="450" r="8"/><circle cx="400" cy="120" r="8"/></g>
<g fill="#fff" font-size="18" font-weight="600" style="paint-order:stroke;stroke:rgba(0,1,79,.55);stroke-width:4px"><text x="126" y="157">Kawangware</text><text x="126" y="457">Utawala</text><text x="300" y="100">Thika</text></g>
<rect x="195" y="230" width="100" height="190" rx="20" fill="#010395" stroke="#fff" stroke-opacity=".7" stroke-width="3"/><rect x="205" y="250" width="80" height="140" rx="8" fill="#fff"/><circle cx="245" cy="406" r="6" fill="#d8daf4"/>
<rect x="215" y="268" width="60" height="10" rx="5" fill="#d8daf4"/><rect x="215" y="290" width="40" height="10" rx="5" fill="#d8daf4"/><rect x="215" y="322" width="60" height="42" rx="10" fill="#5fa052"/></svg>
<svg class="scene" viewBox="0 0 480 600" role="img" aria-label="Steps climbing upward, one step per loan, over a field being harvested"><defs><linearGradient id="sh4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#00014f" stop-opacity=".78"/><stop offset=".5" stop-color="#010395" stop-opacity=".4"/><stop offset="1" stop-color="#00014f" stop-opacity=".9"/></linearGradient></defs>
<rect width="480" height="600" fill="#00014f"/><image class="bg" href="assets/offer-4.jpg" x="-20" y="-20" width="520" height="650" preserveAspectRatio="xMidYMid slice"/><rect width="480" height="600" fill="url(#sh4)"/>
<rect x="60" y="400" width="90" height="120" rx="14" fill="#a6dd99"/><rect x="160" y="340" width="90" height="180" rx="14" fill="#7fc16f"/><rect x="260" y="270" width="90" height="250" rx="14" fill="#5fa052"/><rect x="360" y="190" width="70" height="330" rx="14" fill="#fff"/>
<g stroke="#a6dd99" stroke-width="3" stroke-dasharray="3 9" stroke-linecap="round" fill="none"><path d="M105 370 Q140 300 205 310"/><path d="M205 310 Q250 250 305 240"/><path d="M305 240 Q340 170 395 160"/></g>
<circle cx="395" cy="150" r="22" fill="#5fa052"/><path d="M384 150 l8 9 l16 -19" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
<text x="60" y="80" fill="#fff" font-size="26" font-weight="500">Each good repayment</text><text x="60" y="112" fill="#e3e5fa" font-size="22">opens the next door faster</text></svg>
"""

SERVICES = [
    ("Imaarika working-capital loan", "KES 5,000 to 15,000 for stock, supplies or a short gap in cash flow, repaid in daily instalments over up to 30 days."),
    ("Prices in plain language", "Processing fee, interest and penalties are explained before you accept. No hidden charges, ever."),
    ("Branch feet, digital rails", "Officers who know your market, working on systems that settle by mobile money."),
    ("Rewards for good repayers", "Repay early without punitive charges. A good repayment record earns faster access next time."),
]


# ---- v9: feature cards that scroll by themselves (Naturals-style) ----
ICONS = {
    "price": '<path d="M5 4h14v17l-3-2-2 2-2-2-2 2-2-2-3 2z"/><path d="M9 9h6M9 13h6"/>',
    "officer": '<path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    "checks": '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
    "mobile": '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 18h2"/>',
    "reward": '<path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/>',
    "heard": '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9h8M8 12h5"/>',
}
FEATURES = [
    ("price", "Prices in plain language", "Fee, interest and penalties are explained before you accept. No hidden charges, ever."),
    ("officer", "Officers who know your market", "A real person from your area, a call or a branch visit away."),
    ("checks", "Every file checked", "Identity and affordability come first, so a loan fits your cash flow."),
    ("mobile", "Paid by mobile money", "No queues for cash. Your loan arrives, and repayments go, by mobile money."),
    ("reward", "Rewards for good repayers", "Repay early with no punitive charge, and get faster access next time."),
    ("heard", "Complaints heard", "Every complaint is recorded, so none gets lost."),
]


def feature_marquee():
    def group(hidden):
        attr = ' aria-hidden="true"' if hidden else ""
        cards = "".join(
            f'<li class="fm-card"><span class="fm-ico" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[i]}</svg></span>'
            f'<h3>{t}</h3><p>{d}</p></li>' for i, t, d in FEATURES)
        return f'<ul class="fm-group"{attr}>{cards}</ul>'
    return f'<div class="fm" role="region" aria-label="What you can expect from us"><div class="fm-track">{group(False)}{group(True)}</div></div>'


# ---- v9: service cards that stack as you scroll ----
STACK_TAGS = [
    ["KES 5,000 to 15,000", "Up to 30 days"],
    ["KES 500 fee", "27% interest", "No hidden charges"],
    ["Kawangware", "Utawala", "Thika"],
    ["Early repayment welcome", "Faster access next time"],
]
STACK_CTA = [("See the loan in full", "services.html"), ("Read the questions people ask", "faqs.html"),
             ("Talk to us", "contact.html#callback"), ("Apply now", "contact.html#apply")]


def stack_cards():
    scenes = ['<svg class="scene" preserveAspectRatio="xMidYMid slice"' + x for x in SCENES.split('<svg class="scene"')[1:]]
    out = '<div class="stack">'
    for i, ((t, d), tags, (cta, href), sc) in enumerate(zip(SERVICES, STACK_TAGS, STACK_CTA, scenes)):
        chips = "".join(f"<li>{x}</li>" for x in tags)
        out += (f'<article class="stack-card c{i + 1}" style="--i:{i}"><div class="stack-copy"><ul class="tags">{chips}</ul>'
                f'<h3>{t}</h3><p>{d}</p><a class="btn btn-blue" href="{href}">{cta}</a></div>'
                f'<div class="stack-media">{sc}</div></article>')
    return out + "</div>"


STAMP = """<svg class="stamp" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0"/></defs>
<circle cx="100" cy="100" r="98" fill="#5fa052"/>
<g class="ring"><text font-size="21" font-weight="600" fill="#00014f" letter-spacing="1.4"><textPath href="#ring-path">We grow together &#8226; Eliana Capital &#8226; </textPath></text></g>
<g transform="translate(100 100) scale(36)" fill="#fff"><use href="#hands"/></g></svg>"""


def build_home():
    hero = ("""<section class="hero hero--arch hero--v10" id="top" data-rail="Welcome">
<!-- ── Full-bleed hero photo (css/v12.css) ── -->
"""+hero_photo()+"""<div class="container hero-inner">
<p class="chip-live"><i aria-hidden="true"></i>Now lending in Kawangware, Utawala and Thika</p>
<h1><span class="ln"><span>Credit should empower,</span></span><span class="ln"><span>never <em class="swoosh">trap.<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 9 C 45 2, 90 13, 140 5 S 190 6, 197 4"/></svg></em></span></span></h1>
<div class="hero-stage">
<div class="hs-left"><p class="lead">Working capital for market traders, tailors, shopkeepers and small business owners across Kenya. Honest prices, shown before you say yes.</p></div>
<div class="hero-slot" data-mk-theme="light" aria-hidden="true"><span class="hero-word">grow</span><i class="rp rp1"></i><i class="rp rp2"></i><i class="rp rp3"></i>
<span class="orbit o1">Paid by mobile money</span><span class="orbit o2">Small daily instalments</span><span class="orbit o3">Women entrepreneurs welcome</span></div>
<div class="hs-right"><div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply now</a><a class="btn btn-line" href="contact.html#callback">Request a call back</a></div>
<p class="hs-note">No hidden charges. You see the full price first.</p></div>
</div>
</div>
<div class="container arch-wrap"><div class="arches">"""
    + pic("tailor.jpg", "A dressmaker smiling as she checks her phone at her sewing machine, surrounded by colourful fabrics", "Dressmakers", "74% 35%", "arch", True)
    + pic("shop.jpg", "A roadside seller in a bright blue top smiling at her phone beside bowls of groundnuts", "Market sellers", "50% 30%", "arch", True)
    + pic("farmers.jpg", "Women and men harvesting sugarcane together in a field at golden hour", "Farmers", "74% 55%", "arch", True)
    + """</div>""" + STAMP + """</div>
<div class="container"><dl class="hero-facts">
<div><dt>Loan size</dt><dd>KES 5,000 to 15,000</dd></div>
<div><dt>Repay over</dt><dd>Up to 30 days, daily</dd></div>
<div><dt>Decision target</dt><dd>2 hours on complete applications</dd></div>
</dl></div></section>""")

    svc_items = "".join(
        f'<li class="svc" tabindex="0"><h3>{t}</h3><p>{d}</p>' + (
            '<a href="services.html">See the loan in full</a>' if i == 0 else "") + "</li>"
        for i, (t, d) in enumerate(SERVICES))

    feat_html = ('<section class="sec feat-sec" id="care" data-rail="Why Eliana"><div class="container center-head">'
                 '<div class="mk-slot mk-slot--c" data-mk-stop data-mk-theme="light" aria-hidden="true"></div><p class="label">Why Eliana</p><h2>More than a loan: a fair deal, explained.</h2>'
                 '<p class="lead">From the first call, we focus on understanding your business and lending in a way that feels clear, quick and respectful.</p></div>'
                 + feature_marquee() + '</section>')
    stack_html = stack_cards()
    body = f"""
{feat_html}
<section class="sec" id="who" data-rail="Who we are">
<div class="container">
<div class="grid-label"><div class="gl-left"><p class="label">Who we are</p><div class="mk-slot mk-slot--l" data-mk-stop data-mk-theme="light" aria-hidden="true"></div></div>
<p class="lit" data-lit>Eliana Capital is a female-owned, female-run Kenyan microfinance lender. We pair digital speed with local relationships and disciplined credit, so people can act on opportunity, build resilient businesses and grow with dignity.</p></div>
<dl class="stats">
<div class="stat"><dt>Branches trading</dt><dd><span class="v">3</span><span class="t">branches trading</span><span class="s">Kawangware, Utawala, Thika</span></dd></div>
<div class="stat"><dt>Planned</dt><dd><span class="v">6</span><span class="t">more branches planned</span><span class="s">Taking us to nine across Kenya</span></dd></div>
<div class="stat"><dt>Turnaround</dt><dd><span class="v">2 hrs</span><span class="t">target turnaround</span><span class="s">On complete applications</span></dd></div>
<div class="stat"><dt>Pricing</dt><dd><span class="v">100%</span><span class="t">of pricing disclosed</span><span class="s">Before you accept</span></dd></div>
</dl></div></section>

<section class="sec" id="offer" data-rail="What we offer">
<div class="container">
<div class="sec-head offer-head"><h2><span>One clear loan,</span><span>built around your day.</span></h2><div class="oh-r"><div class="mk-slot mk-slot--r" data-mk-stop data-mk-theme="light" aria-hidden="true"></div><p class="lead">One loan, shaped around how small businesses really earn: a little each day, with a price you can read.</p></div></div>
{stack_html}
</div></section>

<section class="sec sec--mist" id="price" data-rail="Pricing">
<div class="container grid-2" style="align-items:center">
<div><p class="label">Pricing</p><h2>Know the price before you say yes.</h2>
<p class="lead" style="margin-top:1.2rem">We state the fee, the interest and any penalties up front, in plain words. If a number is not on your agreement, we do not charge it.</p>
<div class="btn-row" style="margin-top:1.6rem"><a class="btn btn-blue" href="how-it-works.html">Learn how it works</a><a class="btn btn-line" href="faqs.html">Read the FAQs</a></div></div>
<div class="rc-wrap"><div class="mk-slot mk-slot--sticker" data-mk-stop data-mk-theme="light" aria-hidden="true"></div><div class="receipt" role="group" aria-label="Example of what is shown before you accept">
<h3>Your Imaarika loan</h3><p class="sub">What you see before you accept</p>
<dl><div class="row"><dt>Loan size</dt><dd>KES 5,000 to 15,000</dd></div>
<div class="row"><dt>Repay over</dt><dd>Up to 30 days, daily</dd></div>
<div class="row"><dt>Processing fee</dt><dd>KES 500</dd></div>
<div class="row"><dt>Interest</dt><dd>27%</dd></div>
<div class="row"><dt>Penalties</dt><dd>Shown first</dd></div>
<div class="row"><dt>Hidden charges</dt><dd class="ok">None</dd></div></dl>
<p class="receipt-note">Repay early? No punitive charge.</p></div></div>
</div></section>

<section class="sec sec--night dark" id="values" data-rail="How we work">
<div class="container">
<div class="sec-head has-slot"><div><p class="label">How we work</p><h2>Four promises our whole team keeps, in the branch, in the field and at head office.</h2></div><div class="mk-slot mk-slot--r" data-mk-stop data-mk-theme="dark" aria-hidden="true"></div></div>
{panels_html()}
</div></section>

<div class="marquee" aria-label="People we back">
<div class="marquee-track" aria-hidden="true">""" + "".join(
        f"<span>{w}</span>" for w in ["Market traders", "Tailors and dressmakers", "Grocers", "Kiosk owners", "Food vendors", "Salon owners", "Shopkeepers", "Home businesses"] * 2) + """</div>
<p class="marquee-note"><span class="sr">People we back: </span>Informal-sector earners with genuine cash flow, and households that need short-term working capital.</p></div>

<section class="sec" id="branches" data-rail="Branches">
<div class="container">
<div class="sec-head"><p class="label">Our branches</p><h2>Local officers who know your market.</h2></div>
<ul class="branches">
<li class="live"><span class="bn">Kawangware</span><span class="bd"><i class="tag"></i>Branch, trading</span></li>
<li class="live"><span class="bn">Utawala</span><span class="bd"><i class="tag"></i>Branch, trading</span></li>
<li class="live"><span class="bn">Thika</span><span class="bd"><i class="tag"></i>Branch, trading</span></li>
<li class="live"><span class="bn">Nairobi</span><span class="bd"><i class="tag"></i>Head office</span></li>
<!--<li class="soon"><span class="bn">Six more</span><span class="bd"><i class="tag"></i>Branches planned</span></li>-->
</ul></div></section>

<section class="sec sec--leaf">
<div class="container">
<div class="sec-head"><p class="label">Customer stories</p><h2>Real people. Real businesses. Told with dignity.</h2></div>
<div class="photos">""" + pic("tailor.jpg", "A dressmaker smiling as she checks her phone at her sewing machine, surrounded by colourful fabrics", "Dressmakers and tailors", "72% 35%", "arch", True) + pic("shop.jpg", "A roadside seller in a bright blue top smiling at her phone beside bowls of groundnuts", "Market and roadside sellers", "50% 30%", "arch", True) + pic("farmers.jpg", "Women and men harvesting sugarcane together in a field at golden hour", "Farmers and farm workers", "74% 55%", "arch", True) + """</div>
<div class="btn-row" style="margin-top:2.4rem"><a class="btn btn-blue" href="customer-stories.html">Read customer stories</a></div>
</div></section>

<section class="sec" id="faq" data-rail="Questions">
<div class="container grid-label"><div class="gl-left"><p class="label">Questions</p><div class="mk-slot mk-slot--l" data-mk-stop data-mk-theme="light" aria-hidden="true"></div></div>
<div><h2 style="margin-bottom:2rem">Short answers to the things people ask first.</h2>""" + faq_html(FAQS[:4]) + """
<p style="margin-top:1.6rem"><a class="btn btn-line" href="faqs.html">All questions</a></p></div></div></section>

<section class="cta cta--mk sec--green"><div class="container wrap"><div class="cta-copy"><h2>Ready when you are.</h2>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply now</a><a class="btn btn-line" href="contact.html#callback">Talk to us</a></div></div><div class="mk-slot mk-slot--cta" data-mk-stop data-mk-theme="green" aria-hidden="true"></div></div></section>"""
    layout("index.html", "Eliana Capital | Credit that empowers, never traps",
           "Eliana Capital is a Kenyan digital microfinance lender offering responsible working-capital loans of KES 5,000 to 15,000 with prices shown up front.",
           hero, body, gl=True)


def build_about():
    hero = phero("About us", "A lender built for real businesses.",
                 "Eliana Capital Limited is a purpose-driven digital microfinance institution serving individuals, households and small business owners across Kenya.", variant="mark")
    body = """
<section class="sec"><div class="container grid-label"><p class="label">Our belief</p>
<blockquote class="big" data-lit>&ldquo;Credit must empower, never trap.&rdquo;<cite>Ayoti Bukachi-Thande, Director</cite></blockquote></div></section>

<section class="sec sec--mist"><div class="container"><dl class="stats stats--flat" style="margin:0 0 clamp(40px,6vw,88px)">
<div class="stat"><dt>Owned</dt><dd><span class="v">100%</span><span class="t">female-owned</span><span class="s">And female-run</span></dd></div>
<div class="stat"><dt>Branches</dt><dd><span class="v">3</span><span class="t">branches trading</span><span class="s">Kawangware, Utawala, Thika</span></dd></div>
<div class="stat"><dt>Loans</dt><dd><span class="v">30</span><span class="t">days to repay, at most</span><span class="s">In daily instalments</span></dd></div>
<div class="stat"><dt>Prices</dt><dd><span class="v">0</span><span class="t">hidden charges</span><span class="s">Ever</span></dd></div></dl></div>
<div class="container grid-2">
<div><p class="label">Why we exist</p><h2>We lend with purpose, so businesses grow sustainably.</h2></div>
<div><p class="lead"><b>Our mission.</b> To unlock opportunity through accessible, responsible and growth-oriented lending: a gateway to finance that is human-centred, transparent and matched to real business needs.</p>
<p class="lead"><b>Who we serve.</b> Micro and small business owners, informal-sector earners with genuine cash flow, and households needing short-term working capital. We are female-owned and female-run, and proud to back women entrepreneurs.</p></div>
</div></section>

<section class="sec"><div class="container grid-2" style="align-items:center">
<div>""" + pic("tailor.jpg", "A dressmaker working at her sewing machine in a shop full of printed fabrics", "", "72% 35%", "photo--wide") + """</div>
<div><p class="label">Our name</p><h2>Eliana means light, and an answered prayer.</h2>
<p class="lead" style="margin-top:1.2rem">In Hebrew, Eliana means &lsquo;My God answered&rsquo;. In Greek, it points to light. For us it comes down to one idea: opportunity that responds to real need.</p></div></div></section>

<section class="sec sec--night dark"><div class="container">
<div class="sec-head"><p class="label">How we work</p><h2>The standards every colleague helps deliver.</h2></div>""" + panels_html() + """</div></section>

<section class="sec"><div class="container">
<div class="sec-head"><p class="label">Why you can trust us</p><h2>Growth we can defend: more customers served, without loosening how we lend.</h2></div>
<ul class="trust">
<li><h3>Prices up front</h3><p>Fee, interest and penalties are shown before you accept.</p></li>
<li><h3>Every file checked</h3><p>KYC and AML/CFT checks on every single file, with affordability first.</p></li>
<li><h3>Your data, protected</h3><p>We handle your information as carefully as your money.</p></li>
<li><h3>Complaints heard</h3><p>Clear channels, and every complaint is recorded.</p></li></ul></div></section>

<section class="sec sec--mist"><div class="container">
<div class="sec-head"><p class="label">Leadership</p><h2>Two directors, one promise.</h2></div>
<div class="people">
<div class="person">""" + portrait("ayoti.jpeg", "Ayoti Bukachi-Thande", "AB") + """<h3>Ayoti Bukachi-Thande</h3><p>Director</p></div>
<div class="person">""" + portrait("faith.jpeg", "Faith Chepkoech Cheruiyot", "FC") + """<h3>Faith Chepkoech Cheruiyot</h3><p>Director</p></div>
</div></div></section>

<section class="cta sec--green"><canvas data-scene="wave" aria-hidden="true"></canvas><div class="container wrap"><h2>Let us grow together.</h2>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply now</a><a class="btn btn-line" href="contact.html#callback">Talk to us</a></div></div></section>"""
    layout("about.html", "About us | Eliana Capital",
           "Eliana Capital is a female-owned, female-run Kenyan microfinance lender. Learn our mission, our values and the people behind the name.",
           hero, body)


def build_services():
    hero = phero("Our services", "Imaarika: working capital that fits your day.",
                 "A short-term loan for the things that keep a small business moving, with a price you can read and repay on your own rhythm.", variant="bars")
    body = """
<section class="sec"><div class="container grid-2">
<div><p class="label">The loan at a glance</p><h2>Everything you need to decide, in one place.</h2>
<p class="lead" style="margin-top:1.2rem">Before you accept, we confirm each of these with you in plain words.</p>
<div class="btn-row" style="margin-top:1.6rem"><a class="btn btn-blue" href="contact.html#apply">Apply now</a></div></div>
<dl class="spec">
<div><dt>Loan size</dt><dd>KES 5,000 to 15,000</dd></div>
<div><dt>Repay over</dt><dd>Up to 30 days<small>In daily instalments</small></dd></div>
<div><dt>Processing fee</dt><dd>KES 500</dd></div>
<div><dt>Interest</dt><dd>27%</dd></div>
<div><dt>Penalties</dt><dd>Stated up front<small>You see them before you accept</small></dd></div>
<div><dt>Hidden charges</dt><dd>None</dd></div>
<div><dt>Repaying early</dt><dd>Welcome<small>No punitive charge</small></dd></div>
<div><dt>Decision target</dt><dd>2 hours<small>On complete applications</small></dd></div>
<div><dt>Money moves by</dt><dd>Mobile money</dd></div>
</dl></div></section>

<section class="sec sec--mist"><div class="container grid-2">
<div><p class="label">Who it is for</p><h2>Built for people who earn day by day.</h2></div>
<div><ul class="prose"><li>Micro and small business owners who need working capital</li><li>Informal-sector earners with genuine cash flow</li><li>Households that need short-term working capital</li><li>Women entrepreneurs, whom we are proud to back</li></ul>
<p class="lead" style="margin-top:1.4rem">Speed with a full stop: our two-hour target never replaces identity checks, an affordability check and approval. Those come first, every time.</p></div>
</div>
<div class="container" style="margin-top:clamp(36px,5vw,72px)">""" + pic("couple.jpg", "An older farming couple smiling, holding a bucket of potatoes and a mobile phone", "", "45% 40%", "photo--banner") + """</div></section>

<section class="sec"><div class="container">
<div class="sec-head"><p class="label">Beyond the first loan</p><h2>Reward the repayer.</h2><p class="lead">We want one loan to become a relationship. Early repayment is welcome, and good behaviour earns faster access the next time you need support.</p></div>
<ul class="trust"><li><h3>No punitive early-repayment charges</h3><p>Pay back sooner and keep your momentum.</p></li><li><h3>Faster access next time</h3><p>A good repayment record opens the door quicker.</p></li><li><h3>A local officer</h3><p>Someone who knows your market, a call away.</p></li><li><h3>Clear communication</h3><p>Firm and courteous, never intimidating.</p></li></ul>
</div></section>

<section class="cta sec--green"><canvas data-scene="wave" aria-hidden="true"></canvas><div class="container wrap"><h2>See if Imaarika fits your business.</h2>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply now</a><a class="btn btn-line" href="contact.html#callback">Request a call back</a></div></div></section>"""
    layout("services.html", "Our services | Eliana Capital",
           "Imaarika working-capital loans from Eliana Capital: KES 5,000 to 15,000, up to 30 days, with fees and interest explained before you accept.",
           hero, body)


def build_how():
    hero = phero("How it works", "From first call to mobile money in five clear steps.",
                 "No jargon, no surprises. You always know what happens next.", variant="path")
    steps = [
        ("Talk to us", "Call, send a WhatsApp message, or ask for a call back. Tell us about your business and how much you need."),
        ("Apply", "Share a few details about you and your business, online or with a loan officer. Have your identification ready."),
        ("We check", "We verify who you are and make sure repayments fit your cash flow. We stay quick, but we never skip these checks."),
        ("See the full price, then decide", "The processing fee, interest and any penalties are shown before you accept. If it does not feel right, you can say no."),
        ("Receive and repay", "Your loan arrives by mobile money. Repay daily over up to 30 days, or pay early with no punitive charge."),
    ]
    items = "".join(f"<li class='step'><h3>{t}</h3><p>{d}</p></li>" for t, d in steps)
    body = f"""
<section class="sec"><div class="container"><ol class="steps" style="padding:0;list-style:none">{items}</ol></div></section>
<section class="sec sec--mist"><div class="container grid-2" style="align-items:center">
<div><p class="label">After your first loan</p><h2>Repay well, borrow easier.</h2></div>
<p class="lead">Good repayment earns faster access to your next loan. That is how one loan becomes a relationship, and how we grow together.</p></div>
<div class="container" style="margin-top:clamp(36px,5vw,72px)">""" + pic("shop.jpg", "A roadside seller smiling at her phone with bowls of groundnuts in front of her", "", "50% 35%", "photo--banner") + """</div></section>
<section class="cta sec--green"><canvas data-scene="wave" aria-hidden="true"></canvas><div class="container wrap"><h2>Start with a conversation.</h2>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#callback">Request a call back</a><a class="btn btn-line" href="contact.html#apply">Apply now</a></div></div></section>"""
    layout("how-it-works.html", "How it works | Eliana Capital",
           "How to get an Eliana Capital loan: talk to us, apply, get checked, see the full price, then receive and repay by mobile money.",
           hero, body)


STORIES = [
    ("tailor.jpg", "A dressmaker smiling at her phone beside her sewing machine", "72% 35%", "Dressmaker and tailor", "story-dressmaker.html", "Stitching a bigger order", "Kawangware", "Dressmakers"),
    ("shop.jpg", "A roadside seller smiling at her phone among bowls of groundnuts", "50% 30%", "Market and roadside seller", "story-market-seller.html", "Restocking before the rush", "Utawala", "Sellers"),
    ("farmers.jpg", "Women and men harvesting sugarcane in a field", "74% 55%", "Farmers and farm workers", "story-farmers.html", "Planting on time", "Thika", "Farmers"),
    ("couple.jpg", "An older couple holding a bucket of potatoes and a mobile phone", "45% 40%", "Farming couple", "story-farming-couple.html", "Small loans, steady harvests", "Thika", "Farmers"),
]


VEL = """<section class="vel" aria-hidden="true">
<div class="vel-row" data-dir="-1"><div class="vel-track"><div class="vel-group"><span>We lend with purpose</span><i></i><span>We serve with dignity</span><i></i><span>We grow together</span><i></i></div></div></div>
<div class="vel-row vel-row--out" data-dir="1"><div class="vel-track"><div class="vel-group"><span>Credit that empowers, never traps</span><i></i><span>Fast as a digital lender</span><i></i><span>Known to you like a neighbour</span><i></i></div></div></div>
</section>"""


STORY_COPY = {
    "story-dressmaker.html": ("Fabric and thread bought up front, repaid daily as the orders are delivered.",
        "Orders for dresses, uniforms and alterations come in waves, and the fabric has to be bought before the customer pays. A short Imaarika loan covers supplies up front so the sewing machine keeps running.",
        "Repayments are small and daily across up to 30 days, and the full price is explained before the loan is accepted. Finishing each order brings in the money to repay."),
    "story-market-seller.html": ("Restocking before the busy hours, with a clear daily repayment.",
        "Stock sells fastest when the stall is full. A short loan lets a seller restock in bulk before the rush, instead of buying a little at a time.",
        "The fee, interest and any penalties are stated up front, so there are no surprises. Daily repayments follow the daily takings, and a good record earns faster access next time."),
    "story-farmers.html": ("Seed, labour and transport paid for in time for the season.",
        "On a farm, timing is everything. Seed, tools and casual labour all need paying before the harvest brings in income. A short working-capital loan helps the work start on time.",
        "Loans run up to 30 days with daily repayments, so we look at whether regular sales can cover them before we lend. Affordability always comes first."),
    "story-farming-couple.html": ("A small loan for farm inputs, repaid in manageable amounts.",
        "A couple who sell potatoes and other produce can use a small loan to buy inputs and cover the cost of getting produce to market. Imaarika loans start at KES 5,000.",
        "Loans and repayments move by mobile money, and a loan officer explains each step. Early repayment is welcome, with no punitive charge."),
}


def build_stories():
    hero = phero("Customer stories", "Businesses growing, in their own words.",
                 "Real businesses, real growth. We share a story only with the customer's consent.", variant="cards")
    f = STORIES[0]
    feat = (f'<section class="sec feat"><div class="container"><a class="feat-a" href="{f[4]}">'
            + pic(f[0], f[1], "", f[2], "photo--feature") +
            f'<div class="feat-meta"><div><p class="label">Featured story, {f[6]}</p><h2>{f[5]}</h2></div>'
            f'<div><p class="lead">{f[3]}, {f[6]}. {STORY_COPY[f[4]][0]}</p><span class="more">Read story <i>&rarr;</i></span></div></div></a></div></section>')
    cards = ""
    for n, (img, alt, pos, who, href, head, branch, cat) in enumerate(STORIES[1:], start=2):
        cards += (f"<article class='story'>" + pic(img, alt, "", pos) +
                  f"<div class='story-text'><h3><a class='story-a' href='{href}'>{head}</a></h3>"
                  f"<p>{who}, {branch}. {STORY_COPY[href][0]}</p><span class='more' aria-hidden='true'>Read story <i>&rarr;</i></span></div></article>")
    rows = "".join(
        f'<li><a href="{h}"><span class="t">{hd}</span><span class="m">{w}, {b}</span><img class="thumb" src="assets/{im}" alt="" loading="lazy"></a></li>'
        for i, (im, al, ps, w, h, hd, b, c) in enumerate(STORIES, start=1))
    prev = "".join(f'<img src="assets/{st[0]}" alt="" loading="lazy">' for st in STORIES)
    body = f"""
{feat}
<section class="sec sec--tint"><div class="container"><div class="stories-grid">{cards}</div></div></section>
<section class="sec sec--night dark index"><div class="container">
<div class="sec-head"><p class="label">All stories</p><h2>Pick a story.</h2></div>
<ul class="story-list">{rows}</ul></div>
<div class="story-preview" aria-hidden="true">{prev}</div></section>
<section class="cta sec--green"><canvas data-scene="wave" aria-hidden="true"></canvas><div class="container wrap"><h2>Your business could be next.</h2>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply now</a><a class="btn btn-line" href="contact.html#callback">Talk to us</a></div></div></section>"""
    layout("customer-stories.html", "Customer stories | Eliana Capital",
           "Stories from small business owners growing with Eliana Capital.", hero, body)


def build_story_pages():
    for i, (img, alt, pos, who, href, head, branch, cat) in enumerate(STORIES):
        prv, nxt = STORIES[i - 1], STORIES[(i + 1) % len(STORIES)]
        hero = phero("Customer story", head + ".", f"{who}, {branch} branch. {STORY_COPY[href][0]}", variant="cards")
        body = f"""
<section class="sec"><div class="container story-page">
<div>{pic(img, alt, "", pos, "photo--tall")}</div>
<div class="story-copy">
<dl class="facts"><div><dt>Business</dt><dd>{who}</dd></div><div><dt>Branch</dt><dd>{branch}</dd></div><div><dt>Product</dt><dd>Imaarika working-capital loan</dd></div></dl>
<h2>How the loan helps</h2>
<p class="lead">{STORY_COPY[href][1]}</p>
<p class="lead">{STORY_COPY[href][2]}</p>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply now</a><a class="btn btn-line" href="customer-stories.html">All stories</a></div>
</div></div></section>
<section class="sec sec--mist"><div class="container"><div class="story-nav">
<a href="{prv[4]}"><small>Previous story</small><b>{prv[5]}</b></a><a href="{nxt[4]}"><small>Next story</small><b>{nxt[5]}</b></a></div></div></section>"""
        layout(href, head + " | Customer stories | Eliana Capital", "A customer story from Eliana Capital: " + head + ".", hero, body)


def build_faqs():
    hero = phero("FAQs", "Straight answers.", "If you do not find yours here, call us or ask for a call back.", variant="knot")
    body = f"""
<section class="sec"><div class="container grid-label"><div><p class="label">Common questions</p></div><div><label class="sr" for="faq-q">Search the questions</label><input class="faq-search" id="faq-q" type="search" placeholder="Search questions, e.g. repay, cost, branch" autocomplete="off">{faq_html(FAQS)}<p class="faq-none" hidden>No match yet. Call us or ask for a call back and we will answer.</p></div></div></section>
<section class="cta sec--green"><canvas data-scene="wave" aria-hidden="true"></canvas><div class="container wrap"><h2>Still wondering?</h2>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#callback">Request a call back</a><a class="btn btn-line" href="https://wa.me/[[WA]]">[[I_WA]]WhatsApp us</a></div></div></section>"""
    layout("faqs.html", "FAQs | Eliana Capital",
           "Answers about Eliana Capital loans: cost, repayment, eligibility, data protection and complaints.", hero, body)


def form_fields(kind):
    name = '<div class="field"><label for="n-{k}">Your name</label><input id="n-{k}" name="name" autocomplete="name" required></div>'
    phone = '<div class="field"><label for="p-{k}">Phone number</label><input id="p-{k}" name="phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="07XX XXX XXX" required></div>'
    branch = '<div class="field"><label for="b-{k}">Nearest branch</label><select id="b-{k}" name="branch"><option>Kawangware</option><option>Utawala</option><option>Thika</option><option>Not sure yet</option></select></div>'
    consent = '<label class="check"><input type="checkbox" required><span>I agree that Eliana Capital may use these details to respond to me. Read the <a href="privacy.html">privacy notice</a>.</span></label>'
    ok = '<div class="form-ok" role="status"><b>Thank you, <span data-name></span>.</b> Your request is in, and a member of our team will be in touch soon.</div>'
    if kind == "callback":
        mid = (name + phone + '<div class="field-row"><div class="field"><label for="t-callback">Best time to call</label><select id="t-callback" name="time"><option>Morning</option><option>Afternoon</option><option>Evening</option></select></div>' + branch + "</div>")
        btn = "Request a call back"
    elif kind == "apply":
        mid = (name + phone + '<div class="field-row"><div class="field"><label for="biz-apply">Your business</label><input id="biz-apply" name="business" placeholder="e.g. vegetable stall"></div>'
               '<div class="field"><label for="amt-apply">How much do you need? <span class="hint">KES 5,000 to 15,000</span></label><input id="amt-apply" name="amount" type="number" min="5000" max="15000" step="500" inputmode="numeric" required></div></div>' + branch)
        btn = "Apply now"
    else:
        mid = (name + phone + branch + '<div class="field"><label for="m-complaint">What happened?</label><textarea id="m-complaint" name="message" required></textarea></div>')
        btn = "Send complaint"
    return (mid + consent + f'<button class="btn btn-blue" type="submit">{btn}</button>' + ok).replace("{k}", kind)


def build_contact():
    hero = phero("Contact us", "Talk to us. We will take it from here.",
                 "Ask for a call back, apply for support, or tell us when we have got something wrong.", variant="globe")
    forms = ""
    for k, intro in [("callback", "Leave your number and a good time to reach out to you. A loan officer will call you."),
                     ("apply", "Tell us about your business and what you need. We will confirm the full price before you accept."),
                     ("complaint", "We are sorry we let you down. Tell us what happened and we will look into it.")]:
        forms += f'<form class="form" id="{k}" role="tabpanel" aria-labelledby="t-{k}-tab" data-form novalidate><p>{intro}</p>{form_fields(k)}</form>'
    tabs = "".join(f'<button type="button" role="tab" id="t-{k}-tab" aria-controls="{k}" aria-selected="false">{t}</button>'
                   for k, t in [("callback", "Request a call back"), ("apply", "Apply now"), ("complaint", "Make a complaint")])
    body = f"""
<section class="sec"><div class="container grid-2 contact-grid">
<div><div class="tabs" role="tablist" aria-label="How can we help?">{tabs}</div>{forms}
</div>
<aside class="contact-card"><h2>Reach us directly</h2><ul>
<li class="cc-row"><a href="tel:[[PHONE]]">[[I_TEL]]<span><small>Call us</small>[[PHONE_D]]</span></a></li>
<li class="cc-row"><a href="https://wa.me/[[WA]]">[[I_WA]]<span><small>Message us on WhatsApp</small>[[PHONE_D]]</span></a></li>
<li class="cc-row"><a href="mailto:[[MAIL]]">[[I_MAIL]]<span><small>Email us</small>[[MAIL]]</span></a></li>
<li class="cc-row"><span class="cc-static">[[I_PIN]]<span><small>Branches</small>Kawangware, Utawala, Thika</span></span></li>
<li class="cc-row"><span class="cc-static">[[I_PIN]]<span><small>Head office</small>Nairobi</span></span></li></ul></aside></div></section>"""
    layout("contact.html", "Contact us | Eliana Capital",
           "Request a call back, apply for support or make a complaint. Reach Eliana Capital by phone, WhatsApp or email.", hero, body)


def build_privacy():
    hero = phero("Privacy notice", "How we look after your information.", "In plain language, so you know what we collect and why.", variant="shield")
    body = """<section class="sec"><div class="container prose">
<h2>What we collect</h2><p>When you ask for a call back, apply or make a complaint, we collect the details you type in, such as your name, phone number, nearest branch and what you need. If you apply, we also verify your identity and check that repayments fit your cash flow.</p>
<h2>Why we collect it</h2><ul><li>To reply to you and handle your request</li><li>To assess your application responsibly</li><li>To meet our legal duties, including KYC and AML/CFT checks</li></ul>
<h2>How we protect it</h2><p>Only authorised staff can see what you send us. We handle your data as carefully as your money.</p>
<h2>Your choices</h2><p>You can ask us what we hold about you, ask us to correct it, or ask us to stop using it where the law allows. Contact us using the details on the <a href="contact.html">contact page</a>.</p>
</div></section>"""
    layout("privacy.html", "Privacy notice | Eliana Capital", "How Eliana Capital collects, uses and protects your information.", hero, body)



def build_terms():
    hero = phero("Terms of use", "The rules for using this website.", "In plain language, so you know where you stand when you use this site.", variant="bars")
    body = """<section class="sec"><div class="container prose">
<h2>About these terms</h2><p>These terms apply when you use this website, which is run by Eliana Capital Limited (&ldquo;Eliana&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;). By using the site you agree to them. If you do not agree, please do not use the site.</p>
<h2>What this website is for</h2><p>The site tells you about Eliana Capital and our Imaarika loan, and lets you ask for a call back, start an application or make a complaint. Information on the site is general. It is not a loan offer, a credit decision or financial advice.</p>
<h2>Loans are separate</h2><p>Any loan we agree to is governed by its own loan agreement, which we explain to you before you accept. We state the fee, interest and penalties up front. If anything on this site differs from your loan agreement, the loan agreement applies.</p>
<h2>Using the site</h2><ul><li>Give us true and complete details when you fill in a form</li><li>Do not misuse the site, try to break into it, or send us anything harmful or unlawful</li><li>Do not copy or reuse our content, logo or photographs without our written permission</li></ul>
<h2>Our content</h2><p>The Eliana name, logo, text and images belong to Eliana Capital Limited or are used with permission. Customer stories are shared only with the customer's consent.</p>
<h2>Links to other sites</h2><p>We may link to other websites, such as WhatsApp or mobile money services. We do not control them and are not responsible for what they say or do.</p>
<h2>Keeping the site available</h2><p>We work to keep the site running and accurate, but we cannot promise it will always be available or free of errors. We may change or remove content at any time.</p>
<h2>Limits on our responsibility</h2><p>To the extent the law allows, we are not responsible for loss caused by relying on general information on this site or by the site being unavailable. Nothing here limits any right you have under Kenyan consumer or data-protection law.</p>
<h2>Your personal information</h2><p>How we handle your details is explained in our <a href="privacy.html">privacy notice</a>.</p>
<h2>Changes and contact</h2><p>We may update these terms and will show the latest version on this page. Questions or complaints? Use the details on the <a href="contact.html">contact page</a>, or <a href="contact.html#complaint">make a complaint</a>.</p>
</div></section>"""
    layout("terms.html", "Terms of use | Eliana Capital", "The terms for using the Eliana Capital website.", hero, body)


def build_accessibility():
    hero = phero("Accessibility statement", "A website everyone can use.", "How we are making this site work for people of all abilities, and how to tell us when it does not.", variant="knot")
    body = """<section class="sec"><div class="container prose">
<h2>Our commitment</h2><p>Eliana Capital wants everyone, including people with visual, hearing, motor or cognitive disabilities, to be able to find out about our loans and ask for support. We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2, level AA.</p>
<h2>What we have built in</h2>
<ul><li><strong>Keyboard use:</strong> every link, button, form field, menu and expanding panel can be used without a mouse, and the item you are on is clearly outlined. A &ldquo;Skip to content&rdquo; link is the first thing on every page.</li>
<li><strong>Screen readers:</strong> pages use headings, landmarks, labelled form fields and descriptive link text. Photos have text descriptions, and purely decorative visuals are hidden from screen readers.</li>
<li><strong>Motion:</strong> if your device is set to &ldquo;reduce motion&rdquo;, we turn off the page transitions, smooth scrolling, 3D scenes, scroll effects and floating animations, and show the content plainly.</li>
<li><strong>Readable text:</strong> text uses relative sizes so it grows when you enlarge your browser or system font, and layouts adapt to small screens and zoom.</li>
<li><strong>Colour and contrast:</strong> we use strong contrast for text, and never rely on colour alone to carry meaning.</li>
<li><strong>Forms:</strong> every field has a visible label, required fields are marked, and errors are shown in words.</li></ul>
<h2>Known limitations</h2>
<ul><li>The animated 3D visuals are decorative. They carry no information, but they can be demanding on older phones. Turning on &ldquo;reduce motion&rdquo; removes them.</li>
<li>Some text over photographs may be harder to read on certain screens. We are reviewing these areas.</li>
<li>We keep testing the site with a keyboard and screen readers as it grows, and we update this page when something changes.</li></ul>
<h2>Other ways to reach us</h2><p>You never have to use the website. You can apply, ask questions or make a complaint by phone, WhatsApp, email, or by visiting any branch (Kawangware, Utawala or Thika). See the <a href="contact.html">contact page</a>.</p>
<h2>Tell us about a problem</h2><p>If something on this site is hard to use, or you need information in a different format, please tell us what happened and what device or assistive technology you use. We will reply as soon as we can. Use the <a href="contact.html">contact page</a>, or <a href="contact.html#complaint">make a complaint</a> if you are not happy with our response.</p>
</div></section>"""
    layout("accessibility.html", "Accessibility statement | Eliana Capital", "How Eliana Capital is making its website accessible, and how to report a problem.", hero, body)


def write_seo_files():
    """robots.txt and sitemap.xml, built from SITE_URL and the pages written in this run."""
    prio = {"index.html": "1.0", "contact.html": "0.9", "services.html": "0.9", "how-it-works.html": "0.8"}
    urls = "".join(
        f"  <url>\n    <loc>{SITE_URL}/{'' if f == 'index.html' else f}</loc>\n    <lastmod>{PAGE_DATE}</lastmod>\n"
        f"    <changefreq>{'weekly' if f == 'index.html' else 'monthly'}</changefreq>\n    <priority>{prio.get(f, '0.6')}</priority>\n  </url>\n"
        for f in WRITTEN)
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as fh:
        fh.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls + "</urlset>\n")
    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8") as fh:
        fh.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n")
    print("wrote sitemap.xml, robots.txt")


if __name__ == "__main__":
    import home2; home2.build(globals()); build_about(); build_services(); build_how(); build_stories(); build_story_pages(); build_faqs(); build_contact(); build_privacy(); build_terms(); build_accessibility()
    write_seo_files()
