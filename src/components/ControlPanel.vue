<script setup>
import GlobalTimeline from "./GlobalTimeline.vue";

defineProps({
  mode: {
    type: String,
    required: true,
  },
  selectedDate: {
    type: String,
    required: true,
  },
  selectedHour: {
    type: Number,
    required: true,
  },
  selectedMinute: {
    type: Number,
    required: true,
  },
  serverBaseUrl: {
    type: String,
    required: true,
  },
  isPlaying: {
    type: Boolean,
    required: true,
  },
  playbackRate: {
    type: Number,
    required: true,
  },
  displayTime: {
    type: String,
    required: true,
  },
  timelineValue: {
    type: Number,
    required: true,
  },
  timelineMax: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits([
  "update:mode",
  "update:selected-date",
  "update:selected-hour",
  "update:selected-minute",
  "update:server-base-url",
  "update:playback-rate",
  "update:timeline-value",
  "apply-filter",
  "toggle-play",
  "seek",
  "scrub-start",
  "scrub-end",
]);

const PLAYBACK_SPEEDS = [1, 1.5, 2, 4, 8];
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => i * 5);
</script>

<template>
  <aside class="control-panel">
    <h1>監看控制台</h1>

    <div class="tab-switch">
      <button
        :class="{ active: mode === 'live' }"
        @click="emit('update:mode', 'live')"
      >
        即時畫面
      </button>
      <button
        :class="{ active: mode === 'playback' }"
        @click="emit('update:mode', 'playback')"
      >
        錄影回放
      </button>
    </div>

    <section v-if="mode === 'playback'" class="group">
      <h2>日期時間篩選</h2>
      <label>
        日期
        <input
          :value="selectedDate"
          type="date"
          @input="emit('update:selected-date', $event.target.value)"
        />
      </label>
      <label>
        小時
        <select
          :value="selectedHour"
          @change="emit('update:selected-hour', Number($event.target.value))"
        >
          <option v-for="hour in HOUR_OPTIONS" :key="hour" :value="hour">
            {{ String(hour).padStart(2, "0") }}
          </option>
        </select>
      </label>
      <label>
        分鐘
        <select
          :value="selectedMinute"
          @change="emit('update:selected-minute', Number($event.target.value))"
        >
          <option
            v-for="minute in MINUTE_OPTIONS"
            :key="minute"
            :value="minute"
          >
            {{ String(minute).padStart(2, "0") }}
          </option>
        </select>
      </label>
      <button class="primary" @click="emit('apply-filter')">
        套用日期時間
      </button>

      <div class="button-row">
        <button @click="emit('toggle-play')">
          {{ isPlaying ? "暫停" : "播放" }}
        </button>
        <button @click="emit('seek', -10)">-10s</button>
        <button @click="emit('seek', 10)">+10s</button>
      </div>

      <label>
        播放倍率
        <select
          :value="playbackRate"
          @change="emit('update:playback-rate', Number($event.target.value))"
        >
          <option v-for="speed in PLAYBACK_SPEEDS" :key="speed" :value="speed">
            {{ speed }}x
          </option>
        </select>
      </label>

      <GlobalTimeline
        :model-value="timelineValue"
        :max="timelineMax"
        :display-time="displayTime"
        @update:model-value="emit('update:timeline-value', $event)"
        @scrub-start="emit('scrub-start')"
        @scrub-end="emit('scrub-end')"
      />
    </section>

    <section v-else class="group">
      <h2>即時模式</h2>
      <p class="hint">觀看即時辨識畫面串流。</p>
    </section>
  </aside>
</template>
