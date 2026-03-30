<script setup>
import { computed, onBeforeUnmount, reactive, ref, watch } from "vue";
import ControlPanel from "./components/ControlPanel.vue";
import VideoGrid from "./components/VideoGrid.vue";
import { useVideoSync } from "./composables/useVideoSync";
import { normalizeRoot, VIDEO_CONFIG } from "./config/video";
import { findLocalVideoExact } from "./services/localVideoCatalog";
import {
  floorToFiveMinute,
  formatDisplay,
  parseDatetimeLocal,
  SEGMENT_SECONDS,
  toDatetimeLocalNow,
  toFilenameTimestamp,
} from "./utils/datetime";

const CAMERA_IDS = [21, 22, 23, 24, 25, 26, 27, 28];
const GRID_ITEMS = [
  { key: "21", type: "camera", cameraId: 21 },
  { key: "22", type: "camera", cameraId: 22 },
  { key: "23", type: "camera", cameraId: 23 },
  { key: "24", type: "camera", cameraId: 24 },
  { key: "25", type: "camera", cameraId: 25 },
  { key: "26", type: "camera", cameraId: 26 },
  { key: "map", type: "map" },
  { key: "27", type: "camera", cameraId: 27 },
  { key: "28", type: "camera", cameraId: 28 },
];

const mode = ref("playback");
const nowDateTime = toDatetimeLocalNow(5);
const [initialDate, initialTime] = nowDateTime.split("T");
const [initialHour, initialMinute] = initialTime.split(":").map(Number);
const selectedDate = ref(initialDate);
const selectedHour = ref(Number.isFinite(initialHour) ? initialHour : 0);
const selectedMinute = ref(Number.isFinite(initialMinute) ? initialMinute : 0);
const serverBaseUrl = ref("");
const playbackRate = ref(1);
const globalSecond = ref(0);
const isPlaying = ref(false);
const isScrubbing = ref(false);

const cameraSources = reactive({});
const cameraStatusText = reactive({});

CAMERA_IDS.forEach((id) => {
  cameraSources[id] = "";
  cameraStatusText[id] = "";
});

const { registerVideo, syncAll, setPlaybackRate, pauseAll, playAll } =
  useVideoSync();

let tickerId = 0;
let lastTickMs = 0;

const selectedDateTime = computed(() => {
  const date = selectedDate.value || initialDate;
  const hourText = String(selectedHour.value).padStart(2, "0");
  const minuteText = String(selectedMinute.value).padStart(2, "0");
  return `${date}T${hourText}:${minuteText}`;
});

const segmentStart = computed(() =>
  floorToFiveMinute(parseDatetimeLocal(selectedDateTime.value)),
);
const globalDisplayTime = computed(() => {
  const time = new Date(
    segmentStart.value.getTime() + globalSecond.value * 1000,
  );
  return formatDisplay(time);
});

function buildPlaybackUrl(cameraId, time) {
  const base = serverBaseUrl.value.trim().replace(/\/$/, "");
  const stamp = toFilenameTimestamp(time);
  if (base) {
    return `${base}/${cameraId}/${stamp}.webm`;
  }
  const localRoot = normalizeRoot(VIDEO_CONFIG.localVideoRoot);
  return localRoot === "/"
    ? `/${cameraId}/${stamp}.webm`
    : `${localRoot}/${cameraId}/${stamp}.webm`;
}

function refreshPlaybackSources() {
  const hasRemoteBase = Boolean(serverBaseUrl.value.trim());
  const segmentTime = segmentStart.value;

  CAMERA_IDS.forEach((id) => {
    const previousSource = cameraSources[id];

    if (hasRemoteBase) {
      const nextSource = buildPlaybackUrl(id, segmentTime);
      cameraSources[id] = nextSource;
      cameraStatusText[id] = previousSource !== nextSource ? "載入中" : "";
      return;
    }

    const localVideo = findLocalVideoExact(id, segmentTime);
    if (!localVideo) {
      cameraSources[id] = "";
      cameraStatusText[id] = "無資料";
      return;
    }

    cameraSources[id] = localVideo.url;
    cameraStatusText[id] = previousSource !== localVideo.url ? "載入中" : "";
  });
}

