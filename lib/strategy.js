/**
 * Module dependencies.
 */
var uri = require('url'),
	util = require('util'),
	OAuth2Strategy = require('passport-oauth2'),
	InternalOAuthError = require('passport-oauth2').InternalOAuthError,
	BoomrangAuthorizationError = require('./errors/boomrangauthorizationerror'),
	BoomrangTokenError = require('./errors/boomrangtokenerror');


/**
 * `Strategy` constructor.
 *
 * The Boomrang authentication strategy authenticates requests by delegating to
 * Boomrang using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Boomrang application's App ID
 *   - `clientSecret`  your Boomrang application's App Secret
 *   - `callbackURL`   URL to which Boomrang will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new BoomrangStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/boomrang/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
	options = options || {};
	options.authorizationURL = options.authorizationURL || 'https://pfm.abplus.ir/api/oauth2/authorize';
	options.tokenURL = options.tokenURL || 'https://pfm.abplus.ir/api/oauth2/token';
	options.scope = options.scope || '';
	options.scopeSeparator = options.scopeSeparator || ',';
	var authString = new Buffer(options.clientID+':'+options.clientSecret);
	options.customHeaders = {
		"Authorization": "Basic " + authString.toString('base64')
	};
	function customVerify (accessToken, refreshToken, params, profile, done) {
		profile.scope = accessToken.scopes.toString();
		profile.scopes = accessToken.scopes;
		verify(accessToken.value, profile, done);
	};

	OAuth2Strategy.call(this, options, customVerify);
	this.name = 'boomrang';
	this._clientSecret = options.clientSecret;
	this._profileURL = options.profileURL || 'https://pfm.abplus.ir/api/service/user/';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Authenticate request by delegating to Boomrang using OAuth 2.0.
 *
 * @param {Object} req
 * @param {Object} options
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
	// Boomrang doesn't conform to the OAuth 2.0 specification, with respect to
	// redirecting with error codes.
	//
	//   FIX: https://github.com/jaredhanson/passport-oauth/issues/16
	if (req.query && req.query.error_code && !req.query.error) {
		return this.error(new BoomrangAuthorizationError(req.query.error_message, parseInt(req.query.error_code, 10)));
	}

	OAuth2Strategy.prototype.authenticate.call(this, req, options);
};

/**
 * Retrieve user profile from Boomrang.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `boomrang`
 *   - `emails`           the proxied or contact email address granted by the user
 *   - `address`          the user's address
 *   - `mobile`           the user's mobile
 *   - `nationalId`       the user's National ID
 *   - `cif`              the user's CIF
 *   - `firstName`        the user's first name
 *   - `lastName`         the user's last name
 *   - `created`          the user's time of account creation
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {
	var url = uri.parse(this._profileURL + accessToken.userId);
	accessToken = accessToken.value;
	if (this._profileFields) {
		var fields = this._convertProfileFields(this._profileFields);
		if (fields !== '') { url.search = (url.search ? url.search + '&' : '') + 'fields=' + fields; }
	}
	url = uri.format(url);

	this._oauth2.setAuthMethod('Bearer');
	this._oauth2.useAuthorizationHeaderforGET(true);
	this._oauth2.get(url, accessToken, function (err, body, res) {
		var json;

		if (err) {
			if (err.data) {
				try {
					json = JSON.parse(err.data);
				} catch (_) {}
			}

			if (json && json.error && typeof json.error == 'object') {
				return done(new BoomrangAPIError(json.error.message, json.error.type, json.error.code, json.error.error_subcode));
			}
			return done(new InternalOAuthError('Failed to fetch user profile', err));
		}

		try {
			json = JSON.parse(body);
		} catch (ex) {
			return done(new Error('Failed to parse user profile'));
		}

		var profile = json;
		profile.provider = 'boomrang';
		// profile._raw = body;
		// profile._json = json;

		done(null, profile);
	});
};

/**
 * Parse error response from Boomrang OAuth 2.0 token endpoint.
 *
 * @param {String} body
 * @param {Number} status
 * @return {Error}
 * @api protected
 */
Strategy.prototype.parseErrorResponse = function(body, status) {
	var json = JSON.parse(body);
	if (json.error && typeof json.error == 'object') {
		return new BoomrangTokenError(json.error.message, json.error.type, json.error.code, json.error.error_subcode);
	}

	return OAuth2Strategy.prototype.parseErrorResponse.call(this, body, status);
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
