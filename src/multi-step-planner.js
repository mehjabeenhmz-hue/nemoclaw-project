class MultiStepPlanner {
  createPlan(task) {
    const normalized = task.toLowerCase();
    const steps = [
      {
        id: 'analyze',
        description: `Analyze the request: ${task}`,
        command: `printf 'Plan: ${task}\\n'`,
      },
    ];

    if (normalized.includes('greeting')) {
      steps.push({
        id: 'compose',
        description: 'Compose a greeting response',
        command: `printf 'Hello from NemoClaw and OpenClaw!\\n'`,
      });
    } else {
      steps.push({
        id: 'respond',
        description: 'Produce a concise response',
        command: `printf 'Task received: ${task}\\n'`,
      });
    }

    return { task, steps };
  }
}

module.exports = { MultiStepPlanner };
