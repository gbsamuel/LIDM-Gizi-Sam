(function () {
  async function currentUserId() {
    const auth = window.NutriVerseAuth;
    if (!auth?.getCurrentUser) return null;
    try {
      const user = await auth.getCurrentUser();
      return user?.id || null;
    } catch (error) {
      return null;
    }
  }

  async function trackFeatureEvent(feature, eventType, resourceId, metadata = {}) {
    const auth = window.NutriVerseAuth;
    if (!auth?.trackFeatureEvent) return null;
    try {
      return await auth.trackFeatureEvent({
        userId: await currentUserId(),
        feature,
        eventType,
        resourceId,
        metadata
      });
    } catch (error) {
      console.warn("NutriVerse tracking skipped:", error.message || error);
      return null;
    }
  }

  async function upsertLearningProgress(moduleId, status = "viewed", progressPercentage = 25) {
    const auth = window.NutriVerseAuth;
    if (!auth?.upsertLearningProgress) return null;
    const userId = await currentUserId();
    if (!userId) return null;
    try {
      return await auth.upsertLearningProgress({
        userId,
        moduleId,
        status,
        progressPercentage
      });
    } catch (error) {
      console.warn("NutriVerse progress tracking skipped:", error.message || error);
      return null;
    }
  }

  function initDeclarativeTracking() {
    document.querySelectorAll("[data-track-feature]").forEach((node) => {
      node.addEventListener("click", () => {
        trackFeatureEvent(
          node.dataset.trackFeature,
          node.dataset.trackEvent || "open",
          node.dataset.trackResource || node.getAttribute("href") || "unknown",
          {
            label: node.dataset.trackLabel || node.textContent.trim().slice(0, 120),
            page: window.location.pathname.split("/").pop() || "index.html"
          }
        );
      });
    });

    document.querySelectorAll("[data-module-progress]").forEach((node) => {
      node.addEventListener("click", () => {
        upsertLearningProgress(
          node.dataset.moduleProgress,
          node.dataset.progressStatus || "viewed",
          Number(node.dataset.progressPercent || 25)
        );
      });
    });
  }

  window.NutriVerseTracking = {
    trackFeatureEvent,
    upsertLearningProgress,
    initDeclarativeTracking
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDeclarativeTracking);
  } else {
    initDeclarativeTracking();
  }
})();
