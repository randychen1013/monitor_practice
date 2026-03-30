<script setup>
import { onBeforeUnmount, ref, watch } from "vue";

const props = defineProps({
  cameraId: {
    type: Number,
    required: true,
  },
  mode: {
    type: String,
    required: true,
  },
  sourceUrl: {
    type: String,
    required: true,
  },
  statusText: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["register-video", "loaded", "error"]);
const videoRef = ref(null);

watch(
  () => videoRef.value,
  (el) => {
    emit("register-video", { cameraId: props.cameraId, element: el || null });
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  emit("register-video", { cameraId: props.cameraId, element: null });
});
</script>

<template>
  <article class="tile camera-tile">
    <div v-if="mode === 'playback'" class="video-wrap">
      <video
        ref="videoRef"
        :src="sourceUrl"
        muted
        playsinline
        preload="metadata"
        @loadedmetadata="emit('loaded', cameraId)"
        @error="emit('error', cameraId)"
      ></video>
      <div v-if="statusText" class="overlay">{{ statusText }}</div>
    </div>

    <div v-else class="live-stub">
      <strong>LIVE CAM {{ cameraId }}</strong>
      <p>等待串流連線</p>
    </div>
  </article>
</template>
