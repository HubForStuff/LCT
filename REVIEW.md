Original: https://docs.google.com/document/d/1naXlqnVwvp4UGQNlkC9ZG--vvNFKslBvKw-_ylT1nNQ/edit?pli=1&tab=t.0

NOTE: all missing items are already solved, and dont need to be covered at the moment. Competed Items were already fixed and should be marked as fixed only after validation and review. For Developed items use `[-]`.


# Landing Page

 - [x] 5. Size is good but we need to check how we can make the submenu editable in keystatic
 
 
# Challenges & Competitions (internal pages)

- [x] 18. Remove transparency from the submenu in the internal pages
- [ ] 19. pending subitems. Need clarification, not ready to work on.
  - [ ] c. TODO: what is the desired result? 
  - [ ] d. Cohort 8 etc, this kind of content is it static or should be completely updated via backend? Is this a competition or challege? a new type? do we have empty case (no active link). Clicking on Apply Now goes where? What is the subsequent flow here?
  - [ ] e. Where does "Partner with us" lead? email link (like footer?)
- [x] 20. status and foucs items needs to match the color, status and size to the mockup here  mockup/3%20-%20Challenges___Competitions_v7.htm, also only changes color on mouse hover. (Reviewed as not done)
  - 2026-04-26 note: Fixed/verified against `mockup/3 - Challenges___Competitions_v7.htm`; filter bar now uses the mockup gap, pill sizing, icon opacity, active state, and hover-only treatment. Covered by browser typography/filter assertions and screenshots.
  - 2026-04-26 follow-up: The controls still rendered too tall because Tailwind's inherited `line-height: 1.5` made pills 39px high. Filter pills now pin `line-height: normal`, matching the mockup's 34px rendered height.
- [x] 21. Open For Applications on top needs a red circle on the left (same mockup as 20.) (Reviewed as not done)
  - 2026-04-26 note: Verified the localized eyebrow renders the red dot at the left of the label on `/competitions/`.
- [x] 22. Tabs under status and focus have a bigger font and bold (mockup as reference, same as 20.) (Reviewed as not done)
  - 2026-04-26 note: Fixed the inherited form-control reset that was overriding rendered tab/filter/select typography; browser assertion now verifies tabs at `26px` / `800`.
- [x] 23. Startup competitions tab, FEATURED COMPETITION pill needs a star on the left of FEATURED text
- [x] 24. Same as 23 but blue start inside FEATURED CHALLENGE
- [x] 25. The button VIEW CHALLENGE in the both  tabs should have white text, and should be written "Apply Now". remove the all caps in the featured cars for both tabs
- [x] 26. Sort dropdown menu is too big and not working (Review: Working but not styled as it should)
  - 2026-04-26 note: Sort dropdown remains functional and now uses the compact mockup pill treatment; CSS specificity was raised so the rendered select stays at `13px`.
- [x] 25.1 For featured card, Market Access text should be ajudsted to match mockup (see 20. mockup) (Review: mockups text is 22px and current is 28px)
  - 2026-04-26 note: Verified non-numeric featured values such as `Market Access` render with the compact `22px` style while numeric prize values keep the larger treatment.
- [x] 25.2 MORE COMING Q4 2025 should be configurable text, and the style should be like the mockuo (check 20. mockup)
- [x] 25.3 Lets create some mockup data for future competitions to check style and functionality, look into all possible status and focus and make sure we have data for everything (Review: Some data is still missing, please check the filter and split and add more data including status and focus)
  - 2026-04-26 note: Added localized `[TEST DATA]` competition entries so startup and corporate tabs cover every status and focus filter. Academic intentionally remains empty because the mockup shows the Academic Innovation tab empty.
- [x] 27. Remove the bold style from the title of featured cars in both tabs
- [x] 28. featured cards bottom part has "Open Now"  "Closes - Sep 30, 2025" and "Apply" button, they are overlapping each other. Check mocup (same as 20.) for style and desired effect reference. Consider different languages and find ways to avoid component overlapping. (Review: It is much better but it should have equal spacing between items)
  - 2026-04-26 note: Featured footer now uses a single-row `space-between` layout with no CTA auto-push, plus a responsive wrap only for narrow screens/languages.
- [x] 29. Each status has a different style and a different left icon. Follow the original comments in the google docs and the mockup (same as 20.) 
- [x] 30. Change the text to white font. Details look into original google docs and mockup. (Review: Startup tab Apply now in non-featured cards have black text and should be white text)
  - 2026-04-26 note: Verified non-featured startup/corporate card CTA text renders white across link states.
- [x] 31. Like 29, each card has a different focus style and icon. Follow original document and mockup. (Review: Top focus filter is displaying correctly but card icon is not displayed correctly. Should use the same icon and color as the focus )
  - 2026-04-26 note: Fixed card category icons to use the mockup's 12px card icon set and card-specific colors instead of reusing the filter SVGs. Added regression coverage for FinTech, AI, Logistics, BioTech, Manufacturing, and HealthTech colors.
- [x] 32. Change "MORE COMING Q3 2025" text to "More Coming Q2 2026" and change size (follows the mockup in 20.)
- [x] 34. Footer should be with white background in the internal pages and have similar size and styles for all elements. Some extra details above
   - 2026-04-26 note: Interior footer now uses the white/black mockup treatment, red buttons with white text, mockup hero/newsletter/social sizing, divider, light WeChat popup, and footer language menu alignment.
   - 2026-04-26 follow-up: Footer language dropdown now opens upward so it does not collide with the bottom gradient stripe. Header language dropdown gap was tightened so the menu sits directly under the globe trigger.
   - 2026-04-26 follow-up: Footer hero `View Programs` CTA now forces white text across link states, matching the mockup red button.
   - [x] 34.1. In both main page and internal pages footer newsletter label should be left aligned with Your Email input text, Subscribe on Substack round corners radius the same as the input text, social icons style should be the same in both and also left aligned with the Your email input text
   - [x] 34.2 - Language switcher in the footer should not display the selected language 
   - [x] 34.3 - footer links for socials and substack:  https://substack.com/@latamchinatech https://www.linkedin.com/company/30947367 https://www.instagram.com/andrequeme
- [x] 34. Footer content, aligment, elements, text should be exactly like the main page, internal pages should have white background and black text. buttons also respect the "white" style in the internal pages, Everything else is exactly like the home page
  - 2026-04-26 note: Verified footer parity on `/competitions/` and homepage language switching; screenshots captured for the interior footer and homepage localized state.

# Static pages:

- [ ] Create all the missing static pages linked in the home page and submenus. All of these pages content will be maanged using keystatic


# Submenus

- [x] Challenges and competitions in the right side of the menu should display latest highlighted from startup competitions on the left and one corporate challenges instead of static.
- [ ]