function applyDateTimeFilter() {
  globalSecond.value = 0;
  isPlaying.value = false;
  refreshPlaybackSources();
  syncAll(0, true);
}

function togglePlay() {
  if (mode.value !== "playback") return;
  isPlaying.value = !isPlaying.value;
}

function seek(delta) {
  const next = Math.max(
    0,
    Math.min(SEGMENT_SECONDS - 0.05, globalSecond.value + delta),
  );
  globalSecond.value = next;
  syncAll(next, true);
}

function onTimelineInput(value) {
  globalSecond.value = Math.max(0, Math.min(SEGMENT_SECONDS - 0.05, value));
  syncAll(globalSecond.value, true);
}

function onScrubStart() {
  isScrubbing.value = true;
  pauseAll();
}

function onScrubEnd() {
  isScrubbing.value = false;
  syncAll(globalSecond.value, true);
  if (isPlaying.value && mode.value === "playback") {
    playAll();
  }
}

function setMode(nextMode) {
  mode.value = nextMode;
  isPlaying.value = false;
  pauseAll();
}

function onVideoLoaded(cameraId) {
  cameraStatusText[cameraId] = "";
  setPlaybackRate(playbackRate.value);
  syncAll(globalSecond.value, true);
  if (isPlaying.value && mode.value === "playback" && !isScrubbing.value) {
    playAll();
  }
}

function onVideoError(cameraId) {
  cameraStatusText[cameraId] = "無資料";
}

function tick(now) {
  if (!isPlaying.value || mode.value !== "playback" || isScrubbing.value) {
    lastTickMs = now;
    tickerId = requestAnimationFrame(tick);
    return;
  }

  if (lastTickMs === 0) {
    lastTickMs = now;
  }

  const elapsed = ((now - lastTickMs) / 1000) * playbackRate.value;
  const next = Math.min(SEGMENT_SECONDS - 0.05, globalSecond.value + elapsed);
  globalSecond.value = next;
  syncAll(next);
  if (next >= SEGMENT_SECONDS - 0.05) {
    isPlaying.value = false;
    pauseAll();
  }

  lastTickMs = now;
  tickerId = requestAnimationFrame(tick);
}

watch(
  () => playbackRate.value,
  (rate) => {
    setPlaybackRate(rate);
  },
);

watch(
  () => isPlaying.value,
  (playing) => {
    if (playing && mode.value === "playback" && !isScrubbing.value) {
      playAll();
    } else {
      pauseAll();
    }
  },
);

watch(
  () => mode.value,
  (next) => {
    if (next === "playback") {
      applyDateTimeFilter();
    }
  },
);

applyDateTimeFilter();
tickerId = requestAnimationFrame(tick);

onBeforeUnmount(() => {
  if (tickerId) cancelAnimationFrame(tickerId);
});
</script>

<template>
  <div class="app-shell">
    <ControlPanel
      :mode="mode"
      :selected-date="selectedDate"
      :selected-hour="selectedHour"
      :selected-minute="selectedMinute"
      :server-base-url="serverBaseUrl"
      :is-playing="isPlaying"
      :playback-rate="playbackRate"
      :display-time="globalDisplayTime"
      :timeline-value="globalSecond"
      :timeline-max="SEGMENT_SECONDS - 1"
      @update:mode="setMode"
      @update:selected-date="selectedDate = $event"
      @update:selected-hour="selectedHour = $event"
      @update:selected-minute="selectedMinute = $event"
      @update:server-base-url="serverBaseUrl = $event"
      @update:playback-rate="playbackRate = $event"
      @update:timeline-value="onTimelineInput"
      @apply-filter="applyDateTimeFilter"
      @toggle-play="togglePlay"
      @seek="seek"
      @scrub-start="onScrubStart"
      @scrub-end="onScrubEnd"
    />

    <main class="display-area">
      <VideoGrid
        :mode="mode"
        :camera-items="GRID_ITEMS"
        :camera-sources="cameraSources"
        :camera-status-text="cameraStatusText"
        @register-video="registerVideo($event.cameraId, $event.element)"
        @video-loaded="onVideoLoaded"
        @video-error="onVideoError"
      />
    </main>
  </div>
</template>
