class OpenClawOperatorAgent {
  plan(task) {
    const normalized = task.toLowerCase();

    if (normalized.includes('greeting')) {
      return {
        kind: 'greeting',
        command: `printf 'Hello from NemoClaw and OpenClaw!\\n'`,
      };
    }

    return {
      kind: 'generic',
      command: `printf 'Task received: ${task}\\n'`,
    };
  }
}

module.exports = { OpenClawOperatorAgent };
