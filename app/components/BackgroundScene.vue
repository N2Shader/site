<script setup lang="ts">
// The background scene (ADR-0001, ADR-0008): decorative only, never holds content.
// The wrapper is the fallback backdrop: plain paper until the scene fades in, or for good if it can't run.
const canvas = ref<HTMLCanvasElement | null>(null)
const sceneState = useBackgroundScene(canvas)
const isSceneShown = computed(() => sceneState.value === 'running' || sceneState.value === 'still')
// The content layer reads the state from <html> to blend only over the running background scene (ADR-0009, base.css).
// The prerendered HTML ships `pending`, so text starts as plain dark text.
useHead({ htmlAttrs: { 'data-background-scene': sceneState } })
</script>

<template>
  <div
    class="background-scene"
    aria-hidden="true"
  >
    <canvas
      ref="canvas"
      class="background-scene__canvas"
      :class="{ 'background-scene__canvas--shown': isSceneShown }"
    />
  </div>
</template>

<style scoped>
.background-scene {
  position: fixed;
  inset: 0;
  z-index: -1;
  background-color: var(--paper);
  pointer-events: none;
}

.background-scene__canvas {
  display: block;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 600ms ease-out;
}

.background-scene__canvas--shown {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  .background-scene__canvas {
    transition: none;
  }
}
</style>
