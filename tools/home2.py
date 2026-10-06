"""Eliana Capital home page, v15.

A trust-first home page. One idea per section, every message appears once:
  1 hero         real photo + logo only; the phone pops out of the photo
  2 intro        who we are, the three numbers that matter
  3 care         the six assurances as callouts around the phone, over a real photo
  4 loan         the price in plain words
  5 steps        five steps from first call to mobile money
  6 promises     four promises, with the people who keep them
  7 stories      real customers (the only place customer photos appear)
  8 find us      branches, contact, short FAQ
  9 cta          ready when you are

Called from tools/build.py: home2.build(globals()).
"""


def build(G):
    layout, faq_html, FAQS = G["layout"], G["faq_html"], G["FAQS"]
    ICONS, FEATURES = G["ICONS"], G["FEATURES"]
    PANELS, PANEL_IMG, STORIES = G["PANELS"], G["PANEL_IMG"], G["STORIES"]

    hero = """<section class="h-hero" id="top" data-rail="Welcome">
<div class="h-hero-bg"><div class="h-sky">
<picture><source media="(max-width:760px)" srcset="assets/hero-nosun-m.jpg"><img src="assets/hero-nosun.jpg" alt="Sunrise over the Nairobi skyline" width="2160" height="1620" fetchpriority="high" decoding="async"></picture>
<div class="sk sk-night" aria-hidden="true"></div>
<div class="sk sk-haze" aria-hidden="true"></div>
<div class="sk sk-bloom" aria-hidden="true"></div>
<div class="sk sk-sun" aria-hidden="true"><i class="sk-rays"></i><i class="sk-halo"></i><i class="sk-disc"></i></div>
<canvas class="sk-dust" aria-hidden="true"></canvas>
</div></div>
<div class="h-hero-brand"><h1 class="sr">Eliana Capital: credit that empowers, never traps</h1>
<span class="h-logo-wrap"><img class="h-logo" src="assets/logo-color.svg" alt="Eliana Capital" width="500" height="172"><img class="h-logo h-logo--w" src="assets/logo-white.svg" alt="" width="500" height="172" aria-hidden="true"></span></div>
<div class="h-slot h-slot--hero" data-phone="hero" data-avoid=".h-logo-wrap" data-screen="0" data-yaw="-14" aria-hidden="true"></div>
<a class="h-cue" href="#intro" aria-label="Scroll to read more"><i></i></a>
</section>"""

    # ---- intro ----
    intro = """<section class="h-sec h-intro" id="intro" data-rail="Who we are"><div class="container h-split">
<div class="h-slot h-slot--side" data-phone="intro" data-screen="0" data-yaw="16" aria-hidden="true"></div>
<div class="h-copy">
<p class="label">Who we are</p>
<h2 class="h-display h-display--xl" data-split>Credit should <em>empower</em>, never trap.</h2>
<p class="h-lead" data-scrub>Eliana Capital is a female-owned, female-run Kenyan microfinance lender. We pair digital speed with local relationships and disciplined credit, so people can act on opportunity, build resilient businesses and grow with dignity.</p>
<dl class="h-facts">
<div><dt>You can borrow</dt><dd>KES <span data-count="5000">5,000</span> to <span data-count="15000">15,000</span></dd></div>
<div><dt>You repay over</dt><dd>up to <span data-count="30">30</span> days, daily</dd></div>
<div><dt>You hear back in</dt><dd><span data-count="2">2</span> hours <small>on a complete application</small></dd></div>
</dl>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply for support</a><a class="btn btn-line" href="about.html">About us</a></div>
</div></div></section>"""

    # ---- care: six assurances as callouts around the phone ----
    def call(i, cls):
        k, t, d = FEATURES[i]
        return (f'<li class="h-call {cls}" style="--n:{i}"><span class="ico" aria-hidden="true"><svg viewBox="0 0 24 24">{ICONS[k]}</svg></span>'
                f'<div><b>{t}</b><small>{d}</small></div></li>')
    care = f"""<section class="h-feature" id="care" data-rail="Why Eliana">
<div class="h-feature-bg" aria-hidden="true"><img src="assets/tailor.jpg" alt="" loading="lazy"></div><div class="h-feature-shade" aria-hidden="true"></div>
<div class="container">
<div class="h-feature-head"><p class="label">Why Eliana</p><h2 class="h-display" data-split>A <em>fair deal</em>, explained before you say yes.</h2></div>
<div class="h-stage">
<ul class="h-calls h-calls--l">{call(0,'l1')}{call(1,'l2')}{call(2,'l3')}</ul>
<div class="h-slot h-slot--stage" data-phone="stage" data-screen="1" data-yaw="-8" aria-hidden="true"></div>
<ul class="h-calls h-calls--r">{call(3,'r1')}{call(4,'r2')}{call(5,'r3')}</ul>
</div></div></section>"""

    # ---- the loan, priced in plain words ----
    loan = """<section class="h-sec h-loan" id="price" data-rail="Pricing"><div class="container h-split h-split--flip">
<div class="h-copy">
<p class="label">The Imaarika loan</p>
<h2 class="h-display h-display--xl" data-split>One loan. Priced in <em>plain words</em>.</h2>
<p class="h-lead">Working capital for stock, supplies or a short gap in cash flow. We state the fee, the interest and any penalties up front. If a number is not on your agreement, we do not charge it.</p>
<div class="h-receipt" role="table" aria-label="Imaarika loan price">
<div role="row"><span>Loan size</span><b>KES 5,000 to 15,000</b></div>
<div role="row"><span>Repay over</span><b>Up to 30 days, daily</b></div>
<div role="row"><span>Processing fee</span><b>KES 500</b></div>
<div role="row"><span>Interest</span><b>27%</b></div>
<div role="row"><span>Penalties</span><b>Stated first</b></div>
<div role="row" class="good"><span>Hidden charges</span><b>None</b></div>
<p>Repay early? No punitive charge, and faster access next time.</p>
</div>
<div class="btn-row"><a class="btn btn-blue" href="contact.html#apply">Apply for support</a><a class="btn btn-line" href="faqs.html">Read the FAQs</a></div>
</div>
<div class="h-slot h-slot--side" data-phone="loan" data-screen="2" data-yaw="-16" aria-hidden="true"></div>
</div></section>"""

    # ---- five steps ----
    steps = [
        ("Talk to us", "Call, send a WhatsApp message, or ask for a call back. Tell us about your business and how much you need."),
        ("Apply", "Share a few details about you and your business, online or with a loan officer. Have your identification ready."),
        ("We check", "We verify who you are and make sure repayments fit your cash flow. We stay quick, but we never skip these checks."),
        ("See the full price, then decide", "The processing fee, interest and any penalties are shown before you accept. If it does not feel right, you can say no."),
        ("Receive and repay", "Your loan arrives by mobile money. Repay daily over up to 30 days, or pay early with no punitive charge."),
    ]
    lis = "".join(f'<li><span class="n" aria-hidden="true"></span><h3>{t}</h3><p>{d}</p></li>' for i, (t, d) in enumerate(steps))
    how = f"""<section class="h-sec h-steps" id="how" data-rail="How it works"><div class="container">
<div class="h-head"><p class="label">How it works</p><h2 class="h-display" data-split>From first call to mobile money in <em>five clear steps</em>.</h2></div>
<ol class="h-steps-list">{lis}</ol>
<div class="btn-row"><a class="btn btn-line" href="how-it-works.html">The full process</a></div>
</div></section>"""

    # ---- four promises: a stack of cards that slide over each other ----
    ART = {
        "p1": '<path d="M32 6 52 14v16c0 13-8.5 23-20 28C20.5 53 12 43 12 30V14z"/><path d="m22 32 8 8 14-16"/>',
        "p2": '<path d="M32 54S10 40 10 25a12 12 0 0 1 22-6 12 12 0 0 1 22 6c0 15-22 29-22 29z"/>',
        "p3": '<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="14"/><circle cx="32" cy="32" r="4"/><path d="M32 32 54 10M44 10h10v10"/>',
        "p4": '<path d="M32 56V30"/><path d="M32 34C32 22 22 16 10 16c0 12 8 18 22 18z"/><path d="M32 28C32 18 40 10 54 10c0 12-8 18-22 18"/>',
    }
    TAGS = {"p1": ("Accuracy", "Checked before it moves"), "p2": ("Respect", "No hidden charges, ever"),
            "p3": ("Ownership", "Targets known daily"), "p4": ("Growth", "Feedback is a tool")}
    cards = ""
    for k, (c, t, b2) in enumerate(PANELS, 1):
        f, alt, pos = PANEL_IMG[c]
        tag, chip = TAGS[c]
        cards += (f'<li class="hp-card" style="--i:{k - 1}"><div class="hp-in">'
                  f'<div class="hp-copy"><span class="hp-tag">{tag}</span>'
                  f'<h3>{t}</h3><p>{b2}</p></div>'
                  f'<figure class="hp-fig"><img src="assets/{f}" alt="{alt}" loading="lazy" style="object-position:{pos}"><span class="hp-chip"><i></i>{chip}</span></figure>'
                  f'</div></li>')
    promises = f"""<section class="h-sec h-promises" id="values" data-rail="How we work">
<div class="hp-bg" aria-hidden="true"><i class="a1"></i><i class="a2"></i><i class="a3"></i><b class="grain"></b></div>
<div class="container">
<div class="hp-head"><div><p class="label">How we work</p><h2 class="h-display" data-split>Four <em>promises</em> our whole team keeps.</h2></div>
<div class="hp-badge" aria-hidden="true"><svg viewBox="0 0 200 200"><defs><path id="hpc" d="M100 100m-80 0a80 80 0 1 1 160 0a80 80 0 1 1-160 0"/></defs><text><textPath href="#hpc" textLength="498" lengthAdjust="spacing">We grow together &#183; We grow together &#183; </textPath></text></svg><img src="assets/logo-mark-white.svg" alt=""></div></div>
<ol class="hp-stack">{cards}</ol>
</div></section>"""

    # ---- stories: panels that open as you point at them ----
    sc = ""
    for k, (src, alt, pos, who, href, head, branch, tag) in enumerate(STORIES):
        sc += (f'<li class="hs-item{" on" if k == 0 else ""}" style="--k:{k}"><a class="h-story" href="{href}" data-cursor="view">'
               f'<figure><img src="assets/{src}" alt="{alt}" loading="lazy" style="object-position:{pos}"></figure>'
               f'<span class="hs-vert" aria-hidden="true">{who}</span>'
               f'<div class="hs-body"><p class="meta">{who}, {branch}</p><h3>{head}</h3><span class="hs-more">Read story <i>&rarr;</i></span></div>'
               f'<span class="hs-bar" aria-hidden="true"></span></a></li>')
    stories = f"""<section class="h-sec h-stories" id="stories" data-rail="Customer stories"><div class="container">
<div class="h-head h-head--row"><div><p class="label">Customer stories</p><h2 class="h-display" data-split>Real people. <em>Real businesses.</em></h2></div>
<a class="btn btn-line" href="customer-stories.html">All stories</a></div>
<ul class="h-story-list hs">{sc}</ul>
<p class="h-note">We share a story only with the customer's consent.</p>
</div></section>"""

    # ---- find us and questions ----
    find = f"""<section class="h-sec h-find" id="branches" data-rail="Find us"><div class="container h-find-grid">
<div class="h-find-left"><p class="label">Find us</p><h2 class="h-display" data-split>Local officers who <em>know your market</em>.</h2>
<ul class="h-branches"><li><b>Kawangware</b><span>Branch</span></li><li><b>Utawala</b><span>Branch</span></li><li><b>Thika</b><span>Branch</span></li><li><b>Nairobi</b><span>Head office</span></li></ul>
<p class="h-reach"><a href="tel:[[PHONE]]">[[I_TEL]]<span>[[PHONE_D]]</span></a><a href="https://wa.me/[[WA]]">[[I_WA]]<span>WhatsApp</span></a><a href="mailto:[[MAIL]]">[[I_MAIL]]<span>[[MAIL]]</span></a></p></div>
<div class="h-find-right" id="faq"><h3 class="h-sub">Short answers to what people ask first</h3>{faq_html(FAQS[:5])}
<p style="margin-top:1.4rem"><a class="btn btn-line" href="faqs.html">All questions</a></p></div>
</div></section>"""

    cta = """<section class="h-cta" id="apply-now"><div class="container h-cta-grid">
<div class="h-cta-copy"><h2 class="h-display h-display--xxl" data-split>Ready when <em>you are.</em></h2><p>Tell us about your business. We will take it from there.</p>
<div class="btn-row"><a class="btn btn-green" href="contact.html#apply">Apply for support</a><a class="btn btn-ghost" href="contact.html#callback">Request a call back</a></div></div>
<div class="h-slot h-slot--cta" data-phone="cta" data-screen="2" data-yaw="12" aria-hidden="true"></div>
</div></section>"""

    body = "\n".join([intro, care, loan, how, promises, stories, find, cta])
    layout("index.html", "Eliana Capital | Credit that empowers, never traps",
           "Eliana Capital is a Kenyan digital microfinance lender offering responsible working-capital loans of KES 5,000 to 15,000 with prices shown up front.",
           hero, body, gl=True, home=True)
