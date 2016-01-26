# passport-boomrang

[Passport](http://passportjs.org/) strategy for authenticating with [Boomrang](http://pfm.abplus.ir/)
using the OAuth 2.0 API.

This module lets you authenticate using Boomrang in your Node.js applications.
By plugging into Passport, Boomrang authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

## Install

    $ npm install passport-boomrang

## Usage

#### Configure Strategy

The Boomrang authentication strategy authenticates users using a ABPlus
account and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which
accepts these credentials and calls `done` providing a user, as well as
`options` specifying an app ID, app secret, callback URL.

    passport.use(new BoomrangStrategy({
        clientID: BOOMRANG_APP_ID,
        clientSecret: BOOMRANG_APP_SECRET,
        scope: "adanalas:user:get",
        callbackURL: "http://localhost:3000/auth/boomrang/callback"
      },
      function(accessToken, profile, done) {
        User.findOrCreate({ boomrangId: profile.nationalId }, function (err, user) {
          return done(err, user);
        });
      }
    ));

#### Authenticate Requests

Use `passport.authenticate()`, specifying the `'boomrang'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

    app.get('/auth/boomrang',
      passport.authenticate('boomrang'));

    app.get('/auth/boomrang/callback',
      passport.authenticate('boomrang', { failureRedirect: '/login' }),
      function(req, res) {
        // Successful authentication, redirect home.
        res.redirect('/');
      });

## Examples

For a complete, working example, refer to the [login example](https://github.com/rghorbani/passport-boomrang/tree/master/examples/login).

## Tests

    $ npm install
    $ npm test

## Credits

  - [Reza Ghorbani Farid](http://github.com/rghorbani)

## License

[The MIT License](http://opensource.org/licenses/MIT)

Copyright (c) 2015 Reza Ghorbani Farid <[http://rghorbani.ir](http://rghorbani.ir)>
