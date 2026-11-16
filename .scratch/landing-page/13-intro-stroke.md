# 13 Intro stroke
Status: done
Blocked by: 12

- Once the scene is ready, GSAP moves a virtual brush along one random continuous path built from noise, different on every visit. It goes through the same brush input as the visitor's pointer.
- Lasts 1.2–2 s and spans about 40–70% of the screen's short side. Starts off-centre and may pass near the content.
- The visitor's first pointer move interrupts it straight away.
- Skipped under reduced motion. Never runs during prerender, because it only exists in the browser.

## Comments

- 2026-11-15: Built the intro stroke. On the first run of the moving scene, GSAP moves the brush for 1.2–2 s along a random chord through the screen. The chord spans 40–70% of the short side, starts off-centre and is bent by value noise. Any visitor pointer move or tap stops it and lifts the brush. A switch to reduced motion, a resize or a dispose also stops it. It plays at most once per visit, and GSAP loads lazily with three.js.
  - Files: `app/scene/IntroStrokePath.ts` (new), `app/scene/IntroStrokePlayer.ts` (new), `app/scene/SceneController.ts`, `app/scene/SceneSettings.ts` (`introStroke`), `app/composables/useBackgroundScene.ts`, `test/scene/IntroStrokePath.test.ts` (new), `test/scene/SceneControllerIntroStroke.test.ts` (new), `test/scene/SceneControllerHarness.ts` (new, split out of `SceneController.test.ts`), `CLAUDE.md` folder map.
  - Follow-ups (tuning, owner to check in the browser): ink strength scales with brush speed, so slow random visits (span 0.4 over 2 s) peak at about 0.38 strength and may look faint. The bend (`maxBend` 0.06) may read as nearly straight. Both are set in `SceneSettings.introStroke`.

- 2026-11-15: The owner found the stroke too straight, so `maxBend` went from 0.06 to 0.12. It stays on screen up to about 0.2.
