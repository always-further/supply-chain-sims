# npm Install Scripts Simulator

This is a harmless npm package for Runseal supply-chain examples. It has
`preinstall` and `postinstall` lifecycle scripts that simulate the behavior we
want to defend against: package install code attempting to POST metadata to an
external API.

The package does **not** read secrets, tokens, SSH keys, source files, or git
configuration. It sends only benign runtime metadata such as the lifecycle event
name, package name, Node version, platform, architecture, hostname, and current
directory basename.

## Lifecycle Scripts

```json
{
  "scripts": {
    "preinstall": "node scripts/lifecycle.js preinstall",
    "postinstall": "node scripts/lifecycle.js postinstall"
  }
}
```

By default the scripts try to POST to:

```text
https://example.com/runseal/supply-chain-sim/npm-install-script
```

Override the target with:

```bash
SUPPLY_CHAIN_SIM_ENDPOINT=http://127.0.0.1:18081/npm-install-script
```

By default network failures are logged but do not fail installation. To make a
blocked network attempt fail the install step, set:

```bash
SUPPLY_CHAIN_SIM_FAIL_ON_ERROR=1
```

To disable the simulator:

```bash
SUPPLY_CHAIN_SIM_DISABLE=1
```

## Local Use

From a separate test project:

```bash
npm install /path/to/supply-chain-sims/npm-install-scripts
```

To force lifecycle network failures to fail the install:

```bash
SUPPLY_CHAIN_SIM_FAIL_ON_ERROR=1 \
npm install /path/to/supply-chain-sims/npm-install-scripts
```

## Runseal Demo Use

This fixture is useful for showing the difference between:

```bash
npm ci --ignore-scripts
```

and:

```bash
npm rebuild
```

with `network.mode: blocked`.

The expected Runseal result is that lifecycle scripts can run if explicitly
needed, but their network attempt is denied by the sandbox.
