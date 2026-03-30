<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  },
  displayTime: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "scrub-start", "scrub-end"]);

function onInput(event) {
  emit("update:modelValue", Number(event.target.value));
}
</script>

<template>
  <section class="global-timeline">
    <div class="timeline-head">
      <span>同步時間軸</span>
      <span>{{ displayTime }}</span>
    </div>
    <input
      :value="modelValue"
      type="range"
      min="0"
      :max="max"
      @input="onInput"
      @pointerdown="emit('scrub-start')"
      @pointerup="emit('scrub-end')"
      @pointercancel="emit('scrub-end')"
    />
  </section>
</template>
