import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCENARIO_RECIPES,
  detectGuideLanguage,
  listScenarioRecipes,
  publicGuideData,
  recommendScenario,
} from '../recipes/scenarios.mjs';

test('guide: exposes unique recipes across every diagram type', () => {
  assert.equal(SCENARIO_RECIPES.length, 22);
  assert.equal(new Set(SCENARIO_RECIPES.map((recipe) => recipe.id)).size, 22);
  assert.deepEqual(
    Object.fromEntries(['architecture', 'workflow', 'sequence', 'dataflow', 'lifecycle'].map((type) => [
      type,
      SCENARIO_RECIPES.filter((recipe) => recipe.type === type).length,
    ])),
    { architecture: 5, workflow: 5, sequence: 4, dataflow: 5, lifecycle: 3 },
  );
});

test('guide: every recipe has complete English decision copy', () => {
  for (const recipe of SCENARIO_RECIPES) {
    assert.match(recipe.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(recipe.signals.length >= 5, recipe.id);
    assert.ok(['classic', 'signal-flow', 'blueprint', 'editorial'].includes(recipe.presentation.preset), recipe.id);
    const copy = recipe.en;
    assert.ok(copy.title.length >= 4, `${recipe.id}.en.title`);
    for (const field of ['question', 'summary', 'useWhen', 'avoidWhen', 'prompt']) {
      assert.ok(copy[field].length > 10, `${recipe.id}.en.${field}`);
    }
    assert.equal(copy.include.length, 4, `${recipe.id}.en.include`);
  }
});

test('guide: language detection stays English', () => {
  assert.equal(detectGuideLanguage('show an API request'), 'en');
  assert.equal(detectGuideLanguage('anything else'), 'en');
  assert.equal(listScenarioRecipes()[0].title, 'Business operating map');
});

test('guide: representative scenarios map to specialized recipes', () => {
  const cases = [
    ['Show an API request with Redis cache miss', 'api-request'],
    ['Show CI/CD build deploy rollback', 'delivery-workflow'],
    ['Show Kafka topic consumer group and dead letter', 'event-stream'],
    ['ETL warehouse PII data lineage', 'data-lineage'],
    ['deployment lifecycle approval rollback state', 'deployment-lifecycle'],
    ['agent tool call approval gate MCP', 'agent-tool-call'],
    ['why Shopify revenue is not QBO', 'finance-revenue-walk'],
    ['how does this company make money', 'finance-money-map'],
    ['Walk one order from cart to GL', 'finance-order-path'],
    ['month-end close period lock', 'finance-close'],
    ['refund vs dispute chargeback', 'finance-dispute-lifecycle'],
    ['Stripe payout rec vs bank', 'finance-payout-rec'],
    ['who owes us sales receipt vs invoice', 'finance-customer-ar'],
    ['can we make payroll Friday', 'finance-cash-runway'],
  ];

  for (const [query, expected] of cases) {
    assert.equal(recommendScenario(query).recommendation.id, expected, query);
  }
});

test('guide: exact ids win and unknown questions fall back honestly', () => {
  const exact = recommendScenario('incident-runbook');
  assert.equal(exact.recommendation.id, 'incident-runbook');
  assert.equal(exact.confidence, 'high');

  const unknown = recommendScenario('make it delightful');
  assert.equal(unknown.recommendation.id, 'business-operating-map');
  assert.equal(unknown.confidence, 'low');
  assert.deepEqual(unknown.matchedSignals, []);
});

test('guide: public data includes English copy and weighted signals', () => {
  const data = publicGuideData();
  assert.equal(data.length, 22);
  for (const recipe of data) {
    assert.ok(recipe.en.title);
    assert.ok(recipe.proof, `${recipe.id}: verified proof is required`);
    assert.ok(recipe.signals.every(([signal, weight]) => typeof signal === 'string' && weight > 0));
  }
});
