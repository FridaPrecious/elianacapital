ELIANA CAPITAL PROTOTYPE
## v36 (phone: Apply now / WhatsApp bar)
- The bar no longer sits on top of the menu: it slides away while the menu is open (the menu already has Apply now at the top and call / WhatsApp / email inside), so "Find us" is fully visible. It comes back when the menu closes.
- The bar now has a small close (x) button at its top right corner. Closing it hides the bar on every page for the rest of that visit (browser tab); it returns on the next visit. Code is at the end of `js/v33.js`, styles at the end of `css/v33.css`.

## v35 (About page: "Why you can trust us" links)
- The four rows were styled with arrows but were not links. Each is now a real link (click anywhere on the row, or Tab to it):
  01 Prices up front goes to the FAQ "What will it cost?" (opens it). 02 Every file checked goes to the FAQ "How fast can I get a decision?" (opens it). 03 Your data, protected goes to the Privacy notice. 04 Complaints heard goes to the Contact page complaint tab.
- FAQ questions can now be linked to directly: `faqs.html#faq-cost` opens that question and scrolls to it (small addition at the end of `js/fx.js`). To add more, give a `<details>` an `id`.

## v34 (mobile menu matches desktop)
- Phones now get the same menu as desktop: numbered rows, a short hint on the right of each, and the same ribbon. With no hover on touch, the ribbon flows in under your finger when you press a row, and the page opens about half a second later so you see it. Scrolling the list or pressing and dragging away cancels it. The small round thumbnails from v33 are gone.
- Phone hints use shorter wording (`HINTS` in `js/v33.js` holds both versions). Row text is slightly smaller on phones so the hints fit.
- Fixed the menu list being wider than the screen on small phones.

## v33 (flowing menu, built on v31)
- Menu is now clean numbered rows. On desktop, hovering a row slides in a ribbon (page name repeated, with a photo) from whichever edge the pointer entered, and slides out the way it leaves. Keyboard users get the same ribbon on focus.
- Rows spring up one after another from the middle when the menu opens; the menu button icon morphs with a springy ease.
- Reduced-motion users get no marquee and no spring.
- Each row has a short hint on the right (desktop). Edit the `PICS` and `HINTS` lists at the top of `js/v33.js` to change photos or wording.
- New files: `css/v33.css`, `js/v33.js`, `assets/vendor/motion.min.js` (Motion 12.43, MIT licence in `assets/vendor/motion-LICENSE.txt`). Linked on every page. Without Motion the plain list still works.
- The v32 decorations (stickers, vine, word mark) are not in this version.

## v31 (home stories fix)
- Home page customer stories strip: the salon card is replaced by the farming couple, Thika (`assets/couple.jpg`, links to `story-farming-couple.html`). Strip is now dressmakers, farming couple, farmers.
- The salon story page and its place on the Customer stories page are unchanged.

## v30 (stories pass)
- Added two customer stories: maize farmers, Kitale (`story-maize-farmers.html`, `assets/maize.jpg`) and a salon owner, Utawala (`story-salon.html`, `assets/salon.jpg`).
- Removed the Utawala roadside seller story (`story-market-seller.html`) from the stories page, home strip, 3D cards and sitemap. `assets/shop.jpg` stays: it is still used by the phone mock-up and the How it works banner.
- Farming couple story is Thika again (was Mumias).
- Contact page call-back form: "Leave your number and a good time to reach out to you."
- Story order: dressmaker, salon, farmers, maize farmers, farming couple, mama mboga (previous/next links follow it).

## v27 (homepage pass)
- Footer: removed the sticky "footer reveal" (js/motion.js + css/v22.css). Footer scrolls normally and stays its own card.
- Numbers: one count-up style (`<span class="num" data-num="30">`), JS in js/v22.js, styles in css/v22.css.
- Loan section: removed the check icons, added the branches stat (7 + HQ).
- "Who you are dealing with": sticky company plate + scroll-linked numbered ledger (`data-plate`, `data-ledger`).
