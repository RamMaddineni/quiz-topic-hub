"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const repositoryRoot = path.resolve(__dirname, "..");
const catalogPath = path.join(repositoryRoot, "assets", "learning-catalog.js");
const source = fs.readFileSync(catalogPath, "utf8");
const sandbox = { window: {} };

vm.runInNewContext(source, sandbox, { filename: catalogPath });

const catalog = sandbox.window.LEARNING_CATALOG;
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

function validateIds(items, label) {
  const ids = items.map((item) => item.id);
  report(ids.every(Boolean), `${label}: every item must have an id`);
  report(new Set(ids).size === ids.length, `${label}: ids must be unique`);
}

function validateOrder(items, label) {
  const orders = items.map((item) => item.order);
  report(
    orders.every((order) => Number.isInteger(order) && order > 0),
    `${label}: every order must be a positive integer`
  );
  report(new Set(orders).size === orders.length, `${label}: order values must be unique`);

  const sorted = [...orders].sort((left, right) => left - right);
  sorted.forEach((order, index) => {
    report(order === index + 1, `${label}: expected order ${index + 1}, found ${order}`);
  });
}

report(catalog && Array.isArray(catalog.categories), "Catalog must define categories");
report(catalog && Array.isArray(catalog.topics), "Catalog must define topics");

if (errors.length === 0) {
  validateIds(catalog.categories, "Categories");
  validateOrder(catalog.categories, "Categories");
  validateIds(catalog.topics, "Topics");

  const categoryIds = new Set(catalog.categories.map((category) => category.id));
  catalog.topics.forEach((topic) => {
    report(
      categoryIds.has(topic.categoryId),
      `Topic "${topic.id}" references missing category "${topic.categoryId}"`
    );
  });

  catalog.categories.forEach((category) => {
    const topics = catalog.topics.filter((topic) => topic.categoryId === category.id);
    validateOrder(topics, `Category "${category.id}"`);
  });
}

if (errors.length > 0) {
  console.error("Catalog order validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("Catalog order is valid.\n");
catalog.categories
  .slice()
  .sort((left, right) => left.order - right.order)
  .forEach((category) => {
    const topics = catalog.topics
      .filter((topic) => topic.categoryId === category.id)
      .sort((left, right) => left.order - right.order)
      .map((topic) => `${topic.order}. ${topic.title}`)
      .join(" → ");
    console.log(`${category.name}: ${topics}`);
  });
