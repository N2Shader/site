# 18 Dried ink fades on high-refresh screens
Status: todo
Blocked by: none

The paint state (`InkTargets`, `HalfFloatType`) holds deposited ink at half precision. The settle pass fades it by `frameSeconds × maxDeposit / fadeSeconds` each frame. That step can be smaller than half a half-float step, so rounding swallows it:

- Above about 130 Hz (144/165/240 Hz monitors), deposited ink above 1.0 never fades, because 1.4/22/144 ≈ 4.4e-4 is under half the step in [1, 2) (≈ 4.9e-4).
- At 60–120 Hz the fade rounds down in some value ranges and runs about 8–30% slower than `fadeSeconds`.

Since ticket 15, `CleanPaperClock` puts the loop to sleep after the modelled drying + hold + fade time. When the GPU fade runs slow or stalls, the loop sleeps with ink still on the paper.

- Dried ink fades back to clean paper in about `holdSeconds + fadeSeconds` at any refresh rate from 30 to 240 Hz (e.g. fade in fewer, larger steps, or derive the fade from the age instead of subtracting per frame; the age channel has the same precision limit past 16 s).
- `CleanPaperClock`'s bound still holds, so the loop never sleeps on visible ink.

Found by the ticket 15 code review (marked PLAUSIBLE: f32→f16 rounding varies by GPU).
