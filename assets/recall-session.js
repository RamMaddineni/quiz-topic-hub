(function () {
  "use strict";

  const catalog = window.LEARNING_CATALOG;
  const decks = window.RECALL_DECKS;
  const deckId = new URLSearchParams(window.location.search).get("deck");
  const deck = decks && decks[deckId];

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function renderError(message) {
    const main = document.querySelector("main");
    main.replaceChildren();
    const shell = element("div", "recall-shell");
    const box = element("section", "not-found");
    box.append(element("h1", "", "Recall deck not found"));
    box.append(element("p", "", message));
    const link = element("a", "button button-primary", "Return to learning library");
    link.href = "index.html";
    box.append(link);
    shell.append(box);
    main.append(shell);
  }

  if (!catalog || !deck) {
    renderError("The requested deck does not exist.");
    return;
  }

  const topic = catalog.topics.find((item) => item.id === deck.topicId);
  const category = catalog.categories.find((item) => item.id === deck.categoryId);
  if (!topic || !category || deck.cards.length === 0) {
    renderError("This deck is not connected to a valid learning topic.");
    return;
  }

  document.body.dataset.category = category.id;
  document.title = `${deck.title} | Learning Library`;

  const state = {
    position: 0,
    revealed: false,
    ratings: Array(deck.cards.length).fill(null)
  };

  const breadcrumbs = document.querySelector("#breadcrumbs");
  const eyebrow = document.querySelector("#recall-eyebrow");
  const title = document.querySelector("#recall-title");
  const description = document.querySelector("#recall-description");
  const progressLabel = document.querySelector("#progress-label");
  const sessionLabel = document.querySelector("#session-label");
  const progress = document.querySelector("#recall-progress-value");
  const recalledCount = document.querySelector("#recalled-count");
  const reviewCount = document.querySelector("#review-count");
  const unratedCount = document.querySelector("#unrated-count");
  const cardTopic = document.querySelector("#card-topic");
  const cardNumber = document.querySelector("#card-number");
  const questionWrap = document.querySelector("#question-wrap");
  const question = document.querySelector("#recall-question");
  const answer = document.querySelector("#recall-answer");
  const answerText = document.querySelector("#recall-answer-text");
  const visual = document.querySelector("#recall-visual");
  const tagRow = document.querySelector("#tag-row");
  const previousButton = document.querySelector("#previous-button");
  const revealButton = document.querySelector("#reveal-button");
  const nextButton = document.querySelector("#next-button");
  const reviewButton = document.querySelector("#review-button");
  const recalledButton = document.querySelector("#recalled-button");
  const result = document.querySelector("#session-result");
  const resultCopy = document.querySelector("#result-copy");
  const restartButton = document.querySelector("#restart-button");

  function appendBreadcrumb(label, href) {
    if (breadcrumbs.childElementCount > 0) breadcrumbs.append(element("span", "", "/"));
    if (href) {
      const link = element("a", "", label);
      link.href = href;
      breadcrumbs.append(link);
    } else {
      breadcrumbs.append(element("span", "", label));
    }
  }

  appendBreadcrumb("Learning Library", "index.html");
  appendBreadcrumb(category.name, `category.html?category=${encodeURIComponent(category.id)}`);
  appendBreadcrumb(topic.title, `topic.html?topic=${encodeURIComponent(topic.id)}`);
  appendBreadcrumb("Active Recall");

  eyebrow.textContent = `${category.name} · ${topic.title}`;
  title.textContent = deck.title;
  description.textContent = deck.description;

  function totals() {
    return {
      recalled: state.ratings.filter((rating) => rating === "recalled").length,
      review: state.ratings.filter((rating) => rating === "review").length,
      unrated: state.ratings.filter((rating) => rating === null).length
    };
  }

  function currentCard() {
    return deck.cards[state.position];
  }

  function updateTags(tags) {
    tagRow.replaceChildren();
    (tags || []).forEach((tag) => tagRow.append(element("span", "tag", tag)));
  }

  function render() {
    const card = currentCard();
    const counts = totals();
    const completed = counts.unrated === 0;
    const currentRating = state.ratings[state.position];

    progressLabel.textContent = `Card ${state.position + 1} of ${deck.cards.length}`;
    sessionLabel.textContent = `${deck.cards.length - counts.unrated} rated this session`;
    progress.max = deck.cards.length;
    progress.value = deck.cards.length - counts.unrated;
    progress.textContent = `${deck.cards.length - counts.unrated} of ${deck.cards.length}`;

    recalledCount.textContent = `Recalled: ${counts.recalled}`;
    reviewCount.textContent = `Needs another pass: ${counts.review}`;
    unratedCount.textContent = `Unrated: ${counts.unrated}`;

    cardTopic.textContent = topic.title;
    cardNumber.textContent = `${state.position + 1} / ${deck.cards.length}`;
    question.textContent = card.question;
    answerText.textContent = card.answer;
    questionWrap.hidden = state.revealed;
    answer.hidden = !state.revealed;
    revealButton.textContent = state.revealed ? "Hide answer" : "Reveal answer";
    reviewButton.disabled = !state.revealed;
    recalledButton.disabled = !state.revealed;
    previousButton.disabled = state.position === 0;
    nextButton.disabled = state.position === deck.cards.length - 1;
    reviewButton.setAttribute("aria-pressed", String(currentRating === "review"));
    recalledButton.setAttribute("aria-pressed", String(currentRating === "recalled"));
    updateTags(card.tags);

    if (card.image) {
      visual.src = card.image;
      visual.alt = card.imageAlt || "";
      visual.hidden = !state.revealed;
    } else {
      visual.hidden = true;
      visual.removeAttribute("src");
      visual.alt = "";
    }

    result.hidden = !completed;
    if (completed) {
      resultCopy.textContent =
        `Session complete: ${counts.recalled} recalled and ${counts.review} marked for another pass. ` +
        "This result is session-only; Google Sheets remains the long-term tracker.";
    }
  }

  function move(offset) {
    const next = state.position + offset;
    if (next < 0 || next >= deck.cards.length) return;
    state.position = next;
    state.revealed = false;
    render();
  }

  function reveal() {
    state.revealed = !state.revealed;
    render();
  }

  function rate(value) {
    if (!state.revealed) return;
    state.ratings[state.position] = value;

    const nextUnrated = state.ratings.findIndex(
      (rating, index) => index > state.position && rating === null
    );
    const firstUnrated = state.ratings.findIndex((rating) => rating === null);

    if (nextUnrated !== -1) {
      state.position = nextUnrated;
      state.revealed = false;
    } else if (firstUnrated !== -1) {
      state.position = firstUnrated;
      state.revealed = false;
    }

    render();
  }

  function restart() {
    state.position = 0;
    state.revealed = false;
    state.ratings.fill(null);
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  previousButton.addEventListener("click", () => move(-1));
  nextButton.addEventListener("click", () => move(1));
  revealButton.addEventListener("click", reveal);
  reviewButton.addEventListener("click", () => rate("review"));
  recalledButton.addEventListener("click", () => rate("recalled"));
  restartButton.addEventListener("click", restart);

  document.addEventListener("keydown", (event) => {
    if (event.target instanceof HTMLButtonElement || event.target instanceof HTMLAnchorElement) return;
    if (event.key === " ") {
      event.preventDefault();
      reveal();
    } else if (event.key === "ArrowLeft") {
      move(-1);
    } else if (event.key === "ArrowRight") {
      move(1);
    } else if (event.key === "1") {
      rate("review");
    } else if (event.key === "2") {
      rate("recalled");
    }
  });

  render();
})();
