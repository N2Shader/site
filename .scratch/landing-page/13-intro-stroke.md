# 13 Intro stroke
Status: todo
Blocked by: 12

- Once the scene is ready, GSAP moves a virtual brush along one random continuous path built from noise, different on every visit. It goes through the same brush input as the visitor's pointer.
- Lasts 1.2–2 s and spans about 40–70% of the screen's short side. Starts off-centre and may pass near the content.
- The visitor's first pointer move interrupts it straight away.
- Skipped under reduced motion. Never runs during prerender, because it only exists in the browser.
