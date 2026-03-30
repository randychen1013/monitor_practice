<script setup>
import CameraPlayer from "./CameraPlayer.vue";
import FloorMapTile from "./FloorMapTile.vue";

defineProps({
  mode: {
    type: String,
    required: true,
  },
  cameraItems: {
    type: Array,
    required: true,
  },
  cameraSources: {
    type: Object,
    required: true,
  },
  cameraStatusText: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["register-video", "video-loaded", "video-error"]);
</script>

<template>
  <div class="grid-nine">
    <template v-for="item in cameraItems" :key="item.key">
      <FloorMapTile v-if="item.type === 'map'" />
      <CameraPlayer
        v-else
        :camera-id="item.cameraId"
        :mode="mode"
        :source-url="cameraSources[item.cameraId] || ''"
        :status-text="cameraStatusText[item.cameraId] || ''"
        @register-video="emit('register-video', $event)"
        @loaded="emit('video-loaded', $event)"
        @error="emit('video-error', $event)"
      />
    </template>
  </div>
</template>
