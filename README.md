# Introduction

ssot is a tiny library for bringing together command-line-supplied config variables with environment variables from various sources into one immutable object, one single source of truth.

Benefits:

1. A uniform way to access a unified, immutable list of your env vars/cli args from anywhere in your app.
2. Rapid modification of env vars from the command-line without reaching into your env files, for example: tweaking DB connections params while speed testing.

Readme clarity: wip.

# Sources

ssot uses three commonly used packages to collect configuration and/or environment variables:

- [yargs](https://www.npmjs.com/package/yargs) to collect arbitrary command line arguments, eg. `node server.js --port 3000`.
- [dotenv](https://www.npmjs.com/package/dotenv) to read environment variables from a file located at `./.env`.
- [config](https://www.npmjs.com/package/config) to read environment variables from json files within `./config`.

Note: `process.env` should also be considered a source of truth. It represents the user environment according to node and includes environment variables supplied in the command line, eg. `MY_VAR=some_string node server.js`.

More on [`process.env` here](https://nodejs.org/api/process.html#process_process_env).

# Getting Started

Install the npm package, saving to your dependencies:
```
npm install --save ssot
```

Create a .env file, and/or a config folder with development.json and production.json:

```
// project dir (root)

./config/development.json
./config/production.json
./.env

```

Populate files with variables:

```
// config/development.json
{
    "x": "x_config_dev",
    "y": "y_config_dev",
    "z": "z_config_dev"
}

// config/production.json
{
    "w": "w_config_prod"
    "y": "y_config_prod",
    "z": "z_config_prod"
}

// .env
X="x_env"
Z="z_env"

```

Create a test script or require ssot in any existing file:

```
// test.js

const { W, X, Y, Z, ARBIT } = require('ssot');
console.log("Vars:", W, X, Y, Z, ARBIT);

```

Run from command line:

```

// config/development.json is read, .env over-writes, no ARBIT
# node test.js
    //=> Vars: undefined x_env config_dev_y z_env undefined

// config/production.json is read, .env over-writes, no ARBIT
# NODE_ENV=production node test.js
    //=> Vars: w_config_prod x_env y_config_prod z_env undefined

// config/development.json is read, .env over-writes, no ARBIT
# NODE_ENV=development ARBIT=arbitrary node test.js
    //=> Vars: w_config_dev x_env y_config_dev z_env arbitrary

// config/production.json is read, .env over-writes, cli over-writes
# NODE_ENV=production node test.js --w w_cli --arbit 42
    //=> Vars: w_cli x_env y_config_prod z_env 42

```

# Precedence

None or all of these config/env var sources may be used.

If more than one is used and they define a value for the same variable, a static precedence hierarchy defines how such conflicts will be settled.

Precedence in brief:

### cli args > process.env > .env > .config/*.json
(highest)...........................................................(lowest)

## Precedence Hierarchy (descending)

## cli arguments

Arbitrarily supplied command line arguments win all arguments:

- will **never** be **over-written**
- will always **over-write**

See the [yargs readme](https://www.npmjs.com/package/yargs) for details on default behavior.

## process.env
`process.env` is node.js' representation of the user environment. It includes environment variables supplied in the commandline, eg. `MY_VAR=some_string node server.js`.

It:

- will be **over-written** by command line arguments.
- will **over-write** values stored in `./.env` or `./config/*.json` files.

See the [node docs](https://nodejs.org/api/process.html#process_process_env) for details on default behavior.

## .env
Variables loaded from the `./.env` file:

- will be **over-written** by command line arguments and `process.env` variables (including environment variables supplied in the command-line: eg, `MY_VAR=some_string node server.js`).
- will **over-write** those values stored in `./config/*.json` files.

See the [dotenv readme](https://www.npmjs.com/package/dotenv) for details on expected setup and default behaviour.

## config
Environment variables loaded by config from `./config/*.json`:

- will be **over-written** by all other sources: `./.env` variables, command line arguments, and `process.env` variables (including environment variables supplied in the command-line: eg, `MY_VAR=some_string node server.js`).

The config folder is best used to supply variable templates and defaults for various environments.

The config source is sensitive to the `NODE_ENV` variable:
- If `NODE_ENV` is undefined, the `./config/development.json` or `./config/defaults.json` file will be loaded.
- If `NODE_ENV` is equal to `production`, the `./config/production.json` file will be loaded.
- Etc.

See the [config readme](https://www.npmjs.com/package/config) for details on expected setup and default behaviour.
