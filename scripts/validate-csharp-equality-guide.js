"use strict";

const fs = require("node:fs");
const path = require("node:path");

const repositoryRoot = path.resolve(__dirname, "..");
const htmlPath = path.join(repositoryRoot, "csharp-equality-contracts.html");
const cssPath = path.join(repositoryRoot, "assets", "csharp-equality-guide.css");
const jsPath = path.join(repositoryRoot, "assets", "csharp-equality-guide.js");

const html = fs.readFileSync(htmlPath, "utf8");
const css = fs.readFileSync(cssPath, "utf8");
const js = fs.readFileSync(jsPath, "utf8");
const errors = [];

function report(condition, message) {
  if (!condition) errors.push(message);
}

function matches(pattern, source = html) {
  return [...source.matchAll(pattern)];
}

function valuesFor(pattern, source = html) {
  return matches(pattern, source).map((match) => match[1]);
}

const ids = valuesFor(/\sid="([^"]+)"/g);
report(ids.length === new Set(ids).size, "Every HTML id must be unique.");

const ariaTargets = valuesFor(/\saria-labelledby="([^"]+)"/g);
ariaTargets.forEach((target) => {
  report(ids.includes(target), `aria-labelledby references missing id "${target}".`);
});

const progressIds = valuesFor(/\sdata-progress="([^"]+)"/g);
const expectedLearning = Array.from({ length: 10 }, (_, index) => `learn-${index + 1}`);
const expectedExercises = Array.from({ length: 10 }, (_, index) => `exercise-${index + 1}`);
const expectedProgress = [...expectedLearning, ...expectedExercises];

report(progressIds.length === 20, `Expected 20 progress controls, found ${progressIds.length}.`);
report(progressIds.length === new Set(progressIds).size, "Progress ids must be unique.");
expectedProgress.forEach((id) => {
  report(progressIds.includes(id), `Missing progress control "${id}".`);
});

const learningKinds = matches(/data-progress="learn-\d+"\s+data-kind="learn"/g);
const exerciseKinds = matches(/data-progress="exercise-\d+"\s+data-kind="exercise"/g);
report(learningKinds.length === 10, `Expected 10 learning controls, found ${learningKinds.length}.`);
report(exerciseKinds.length === 10, `Expected 10 exercise controls, found ${exerciseKinds.length}.`);

const exerciseArticleIds = valuesFor(/<article class="exercise-card" id="(exercise-\d+)">/g);
report(exerciseArticleIds.length === 10, `Expected 10 exercise cards, found ${exerciseArticleIds.length}.`);
expectedExercises.forEach((id) => {
  report(exerciseArticleIds.includes(id), `Missing exercise card "${id}".`);
});

const hintSummaries = matches(/<summary>Hint<\/summary>/g);
const solutionSummaries = matches(/<summary>Solution<\/summary>/g);
report(hintSummaries.length === 10, `Expected 10 hints, found ${hintSummaries.length}.`);
report(solutionSummaries.length === 10, `Expected 10 solutions, found ${solutionSummaries.length}.`);

const requiredSectionIds = [
  "identity",
  "tools",
  "dispatch",
  "laws",
  "implementation",
  "comparers",
  "hashing",
  "immutability",
  "records",
  "decisions",
  "exercises",
  "references"
];
requiredSectionIds.forEach((id) => {
  report(ids.includes(id), `Missing required section "${id}".`);
});

const requiredConcepts = [
  "ReferenceEquals",
  "object.Equals",
  "IEquatable&lt;T&gt;",
  "IEqualityComparer&lt;T&gt;",
  "EqualityComparer&lt;T&gt;.Default",
  "GetHashCode",
  "HashCode.Combine",
  "HashSet",
  "Dictionary",
  "Reflexive",
  "Symmetric",
  "Transitive",
  "record class",
  "readonly record struct",
  "shallow copy",
  "StringComparer.OrdinalIgnoreCase",
  "double.NaN",
  "mutable-key"
];
requiredConcepts.forEach((concept) => {
  report(html.includes(concept), `Missing required concept text "${concept}".`);
});

const localHrefs = valuesFor(/\shref="([^":?#]+(?:\?[^"]*)?)"/g)
  .map((href) => href.split("?")[0])
  .filter((href) => !href.startsWith("#"));
const connectorVerifiedRepositoryFiles = new Set(["index.html", "topic.html"]);
localHrefs.forEach((href) => {
  const target = path.join(repositoryRoot, href);
  report(
    fs.existsSync(target) || connectorVerifiedRepositoryFiles.has(href),
    `Local link target does not exist: ${href}`
  );
});

report(!html.includes('href="#"'), "Placeholder href=\"#\" links are not allowed.");
report(!html.includes("IEquatable<T>"), "Generic type brackets must be HTML-escaped.");
report(!html.includes("IEqualityComparer<T>"), "Generic type brackets must be HTML-escaped.");

const externalLinks = valuesFor(/\shref="(https:\/\/[^"]+)"/g);
report(externalLinks.length >= 8, `Expected at least 8 official references, found ${externalLinks.length}.`);
externalLinks.forEach((href) => {
  report(
    href.startsWith("https://learn.microsoft.com/"),
    `Non-Microsoft external reference found: ${href}`
  );
});

report(js.includes("window.sessionStorage"), "Progress must use sessionStorage.");
report(!js.includes("localStorage"), "Progress must not use cross-session localStorage.");
report(js.includes("completed.length === total"), "Completion banner must depend on all checkpoints.");
report(css.includes("@media (prefers-color-scheme: dark)"), "Missing dark-mode styles.");
report(css.includes("@media (prefers-reduced-motion: reduce)"), "Missing reduced-motion styles.");
report(css.includes("@media (max-width: 620px)"), "Missing small-screen responsive styles.");

if (errors.length > 0) {
  console.error("C# equality guide validation failed:\n");
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("C# equality guide validation passed.");
console.log("- 10 learning checkpoints");
console.log("- 10 exercises with hints and solutions");
console.log("- 20 unique session-progress controls");
console.log("- Required equality, hashing, record, and immutability concepts present");
console.log("- Local links, accessibility targets, and responsive-mode markers verified");
