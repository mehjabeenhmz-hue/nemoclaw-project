class NemoClawOrchestrator {
  constructor({ sandbox, agent, planner }) {
    this.sandbox = sandbox;
    this.agent = agent;
    this.planner = planner;
  }

  async execute(task) {
    const agentPlan = this.agent.plan(task);
    const plan = this.planner ? this.planner.createPlan(task) : { task, steps: [{ command: agentPlan.command }] };

    const stepResults = [];
    for (const step of plan.steps) {
      const result = await this.sandbox.run(step.command);
      stepResults.push({
        id: step.id,
        description: step.description,
        exitCode: result.exitCode,
        stdout: result.stdout.trim(),
        stderr: result.stderr.trim(),
      });

      if (result.exitCode !== 0) {
        return {
          status: 'error',
          summary: `Failed ${task} during ${step.id}`,
          stdout: result.stdout.trim(),
          stderr: result.stderr.trim(),
          steps: stepResults,
        };
      }
    }

    const combinedOutput = stepResults.map((step) => step.stdout).filter(Boolean).join('\n');

    return {
      status: 'ok',
      summary: `Completed ${task} via ${agentPlan.kind} with ${plan.steps.length} steps`,
      stdout: combinedOutput,
      stderr: stepResults.map((step) => step.stderr).filter(Boolean).join('\n'),
      steps: stepResults,
    };
  }
}

module.exports = { NemoClawOrchestrator };
