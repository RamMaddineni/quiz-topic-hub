"use strict";

const fs = require("node:fs");
const path = require("node:path");

const inputPath = process.argv[2];

if (!inputPath) {
  console.error("Usage: node scripts/validate-quiz-questions.js <quiz.html>");
  process.exit(1);
}

const quizPath = path.resolve(process.cwd(), inputPath);
const source = fs.readFileSync(quizPath, "utf8");
const errors = [];
const expectedContextLabels = [
  "Current system",
  "Observed evidence",
  "Required behavior",
  "Known constraints"
];

function report(condition, message) {
  if (!condition) errors.push(message);
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}="([^"]*)"`));
  return match ? match[1] : "";
}

function textOnly(markup) {
  return markup
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const questionBlocks = [
  ...source.matchAll(/<article\b[^>]*class="[^"]*\bquestion\b[^"]*"[^>]*>[\s\S]*?<\/article>/g)
].map((match) => match[0]);

report(questionBlocks.length > 0, "Quiz must contain at least one .question article");

const answerCounts = { a: 0, b: 0, c: 0, d: 0 };

questionBlocks.forEach((block, index) => {
  const number = index + 1;
  const openingTag = block.match(/^<article\b[^>]*>/)?.[0] || "";
  const id = attribute(openingTag, "id");
  const correct = attribute(openingTag, "data-correct");
  const section = attribute(openingTag, "data-section");
  const prefix = `Question ${number}`;

  report(id === `q${number}-card`, `${prefix}: expected id="q${number}-card", found "${id}"`);
  report(["a", "b", "c", "d"].includes(correct), `${prefix}: data-correct must be a, b, c, or d`);
  report(Boolean(section), `${prefix}: data-section is required`);
  if (answerCounts[correct] !== undefined) answerCounts[correct] += 1;

  const legend = textOnly(block.match(/<legend>([\s\S]*?)<\/legend>/)?.[1] || "");
  report(legend.startsWith(`${number}.`), `${prefix}: legend must begin with "${number}."`);

  const context = block.match(/<dl class="question-context">([\s\S]*?)<\/dl>/)?.[1] || "";
  const contextLabels = [...context.matchAll(/<dt>([\s\S]*?)<\/dt>/g)].map((match) => textOnly(match[1]));
  report(
    JSON.stringify(contextLabels) === JSON.stringify(expectedContextLabels),
    `${prefix}: context labels must be ${expectedContextLabels.join(" → ")}`
  );

  expectedContextLabels.forEach((label) => {
    const rowPattern = new RegExp(`<dt>${label}<\\/dt><dd>([\\s\\S]*?)<\\/dd>`);
    const rowText = textOnly(context.match(rowPattern)?.[1] || "");
    report(rowText.length >= 35, `${prefix}: "${label}" needs a substantive, explicit statement`);
  });

  const decision = textOnly(block.match(/<p class="question-ask">([\s\S]*?)<\/p>/)?.[1] || "");
  report(decision.startsWith("Decision:"), `${prefix}: include a precise Decision prompt`);
  report(decision.length >= 45, `${prefix}: Decision prompt is too thin to identify the requested judgment`);

  const inputTags = [...block.matchAll(/<input\b[^>]*type="radio"[^>]*>/g)].map((match) => match[0]);
  report(inputTags.length === 4, `${prefix}: expected 4 radio options, found ${inputTags.length}`);

  const values = inputTags.map((tag) => attribute(tag, "value"));
  const names = inputTags.map((tag) => attribute(tag, "name"));
  report(JSON.stringify(values) === JSON.stringify(["a", "b", "c", "d"]), `${prefix}: options must use values a, b, c, d`);
  report(names.every((name) => name === `q${number}`), `${prefix}: every radio must use name="q${number}"`);
  report(inputTags.filter((tag) => /\brequired\b/.test(tag)).length === 1, `${prefix}: exactly one radio in the group must carry required`);

  const feedbackTag = block.match(/<div\b[^>]*class="feedback"[^>]*>/)?.[0] || "";
  report(Boolean(feedbackTag), `${prefix}: structured .feedback block is required`);
  report(/\bhidden\b/.test(feedbackTag), `${prefix}: feedback must remain hidden until submit`);
  report(block.includes('class="feedback-verdict"'), `${prefix}: feedback verdict is missing`);
  report(block.includes('class="feedback-facts"'), `${prefix}: feedback must identify the given facts`);
  report(block.includes('class="feedback-reasoning"'), `${prefix}: feedback must explain the causal reasoning`);
  report(block.includes('class="feedback-boundary"'), `${prefix}: feedback must state a boundary or trade-off`);
  report(!block.includes("data-explanation="), `${prefix}: old one-line data-explanation feedback is not allowed`);

  const referentialLeak = /\b(as (?:stated|shown|discussed) (?:above|earlier)|previous question|earlier question)\b/i;
  report(!referentialLeak.test(block), `${prefix}: question refers to context outside its own card`);
});

const progressMaximum = Number(source.match(/<progress\b[^>]*max="(\d+)"/)?.[1]);
report(
  !Number.isNaN(progressMaximum) && progressMaximum === questionBlocks.length,
  `Progress maximum must equal the question count (${questionBlocks.length})`
);

report(
  source.includes('"ALL-SECTIONS"'),
  "Perfect-score result must use ALL-SECTIONS instead of inventing a weakest section"
);
report(
  source.includes("weakestSections"),
  "Result logic must preserve ties between equally weak sections"
);

if (errors.length > 0) {
  console.error(`Quiz validation failed for ${path.basename(quizPath)}:\n`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Quiz structure is valid: ${questionBlocks.length} self-contained questions.`);
console.log(`Answer distribution: A=${answerCounts.a}, B=${answerCounts.b}, C=${answerCounts.c}, D=${answerCounts.d}`);
