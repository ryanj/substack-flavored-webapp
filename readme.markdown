Here are some tiny modules I like to glue together to build webapps.

This example only includes the backend components.

# modules

* [tcp-bind](https://npmjs.org/package/tcp-bind) - allocate a low port before
  dropping privileges
* [routes](https://npmjs.org/package/routes) - organize routing
* [body](https://npmjs.org/package/body) - parse incoming form data
* [minimist](https://npmjs.org/package/minimist) - parse arguments
* [ecstatic](https://npmjs.org/package/ecstatic) - serve static files

# as it grows

As the server file gets bigger, I start moving functions and route handlers into
`lib/` or `lib/routes` or someplace like that.

An example route file in `lib/` would look like:

``` js
module.exports = function (req, res, params) {
    res.end('beep boop\n');
};
```

and then in the `server.js` I can do:

```
router.addRoute('/whatever', require('./lib/someroute.js'));
```

or if the route needs some extra information, I can return a function in the
route instead:

``` js
module.exports = function (msg) {
    return function (req, res, params) {
        res.end(msg + '\n');
    };
};
```

and then in `server.js`:

``` js
router.addRoute('/whatever', require('./lib/someroute.js')('beep boop'));
```

I try to only pass in the information that a route directly needs, since that
keeps the code less coupled to my application.

Try to avoid passing around an `app` object to everywhere since that can create
huge problems later when refactoring and the code can become very coupled. It
might be ok to pass a `bus` object around liberally so long as only handles
dispatching events.

# running the server

To run the server for development, do:

```
$ npm start
```

To run the server on port 80 for production, do:

```
$ sudo node server.js -u $USER -g $USER 
```

