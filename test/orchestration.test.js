const test = require('node:test');
const assert = require('node:assert/strict');

const { OpenShellSandbox } = require('../src/openshell-sandbox');
const { NemoClawOrchestrator } = require('../src/nemoclaw-orchestrator');
const { OpenClawOperatorAgent } = require('../src/openclaw-agent');
const { MultiStepPlanner } = require('../src/multi-step-planner');

test('OpenShell sandbox can execute a simple command', async () => {
  const sandbox = new OpenShellSandbox({ image: 'alpine:3.20' });
  const result = await sandbox.run('echo nemo');

  assert.equal(result.exitCode, 0);
  assert.match(result.stdout, /nemo/);
});

test('NemoClaw orchestrator and OpenClaw agent complete a task end to end', async () => {
  const sandbox = new OpenShellSandbox({ image: 'alpine:3.20' });
  const agent = new OpenClawOperatorAgent();
  const orchestrator = new NemoClawOrchestrator({ sandbox, agent });

  const response = await orchestrator.execute('create a short greeting for NemoClaw');

  assert.equal(response.status, 'ok');
  assert.match(response.summary, /greeting/i);
  assert.match(response.stdout, /nemo|claw/i);
});

test('Multi-step planner expands a task into multiple execution steps', () => {
  const planner = new MultiStepPlanner();
  const plan = planner.createPlan('create a short greeting for NemoClaw');

  assert.ok(plan.steps.length >= 2);
  assert.match(plan.steps[0].description, /analyze|plan/i);
  assert.match(plan.steps[1].command, /printf|echo/i);
});
