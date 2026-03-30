import { reactive } from "vue";

export function useVideoSync() {
  const videoRefs = reactive({});

  function registerVideo(cameraId, element) {
    if (element) {
      videoRefs[cameraId] = element;
    } else {
      delete videoRefs[cameraId];
    }
  }

  function syncAll(second, force = false) {
    Object.values(videoRefs).forEach((video) => {
      if (!video || !Number.isFinite(video.duration)) return;
      if (force || Math.abs(video.currentTime - second) > 0.08) {
        video.currentTime = second;
      }
    });
  }

  function setPlaybackRate(rate) {
    Object.values(videoRefs).forEach((video) => {
      if (!video) return;
      video.playbackRate = rate;
    });
  }

  function pauseAll() {
    Object.values(videoRefs).forEach((video) => {
      if (video) video.pause();
    });
  }

  function playAll() {
    Object.values(videoRefs).forEach((video) => {
      if (!video) return;
      video.play().catch(() => {});
    });
  }

  return {
    registerVideo,
    syncAll,
    setPlaybackRate,
    pauseAll,
    playAll,
  };
}
