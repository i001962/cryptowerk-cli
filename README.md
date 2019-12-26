# cw

Cryptowerk CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cw.svg)](https://npmjs.org/package/cw)
[![Downloads/week](https://img.shields.io/npm/dw/cw.svg)](https://npmjs.org/package/cw)
[![License](https://img.shields.io/npm/l/cw.svg)](https://github.com/i001962/cw/blob/master/package.json)

<!-- toc -->

- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g cw
$ cw COMMAND
running command...
$ cw (-v|--version|version)
cw/0.0.0 darwin-x64 node-v10.16.3
$ cw --help [COMMAND]
USAGE
  $ cw COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`cw config`](#cw-config)
- [`cw hash [FILE]`](#cw-hash-file)
- [`cw help [COMMAND]`](#cw-help-command)
- [`cw register [HASH]`](#cw-register-hash)
- [`cw retrieve`](#cw-retrieve)
- [`cw start`](#cw-start)
- [`cw store`](#cw-store)
- [`cw verify`](#cw-verify)

## `cw config`

Prompts to Setup .env file for:

```
USAGE
  $ cw config

OPTIONS
  -h, --help  show CLI help

DESCRIPTION
  Prompts to Setup .env file for:
     APIKEY=
     APICRED=
     ENDPOINT= e.g. https://developers.cryptowerk.com/platform/API/v8/
     Visit http://developer.cryptowerk.com to register.
```

_See code: [src/commands/config.ts](https://github.com/i001962/cw/blob/v0.0.0/src/commands/config.ts)_

## `cw hash [FILE]`

describe the command here

```
USAGE
  $ cw hash [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print
```

_See code: [src/commands/hash.ts](https://github.com/i001962/cw/blob/v0.0.0/src/commands/hash.ts)_

## `cw help [COMMAND]`

display help for cw

```
USAGE
  $ cw help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `cw register [HASH]`

Register hash(es) to several blockchains

```
USAGE
  $ cw register [HASH]

OPTIONS
  -h, --help   show CLI help

  --hash=hash  Sha256 hash to register.
               More than one hash? Seperate with comma no spaces.

DESCRIPTION
  Register hash(es) to several blockchains
       and obtain retrievalID.
       Us verify command for a link to proof.
```

_See code: [src/commands/register.ts](https://github.com/i001962/cw/blob/v0.0.0/src/commands/register.ts)_

## `cw retrieve`

Retrieve Seals as link to proofs on several blockchains

```
USAGE
  $ cw retrieve

OPTIONS
  -h, --help               show CLI help
  -r, --retrieve=retrieve  Poll for Seals using retrievalIDs.

DESCRIPTION
  Retrieve Seals as link to proofs on several blockchains
```

_See code: [src/commands/retrieve.ts](https://github.com/i001962/cw/blob/v0.0.0/src/commands/retrieve.ts)_

## `cw start`

```
USAGE
  $ cw start

OPTIONS
  --stage=development|staging|production
```

_See code: [src/commands/start.ts](https://github.com/i001962/cw/blob/v0.0.0/src/commands/start.ts)_

## `cw verify`

Verify hash with Seal

```
USAGE
  $ cw verify

OPTIONS
  -h, --help       show CLI help
  -s, --seal=seal  Verify hashes with Seals.
  --hash=hash      Verify hashes with Seals.

DESCRIPTION
  Verify hash with Seal
```

_See code: [src/commands/verify.ts](https://github.com/i001962/cw/blob/v0.0.0/src/commands/verify.ts)_

<!-- commandsstop -->
