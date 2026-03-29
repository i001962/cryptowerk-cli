# cryptowerk-cli

Cryptowerk CLI – blockchain notarization skill for AI agents.

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cryptowerk-cli.svg)](https://npmjs.org/package/cryptowerk-cli)
[![License](https://img.shields.io/npm/l/cryptowerk-cli.svg)](https://github.com/i001962/cryptowerk-cli/blob/master/package.json)

Hash documents, register them to multiple blockchains, retrieve cryptographic seal proofs, and verify document integrity — all via the [Cryptowerk](https://developer.cryptowerk.com) platform.

<!-- toc -->

- [Installation](#installation)
- [Usage](#usage)
- [Commands](#commands)
- [Agent / Skill Usage](#agent--skill-usage)

<!-- tocstop -->

## Installation

```sh-session
$ npm install -g cryptowerk-cli
$ cw --version
$ cw --help
```

## Usage

<!-- usage -->

```sh-session
$ cw COMMAND [OPTIONS]
```

<!-- usagestop -->

## Commands

<!-- commands -->

### `cw config`

Configure the `.env` file with Cryptowerk API credentials.

```
USAGE
  $ cw config [OPTIONS]

OPTIONS
  -h, --help            show CLI help
  --api-key=KEY         Cryptowerk API key (non-interactive)
  --api-cred=CRED       Cryptowerk API credential (non-interactive)
  -e, --endpoint=URL    API endpoint URL with trailing slash (non-interactive)
  --json                Output result as JSON

EXAMPLES
  # Interactive (prompts for credentials)
  $ cw config

  # Non-interactive (agent mode)
  $ cw config --api-key <KEY> --api-cred <CRED> --endpoint https://developers.cryptowerk.com/platform/API/v8/ --json
```

### `cw hash`

Compute the SHA256 hash of a file, register it to blockchains, and save a `_seal.json` alongside it.

```
USAGE
  $ cw hash [OPTIONS]

OPTIONS
  -h, --help        show CLI help
  -f, --file=FILE   Path to the file to hash and register (skips interactive picker)
  --json            Output result as JSON

EXAMPLES
  # Interactive (file tree picker)
  $ cw hash

  # Non-interactive (agent mode)
  $ cw hash --file ./docs/contract.pdf --json
```

### `cw register`

Register a pre-computed SHA256 hash (or comma-separated list of hashes) to blockchains.

```
USAGE
  $ cw register --hash HASH [OPTIONS]

OPTIONS
  -h, --help        show CLI help
  -H, --hash=HASH   SHA256 hash(es) to register, comma-separated (required)
  --json            Output result as JSON

EXAMPLES
  $ cw register --hash abc123def456 --json
  $ cw register --hash abc123,def456 --json
```

### `cw retrieve`

Poll the Cryptowerk API to retrieve blockchain seal proofs for previously registered hashes.

```
USAGE
  $ cw retrieve [OPTIONS]

OPTIONS
  -h, --help                    show CLI help
  -f, --file=FILE               Path to a _seal.json file (skips interactive picker)
  -r, --retrieval-id=IDS        Comma-separated retrievalId(s) to poll
  --json                        Output result as JSON

EXAMPLES
  # Interactive
  $ cw retrieve

  # From a seal file (agent mode)
  $ cw retrieve --file ./docs/contract.pdf_seal.json --json

  # From retrieval IDs directly
  $ cw retrieve --retrieval-id <id1>,<id2> --json
```

### `cw verify`

Verify that a document's current SHA256 hash matches its blockchain seal.

```
USAGE
  $ cw verify [OPTIONS]

OPTIONS
  -h, --help              show CLI help
  -s, --seal-file=FILE    Path to the _seal.json file (skips interactive picker)
  -d, --doc-file=FILE     Path to the original document (derived from seal file if omitted)
  --json                  Output result as JSON

EXAMPLES
  # Interactive
  $ cw verify

  # Non-interactive (agent mode)
  $ cw verify --seal-file ./docs/contract.pdf_seal.json --json
```

### `cw start`

Launch an interactive menu to access all commands.

```
USAGE
  $ cw start
```

### `cw help [COMMAND]`

Display help for a command.

```
USAGE
  $ cw help [COMMAND]

OPTIONS
  --all  show all commands
```

<!-- commandsstop -->

## Agent / Skill Usage

This CLI is designed to be used as a **skill by AI agents**. Every command supports:

- **`--json` flag** — all output is structured JSON, making it easy for agents to parse results.
- **Non-interactive flags** — bypass all `inquirer` prompts; pass file paths and IDs directly.
- **`skill.json`** — an OpenAI-compatible tool definition file at the repo root, ready to register with any agent framework.

### skill.json

The `skill.json` file at the repo root describes all five tools in OpenAI function-calling format:

```sh-session
$ npm run skill   # prints skill.json to stdout
```

Load it into your agent with:

```javascript
const skill = require('./skill.json');
// skill.tools is an array of OpenAI-compatible tool definitions
```

### Typical agent workflow

```sh-session
# 1. Configure credentials (once)
$ cw config --api-key <KEY> --api-cred <CRED> \
    --endpoint https://developers.cryptowerk.com/platform/API/v8/ --json

# 2. Hash & register a document
$ cw hash --file ./docs/contract.pdf --json
# → { "file": "...", "hash": "...", "sealFile": "..._seal.json", "documents": [...] }

# 3. Poll until the seal is anchored to the blockchain
$ cw retrieve --file ./docs/contract.pdf_seal.json --json
# → { "retrievalIds": [...], "result": { "documents": [...] } }

# 4. Verify document integrity
$ cw verify --seal-file ./docs/contract.pdf_seal.json --json
# → { "docFile": "...", "sealFile": "...", "hash": "...", "verified": true }
```

### Environment variables

All API configuration can also be supplied via environment variables (useful in CI/CD or agent runtimes):

| Variable   | Description                                |
|------------|--------------------------------------------|
| `APIKEYS`  | `<api-key> <api-cred>` separated by a space |
| `ENDPOINT` | API endpoint URL with trailing slash        |
