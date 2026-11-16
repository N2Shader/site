/**
 * Tuning constants for the background scene, including every ink simulation constant (ticket 12). In dev, the tuning
 * panel (`#debug`, ticket 17) edits the brush, introStroke, flow, ink and look groups in place, so code must read them
 * when it uses them, not copy them once. Shader code reads them through `SettingsUniforms`.
 */
export const SceneSettings = {
  /** Neutral off-white paper. Must match `--paper` in tokens.css (the fallback backdrop). */
  paperColor: '#f4f2ee',
  maxPixelRatio: 2,
  resizeDebounceMs: 200,
  /** Longest wait for the browser to go idle before the scene loads anyway. */
  idleTimeoutMs: 2000,

  /** Grids the simulation runs on. Sizes are relative to the viewport in CSS pixels. */
  grid: {
    /** The water flow grid runs at half the paint grid's resolution. */
    flowScale: 0.5,
  },

  /**
   * The two quality tiers (ticket 15). A device gets the high tier when it has a fine pointer and at least these cores
   * and this much memory. A value the browser doesn't report doesn't count against it.
   */
  highTier: {
    minCores: 8,
    minMemoryGb: 8,
  },
  quality: {
    high: {
      /** Paint grid cells per CSS pixel. */
      paintCellsPerPixel: 1,
      /** Longest side of the paint grid, so huge screens don't blow the fill budget. */
      maxPaintCells: 1600,
      /** Jacobi pressure iterations per frame. */
      pressureIterations: 20,
      /** Sideways soak iterations per frame. */
      spreadIterations: 4,
    },
    low: {
      paintCellsPerPixel: 0.5,
      maxPaintCells: 800,
      pressureIterations: 10,
      spreadIterations: 2,
    },
  },

  /** Simulated seconds added on top of the worked-out drying and fading time before the paper counts as clean. */
  cleanPaperMarginSeconds: 1,

  /** Frame time limits in seconds, so a dropped frame never makes the simulation jump. */
  minFrameSeconds: 1 / 240,
  maxFrameSeconds: 1 / 30,

  brush: {
    /** Brush radius as a share of the screen's short side (the brush is about 4% wide). */
    radiusOfShortSide: 0.02,
    /** Speed, in short sides per second, at which the brush lays its full ink. */
    fullInkSpeed: 1.2,
    /** Below this speed, in short sides per second, the brush lays nothing. */
    restSpeed: 0.02,
    /** Load spent per short side travelled at full speed. Long, fast strokes run dry. */
    drainPerShortSide: 0.45,
    /** Share of the drain that slow strokes still pay. */
    slowDrainShare: 0.3,
    /** Seconds at rest for an empty brush to refill. */
    refillSeconds: 0.8,
    /** Water and floating ink a full-strength brush lays per frame. */
    water: 0.55,
    ink: 0.5,
    /** How much the brush pushes the water along its path, and the share of its speed the water picks up. */
    velocityInjection: 0.6,
    velocityShare: 0.3,
    /** Edge raggedness and splay, as a share of the radius. */
    raggedness: 0.35,
    splay: 0.25,
    /** Load below which the bristles start to leave dry-brush gaps. */
    dryLoad: 0.55,
  },

  /** The one random stroke that paints itself on load (ticket 13). Lengths are shares of the screen's short side. */
  introStroke: {
    minSeconds: 1.2,
    maxSeconds: 2,
    /** Distance from the stroke's start to its end. */
    minSpan: 0.4,
    maxSpan: 0.7,
    /** Most the stroke's middle sits away from the screen centre. */
    maxCentreOffset: 0.06,
    /** Most the noise bends the stroke away from its straight line. Keep under about 0.2, or it can leave the screen. */
    maxBend: 0.12,
    /** Random knots the bend noise passes through, and points sampled along the path. */
    bendKnots: 4,
    samples: 120,
    /** GSAP ease for the brush moving along the path: a hand speeding up and slowing down. */
    ease: 'power1.inOut',
  },

  flow: {
    /** Vorticity confinement strength: keeps small swirls alive. */
    vorticity: 18,
    /** Share of velocity lost per second to the paper's friction. */
    frictionPerSecond: 2.5,
    /** Water at which the paper counts as fully wet for the flow. */
    wetWater: 0.08,
  },

  ink: {
    /** Soak rate between neighbouring cells, scaled by permeability. Keep under 0.25 for stability. */
    spreadRate: 0.2,
    /** Water below this counts as dry paper. */
    dryWater: 0.004,
    /** A wet edge only creeps into dry paper when the water behind it is above this (pinning). */
    pinWater: 0.12,
    /** Water lost per second to evaporation, plus a share of what's left. */
    evaporationPerSecond: 0.035,
    evaporationShare: 0.25,
    /** Share of floating ink that settles into the paper per second. */
    depositPerSecond: 0.5,
    /** Extra deposit in the paper's low spots (granulation) and at wet edges (dark edges). */
    granulation: 0.8,
    edgeDarkening: 2.5,
    /** Dried ink holds this long, then fades back to clean paper by about 30 s. */
    holdSeconds: 8,
    fadeSeconds: 22,
    /** Most deposited ink a cell holds. */
    maxDeposit: 1.4,
  },

  look: {
    /** Kubelka-Munk absorption at full ink density, and the curve that spreads thin ink over the greys. */
    inkAbsorption: 6,
    inkToneExponent: 2,
    /** Weight of still-floating ink in the drawn density. */
    floatingInkWeight: 0.8,
    /** Paper lighting from its height, and the tint of its mottle. */
    relief: 0.15,
    mottle: 0.035,
    /** Sheen on wet ink. */
    wetSheen: 0.12,
    /** Faint darkening at the corners. */
    vignette: 0.06,
    /** Fixed film grain on top. */
    grain: 0.018,
  },
} as const
