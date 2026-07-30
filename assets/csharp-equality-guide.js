(function () {
  "use strict";

  const storageKey = "csharp-equality-contracts-progress-v1";
  const checkboxes = [...document.querySelectorAll("input[data-progress]")];
  const progress = document.querySelector("#topic-progress");
  const score = document.querySelector("#progress-score");
  const breakdown = document.querySelector("#progress-breakdown");
  const reset = document.querySelector("#reset-progress");
  const doneBanner = document.querySelector("#done-banner");

  function readStoredProgress() {
    try {
      const parsed = JSON.parse(window.sessionStorage.getItem(storageKey) || "[]");
      return Array.isArray(parsed) ? new Set(parsed) : new Set();
    } catch {
      return new Set();
    }
  }

  function writeStoredProgress(values) {
    try {
      window.sessionStorage.setItem(storageKey, JSON.stringify([...values]));
    } catch {
      // The page still works if the browser blocks session storage.
    }
  }

  function updateProgress() {
    const completed = checkboxes.filter((checkbox) => checkbox.checked);
    const completedIds = new Set(completed.map((checkbox) => checkbox.dataset.progress));
    const learned = completed.filter((checkbox) => checkbox.dataset.kind === "learn").length;
    const exercised = completed.filter((checkbox) => checkbox.dataset.kind === "exercise").length;
    const total = checkboxes.length;
    const percentage = total === 0 ? 0 : Math.round((completed.length / total) * 100);

    progress.max = total;
    progress.value = completed.length;
    progress.textContent = `${percentage}%`;
    score.textContent = `${completed.length} / ${total} · ${percentage}%`;
    breakdown.textContent = `Learning ${learned}/10 · Exercises ${exercised}/10`;
    doneBanner.dataset.visible = String(completed.length === total);
    writeStoredProgress(completedIds);
  }

  const stored = readStoredProgress();
  checkboxes.forEach((checkbox) => {
    checkbox.checked = stored.has(checkbox.dataset.progress);
    checkbox.addEventListener("change", updateProgress);
  });

  reset.addEventListener("click", () => {
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    try {
      window.sessionStorage.removeItem(storageKey);
    } catch {
      // Nothing else is required when storage is unavailable.
    }
    updateProgress();
  });

  updateProgress();
})();
