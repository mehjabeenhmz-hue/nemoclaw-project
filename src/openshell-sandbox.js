const { spawn } = require('node:child_process');

class OpenShellSandbox {
  constructor({ image = 'alpine:3.20', docker = 'docker' } = {}) {
    this.image = image;
    this.docker = docker;
  }

  async run(command, { timeoutMs = 120000 } = {}) {
    return new Promise((resolve, reject) => {
      const args = ['run', '--rm', '--network=none', this.image, 'sh', '-c', command];
      const child = spawn(this.docker, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      let finished = false;

      const timer = setTimeout(() => {
        if (!finished) {
          finished = true;
          child.kill('SIGTERM');
          reject(new Error(`Command timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      child.stdout.on('data', (chunk) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          reject(error);
        }
      });

      child.on('close', (code) => {
        if (!finished) {
          finished = true;
          clearTimeout(timer);
          resolve({ exitCode: code ?? 1, stdout, stderr });
        }
      });
    });
  }
}

module.exports = { OpenShellSandbox };
