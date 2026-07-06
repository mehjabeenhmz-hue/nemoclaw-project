# nemoclaw-project

This workspace now includes a production-style architecture for NemoClaw and OpenClaw:

- NemoClaw orchestration layer for executing tasks through a sandboxed runtime
- OpenShell sandbox boundary backed by the active Docker daemon
- OpenClaw operator agent for turning user tasks into runnable commands
- Multi-step planning so tasks can be executed as an ordered plan of steps
- Containerization via Dockerfile and configuration files for operator settings

## Usage

Run the onboarding demo:

```bash
npm start
```

Run the verification tests:

```bash
npm test
```

Build the container image:

```bash
docker build -t nemoclaw-project .
```

## Configuration

Operator settings are provided in the config directory:

- config/openclaw.json
- config/openclaw.env
