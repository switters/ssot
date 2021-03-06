
// yargs complains if it can't find a config file
process.env.SUPPRESS_NO_CONFIG_WARNING = true;

/**
 * SSOT: Tiny env var/cli arg resolver
 *
 * !!! PRECEDENCE MATTERS !!!
 *
 * Variable precedence (descending - lower precedence sources will be
 * over-written by higher precedence sources):
 *
 *  1. cli arguments
 *  2. process.env (incl cli supplied env vars)
 *  3. .env variables
 *  4. config/*.json variables
 *
 * Keys supplied in any manner will be upper-cased.
 */

/**
 * Make new object with all keys in UPPERCASE
 *
 * @param  {Object} obj Target object
 * @return {Object}     Copy of target with UPPERCASE keys
 */
function uppercase_obj (obj) {
  if (!obj) return {};

  Object.keys(obj).forEach(k => obj[k.toUpperCase()] = obj[k]);

  return obj;
}

/**
 * process.env serves as the defaults
 *
 * This also means that COMMAND_LINE_DECLARED=true node server.js
 * will be overwritten if variable of same name (case-insensitive)
 * defined in config folder, .env file, or as a cli argument.
 *
 * @type {Object}
 */
const node_env = process.env;

/**
 * config overwrites defaults
 *
 * config/default.json || config/development.json (higher precedence)
 * will be used if NODE_ENV not defined.
 *
 * Use config/production.json if NODE_ENV === 'production'
 *
 * See config documentation for details on default behavior:
 *   https://www.npmjs.com/package/config
 *
 * NOTES:
 *  - Case is insensitive: all keys will be upper-cased
 *  - config/*.json files should be flat, having depth === 1.
 *
 * @type {Object}
 */
const config = uppercase_obj(require('config'));

/**
 * .env file will overwrite config/*.json files and defaults
 *
 * Case is insensitive: all keys will be upper-cased
 *
 * @type {Object}
 */
const dotenv = uppercase_obj(require('dotenv').config().parsed);


/**
 * command line arguments will overwrite all other variables
 *
 * NOTES:
 *  - See yargs documentation for details on default behavior:
 *    https://www.npmjs.com/package/yargs
 *  - Case is insensitive: all keys will be uppercased
 *
 * @type {Object}
 */
const argv = uppercase_obj(require('yargs').argv);

/**
 * export ssot
 *
 * @type {Object}
 */
module.exports = Object.freeze(Object.assign({}, config, dotenv, node_env, argv));
