# 15 Idle sleep and quality tiers
Status: todo
Blocked by: 12

- The frame loop sleeps when the sheet is clean (no wet ink, all dried ink faded) and the pointer is idle, and while the tab is hidden. It wakes on the next pointer move or when the tab becomes visible again.
- Two quality tiers. High: fine pointer and at least 8 cores and 8 GB of memory (where the browser reports them). Low: everything else, with a coarser paint grid and fewer spread and pressure iterations.
- The low tier holds a steady frame rate on a mid-range phone.
