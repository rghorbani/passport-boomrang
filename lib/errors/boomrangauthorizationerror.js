/**
 * `BoomrangAuthorizationError` error.
 *
 * BoomrangAuthorizationError represents an error in response to an
 * authorization request on Boomrang.  Note that these responses don't conform
 * to the OAuth 2.0 specification.
 *
 * References:
 *   - None
 *
 * @constructor
 * @param {String} [message]
 * @param {Number} [code]
 * @api public
 */
function BoomrangAuthorizationError(message, code) {
	Error.call(this);
	Error.captureStackTrace(this, arguments.callee);
	this.name = 'BoomrangAuthorizationError';
	this.message = message;
	this.code = code;
	this.status = 500;
}

/**
 * Inherit from `Error`.
 */
BoomrangAuthorizationError.prototype.__proto__ = Error.prototype;


/**
 * Expose `BoomrangAuthorizationError`.
 */
module.exports = BoomrangAuthorizationError;
