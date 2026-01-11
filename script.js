const videoCards = Array.from(document.querySelectorAll("[data-video-card]"));
const videos = videoCards
  .map((card) => card.querySelector("video"))
  .filter(Boolean);
const clipCount = document.querySelector("[data-clip-count]");
const syncToggle = document.getElementById("sync-toggle");

const getActiveVideos = () => videos.filter((video) => video.isConnected);

const updateClipCount = () => {
  if (!clipCount) {
    return;
  }
  clipCount.textContent = String(getActiveVideos().length);
};

const setAllTimes = (time) => {
  getActiveVideos().forEach((video) => {
    try {
      video.currentTime = time;
    } catch {
      // Ignore invalid time updates on unloaded media.
    }
  });
};

const safePlay = (video) => {
  const result = video.play();
  if (result && typeof result.catch === "function") {
    result.catch(() => {
      // Browser blocked playback or the file is missing.
    });
  }
};

const playAll = () => {
  const active = getActiveVideos();
  if (!active.length) {
    return;
  }
  if (syncToggle && syncToggle.checked) {
    const minTime = Math.min(...active.map((video) => video.currentTime || 0));
    setAllTimes(Number.isFinite(minTime) ? minTime : 0);
  }
  active.forEach(safePlay);
};

const pauseAll = () => {
  getActiveVideos().forEach((video) => video.pause());
};

const restartAll = () => {
  pauseAll();
  setAllTimes(0);
};

const actionMap = {
  play: playAll,
  pause: pauseAll,
  restart: restartAll,
};

Object.entries(actionMap).forEach(([action, handler]) => {
  const button = document.querySelector(`[data-action="${action}"]`);
  if (!button) {
    return;
  }
  button.addEventListener("click", handler);
});

videos.forEach((video) => {
  video.addEventListener("error", () => {
    const card = video.closest("[data-video-card]");
    if (card) {
      card.remove();
      updateClipCount();
    }
  });
});

document.querySelectorAll("[data-image-card] img").forEach((image) => {
  image.addEventListener("error", () => {
    const card = image.closest("[data-image-card]");
    if (card) {
      card.remove();
    }
  });
});

updateClipCount();
