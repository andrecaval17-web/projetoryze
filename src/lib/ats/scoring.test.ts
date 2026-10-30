import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateTenureStats,
  applyScoreCaps,
  buildScoreReasoning,
  computeFinalScore,
  parseModelScoreJson,
  type JobEntry,
} from "./scoring.ts";

const TODAY = new Date(Date.UTC(2026, 9, 30)); // 2026-10-30

function job(partial: Partial<JobEntry>): JobEntry {
  return { company: "Empresa", title: "Cargo", start: null, end: null, type: "clt", ...partial };
}

test("average tenure below 12 months applies the permanence cap", () => {
  const jobs: JobEntry[] = [
    job({ start: "2024-01", end: "2024-07" }), // 6 months
    job({ start: "2024-08", end: "2025-02" }), // 6 months
  ];
  const stats = calculateTenureStats(jobs, TODAY);
  assert.ok(stats);
  assert.equal(stats!.averageMonths, 6);
  const cap = applyScoreCaps(90, jobs, "alta", "", TODAY);
  assert.equal(cap.cappedScore, 60);
  assert.equal(cap.alerts.length, 1);
  assert.match(cap.alerts[0], /Permanência baixa/);
});

test("3+ short stints in the last 5 years applies the permanence cap even with a decent average", () => {
  const jobs: JobEntry[] = [
    job({ start: "2022-01", end: "2022-11" }), // 10 months
    job({ start: "2023-01", end: "2023-11" }), // 10 months
    job({ start: "2024-01", end: "2024-11" }), // 10 months
  ];
  const stats = calculateTenureStats(jobs, TODAY);
  assert.ok(stats);
  assert.equal(stats!.shortStintCount, 3);
  const cap = applyScoreCaps(85, jobs, "alta", "", TODAY);
  assert.equal(cap.cappedScore, 60);
});

test("estagio and temporario are ignored, never counted as short tenure", () => {
  const jobs: JobEntry[] = [
    job({ start: "2024-01", end: "2024-04", type: "estagio" }), // 3 months, excluded
    job({ start: "2024-05", end: "2024-07", type: "temporario" }), // 2 months, excluded
    job({ start: "2024-08", end: "2026-08", type: "clt" }), // 24 months
  ];
  // Only one CLT job with valid dates after exclusion -> rule can't apply (needs >= 2).
  const stats = calculateTenureStats(jobs, TODAY);
  assert.equal(stats, null);
  const cap = applyScoreCaps(80, jobs, "alta", "", TODAY);
  assert.equal(cap.cappedScore, 80);
  assert.equal(cap.alerts.length, 0);
});

test("fewer than 2 jobs with valid dates: rule not applied", () => {
  const jobs: JobEntry[] = [job({ start: "2024-01", end: "2024-03" })];
  assert.equal(calculateTenureStats(jobs, TODAY), null);
  const cap = applyScoreCaps(95, jobs, "alta", "", TODAY);
  assert.equal(cap.cappedScore, 95);
  assert.equal(cap.alerts.length, 0);
});

test("jobs with null start or end are ignored in the calculation", () => {
  const jobs: JobEntry[] = [
    job({ start: null, end: "2024-01" }),
    job({ start: "2023-01", end: null }),
    job({ start: "2024-01", end: "2024-07" }),
    job({ start: "2024-08", end: "2025-02" }),
  ];
  const stats = calculateTenureStats(jobs, TODAY);
  assert.ok(stats);
  assert.equal(stats!.consideredJobCount, 2);
});

test('a current ("atual") job counts its duration up to today', () => {
  const jobs: JobEntry[] = [
    job({ start: "2024-01", end: "2024-07" }), // 6 months
    job({ start: "2025-10", end: "atual" }), // ~12 months up to 2026-10-30
  ];
  const stats = calculateTenureStats(jobs, TODAY);
  assert.ok(stats);
  assert.equal(stats!.consideredJobCount, 2);
  assert.equal(stats!.shortStintCount, 1); // only the first one is short
});

test("area_fit nenhuma caps at 40 and wins over the permanence cap", () => {
  const jobs: JobEntry[] = [
    job({ start: "2024-01", end: "2024-07" }), // short
    job({ start: "2024-08", end: "2025-02" }), // short
  ];
  const cap = applyScoreCaps(90, jobs, "nenhuma", "Candidato de outra área, sem relação com a vaga.", TODAY);
  // Permanence cap (60) and area_fit cap (40) both apply — the lower wins.
  assert.equal(cap.cappedScore, 40);
  assert.equal(cap.alerts.length, 2);
});

test("area_fit baixa warns but does not cap the score", () => {
  const jobs: JobEntry[] = [job({ start: "2024-01", end: "2026-08" })];
  const cap = applyScoreCaps(85, jobs, "baixa", "Pouca sobreposição de área.", TODAY);
  assert.equal(cap.cappedScore, 85);
  assert.equal(cap.alerts.length, 1);
  assert.match(cap.alerts[0], /Pouca relação com a área/);
});

test("buildScoreReasoning puts alerts first, then the original/capped note, then the model reasoning", () => {
  const cap = { originalScore: 90, cappedScore: 60, alerts: ["⚠ Permanência baixa: ..."] };
  const text = buildScoreReasoning(cap, "Boa aderência técnica.");
  const lines = text.split("\n");
  assert.equal(lines[0], "⚠ Permanência baixa: ...");
  assert.equal(lines[1], "Nota original do modelo: 90, limitada a 60.");
  assert.equal(lines[2], "Boa aderência técnica.");
});

test("buildScoreReasoning omits the original/capped note when no cap applied", () => {
  const cap = { originalScore: 80, cappedScore: 80, alerts: [] as string[] };
  const text = buildScoreReasoning(cap, "Boa aderência.");
  assert.equal(text, "Boa aderência.");
});

test("parseModelScoreJson parses a well-formed response and clamps the score", () => {
  const result = parseModelScoreJson(
    JSON.stringify({
      jobs: [{ company: "Acme", title: "Dev", start: "2024-01", end: "atual", type: "clt" }],
      area_fit: "alta",
      area_fit_reason: "Mesma área.",
      score: 150,
      reasoning: "Ótima aderência.",
    })
  );
  assert.equal(result.score, 100);
  assert.equal(result.jobs.length, 1);
  assert.equal(result.area_fit, "alta");
});

test("parseModelScoreJson strips a markdown code fence", () => {
  const result = parseModelScoreJson(
    "```json\n" + JSON.stringify({ jobs: [], area_fit: "media", area_fit_reason: "", score: 70, reasoning: "ok" }) + "\n```"
  );
  assert.equal(result.score, 70);
});

test("parseModelScoreJson defaults a missing/invalid area_fit to media, never nenhuma", () => {
  const result = parseModelScoreJson(JSON.stringify({ jobs: [], score: 50, reasoning: "x" }));
  assert.equal(result.area_fit, "media");
});

test("computeFinalScore integrates model result + caps into the final score/reasoning", () => {
  const final = computeFinalScore(
    {
      jobs: [
        job({ start: "2024-01", end: "2024-07" }),
        job({ start: "2024-08", end: "2025-02" }),
      ],
      area_fit: "alta",
      area_fit_reason: "",
      score: 95,
      reasoning: "Boa aderência técnica.",
    },
    TODAY
  );
  assert.equal(final.score, 60);
  assert.match(final.scoreReasoning, /^⚠ Permanência baixa/);
  assert.match(final.scoreReasoning, /Boa aderência técnica\.$/);
});
