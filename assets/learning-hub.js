(function () {
  "use strict";

  const catalog = window.LEARNING_CATALOG;
  if (!catalog) return;

  const modeLabels = {
    learn: "Learn",
    quiz: "Quiz",
    recall: "Active Recall"
  };

  const modeDescriptions = {
    learn: "Build the mental model through notes, examples, and visuals.",
    quiz: "Test understanding with scored questions and explanations.",
    recall: "Retrieve important ideas from memory without multiple-choice clues."
  };

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function categoryById(id) {
    return catalog.categories.find((category) => category.id === id);
  }

  function topicById(id) {
    return catalog.topics.find((topic) => topic.id === id);
  }

  function byOrder(left, right) {
    return left.order - right.order || left.name?.localeCompare(right.name) || left.title?.localeCompare(right.title) || 0;
  }

  function categoriesInOrder() {
    return [...catalog.categories].sort(byOrder);
  }

  function topicsForCategory(categoryId) {
    return catalog.topics
      .filter((topic) => topic.categoryId === categoryId)
      .sort(byOrder);
  }

  function formatOrder(order) {
    return String(order).padStart(2, "0");
  }

  function resourceCount(topics) {
    return topics.reduce((total, topic) => total + topic.resources.length, 0);
  }

  function plural(value, singular, pluralForm) {
    return `${value} ${value === 1 ? singular : pluralForm}`;
  }

  function appendCardFooter(card, meta, action) {
    const footer = element("span", "card-footer");
    footer.append(element("span", "", meta));
    footer.append(element("span", "card-arrow", "→"));
    footer.lastElementChild.setAttribute("aria-hidden", "true");
    footer.setAttribute("aria-label", action);
    card.append(footer);
  }

  function renderCategoryCard(category) {
    const topics = topicsForCategory(category.id);
    const resources = resourceCount(topics);
    const card = element("a", "category-card");
    card.href = `category.html?category=${encodeURIComponent(category.id)}`;
    card.dataset.category = category.id;

    const topline = element("div", "card-topline");
    topline.append(element("span", "category-icon", category.icon));
    topline.append(element("span", "card-count", plural(topics.length, "topic", "topics")));

    const title = element("h2", "", category.name);
    const description = element("p", "", category.description);
    const preview = element("div", "topic-preview");
    topics.slice(0, 3).forEach((topic) => {
      preview.append(element("span", "", `${formatOrder(topic.order)} · ${topic.title}`));
    });

    card.append(topline, title, description, preview);
    appendCardFooter(card, plural(resources, "resource", "resources"), `Open ${category.name}`);
    return card;
  }

  function renderToolCard(tool) {
    const card = element("a", "tool-card");
    card.href = tool.href;

    const topline = element("div", "card-topline");
    topline.append(element("span", "category-icon", "◷"));
    topline.append(element("span", "card-count", "Tool"));

    card.append(topline);
    card.append(element("h3", "", tool.title));
    card.append(element("p", "", tool.description));
    appendCardFooter(card, tool.meta, `Open ${tool.title}`);
    return card;
  }

  function modesForTopic(topic) {
    return [...new Set(topic.resources.map((resource) => resource.type))];
  }

  function renderTopicCard(topic, category) {
    const card = element("a", "topic-card");
    card.href = `topic.html?topic=${encodeURIComponent(topic.id)}`;
    card.dataset.category = category.id;

    const topline = element("div", "card-topline");
    topline.append(element("span", "category-icon", category.icon));
    topline.append(
      element(
        "span",
        "card-count topic-order",
        `Topic ${formatOrder(topic.order)} · ${plural(topic.resources.length, "resource", "resources")}`
      )
    );

    card.append(topline);
    card.append(element("h2", "", topic.title));
    card.append(element("p", "", topic.description));

    const modes = element("div", "mode-row");
    modesForTopic(topic).forEach((mode) => modes.append(element("span", "mode-pill", modeLabels[mode])));
    card.append(modes);
    appendCardFooter(card, "Open topic", `Open ${topic.title}`);
    return card;
  }

  function renderResourceCard(resource, category) {
    const card = element("a", "resource-card");
    card.href = resource.href;
    card.dataset.category = category.id;

    card.append(element("span", "resource-label", modeLabels[resource.type]));
    card.append(element("h3", "", resource.title));
    card.append(element("p", "", resource.description));
    appendCardFooter(card, resource.meta, `Open ${resource.title}`);
    return card;
  }

  function appendBreadcrumb(container, label, href) {
    if (container.childElementCount > 0) {
      container.append(element("span", "", "/"));
    }
    if (href) {
      const link = element("a", "", label);
      link.href = href;
      container.append(link);
    } else {
      container.append(element("span", "", label));
    }
  }

  function showNotFound(message) {
    const main = document.querySelector("main");
    main.replaceChildren();
    const shell = element("div", "site-shell");
    const box = element("section", "not-found");
    box.append(element("h1", "", "Page not found"));
    box.append(element("p", "", message));
    const link = element("a", "button button-primary", "Return to learning library");
    link.href = "index.html";
    box.append(link);
    shell.append(box);
    main.append(shell);
  }

  function renderHome() {
    const categoryGrid = document.querySelector("#category-grid");
    const toolGrid = document.querySelector("#tool-grid");
    const categoryCount = document.querySelector("#category-count");
    const toolCount = document.querySelector("#tool-count");

    categoriesInOrder().forEach((category) => categoryGrid.append(renderCategoryCard(category)));
    catalog.tools.forEach((tool) => toolGrid.append(renderToolCard(tool)));

    categoryCount.textContent = `${catalog.categories.length} categories · ${catalog.topics.length} topics`;
    toolCount.textContent = plural(catalog.tools.length, "tool", "tools");
  }

  function renderCategory() {
    const id = new URLSearchParams(window.location.search).get("category");
    const category = categoryById(id);
    if (!category) {
      showNotFound("That learning category does not exist.");
      return;
    }

    const topics = topicsForCategory(category.id);
    document.body.dataset.category = category.id;
    document.title = `${category.name} | Learning Library`;

    const breadcrumbs = document.querySelector("#breadcrumbs");
    appendBreadcrumb(breadcrumbs, "Learning Library", "index.html");
    appendBreadcrumb(breadcrumbs, category.name);

    document.querySelector("#category-eyebrow").textContent = "Learning category";
    document.querySelector("#category-title").textContent = category.name;
    document.querySelector("#category-description").textContent = category.description;
    document.querySelector("#topic-count").textContent =
      `${plural(topics.length, "topic", "topics")} · ${plural(resourceCount(topics), "resource", "resources")}`;

    const topicGrid = document.querySelector("#topic-grid");
    topics.forEach((topic) => topicGrid.append(renderTopicCard(topic, category)));
  }

  function renderResourceSection(type, topic, category) {
    const resources = topic.resources.filter((resource) => resource.type === type);
    const container = document.querySelector(`#${type}-resources`);
    const count = document.querySelector(`#${type}-count`);
    const description = document.querySelector(`#${type}-description`);

    count.textContent = plural(resources.length, "resource", "resources");
    description.textContent = modeDescriptions[type];

    if (resources.length === 0) {
      container.append(element("div", "empty-state", `No ${modeLabels[type].toLowerCase()} resource has been added for this topic yet.`));
      return;
    }

    resources.forEach((resource) => container.append(renderResourceCard(resource, category)));
  }

  function renderTopicNavigation(topic, category) {
    const container = document.querySelector("#topic-navigation");
    if (!container) return;

    const topics = topicsForCategory(category.id);
    const index = topics.findIndex((candidate) => candidate.id === topic.id);
    const previous = topics[index - 1];
    const next = topics[index + 1];

    function sequenceLink(target, direction) {
      const link = element("a", `sequence-link sequence-${direction}`);
      link.href = `topic.html?topic=${encodeURIComponent(target.id)}`;
      link.append(
        element("span", "sequence-direction", direction === "previous" ? "← Previous" : "Next →"),
        element("strong", "", target.title)
      );
      return link;
    }

    const previousControl = previous
      ? sequenceLink(previous, "previous")
      : element("span", "sequence-boundary", "Start of category");
    const position = element(
      "span",
      "sequence-position",
      `Topic ${formatOrder(topic.order)} of ${topics.length}`
    );
    const nextControl = next
      ? sequenceLink(next, "next")
      : element("span", "sequence-boundary sequence-boundary-end", "End of category");

    container.append(previousControl, position, nextControl);
  }

  function renderTopic() {
    const id = new URLSearchParams(window.location.search).get("topic");
    const topic = topicById(id);
    if (!topic) {
      showNotFound("That learning topic does not exist.");
      return;
    }

    const category = categoryById(topic.categoryId);
    document.body.dataset.category = category.id;
    document.title = `${topic.title} | ${category.name}`;

    const breadcrumbs = document.querySelector("#breadcrumbs");
    appendBreadcrumb(breadcrumbs, "Learning Library", "index.html");
    appendBreadcrumb(breadcrumbs, category.name, `category.html?category=${encodeURIComponent(category.id)}`);
    appendBreadcrumb(breadcrumbs, topic.title);

    const categoryTopics = topicsForCategory(category.id);
    document.querySelector("#topic-eyebrow").textContent =
      `${category.name} · Topic ${formatOrder(topic.order)} of ${categoryTopics.length}`;
    document.querySelector("#topic-title").textContent = topic.title;
    document.querySelector("#topic-description").textContent = topic.description;

    renderTopicNavigation(topic, category);
    ["learn", "quiz", "recall"].forEach((type) => renderResourceSection(type, topic, category));
  }

  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "category") renderCategory();
  if (page === "topic") renderTopic();
})();
