Here are some tiny backend node modules I like to glue together to build
webapps.

This example only includes the backend components.

# modules

* [tcp-bind](https://npmjs.org/package/tcp-bind) - allocate a low port before
  dropping privileges
* [routes](https://npmjs.org/package/routes) - organize routing
* [ecstatic](https://npmjs.org/package/ecstatic) - serve static files
* [body](https://npmjs.org/package/body) - parse incoming form data
* [trumpet](https://www.npmjs.com/package/trumpet) - insert html into layouts

## tcp-bind

This module will allocate a port so that you can allocate as root and then drop
down into a non-root user after the port has been allocated:

``` js
var alloc = require('tcp-bind');
// ...
var fd = alloc(argv.port);
if (argv.gid) process.setgid(argv.gid);
if (argv.uid) process.setuid(argv.uid);
```

Specify the user and group to drop into with `-g` and `-u`.

## routes

The `routes` module is handy for decomposing the different routes of your
webapp.

Create a router with:

``` js
var router = require('routes')();
```

then you can add routes with:

``` js
router.addRoute('/robots/:name', function (req, res, params) {
    res.end('hello ' + params.name);
});
```

In the `http.createServer()` handler function, we can dispatch our routes using:

``` js
var m = router.match(req.url);
if (m) m.fn(req, res, m.params);
```

and then have some fallback handlers if none of the routes matched, like to
ecstatic.

## ecstatic

To serve static assets out of `static/`, I use ecstatic:

``` js
var st = require('ecstatic')(__dirname + '/static');
```

and then in the `http.createServer()` function you can do:

``` js
st(req, res)
```

## body

To parse form parameters, I use the `body` module:

``` js
body(req, res, function (err, params) { /* ... */})
```

or i have a nifty little wrapper function:

``` js
function post (fn) {
    return function (req, res, params) {
        if (req.method !== 'POST') {
            res.statusCode = 400;
            res.end('not a POST\n');
        }
        body(req, res, function onbody (err, pvars) {
            fn(req, res, xtend(pvars, params));
        });
    };
}
```

so that I can wrap an entire route handler in a `post()`:

``` js
router.addRoute('/submit', post(function (req, res) {
    console.log(params);
    res.end('ok!\n');
}));
```

It might be handy to publish some of these little functions individually to npm
but I haven't done that yet.

## trumpet

trumpet is a nifty module for pumping content into some html at a css selector.

I use it to make a little layout function:

```
function layout (res) {
    res.setHeader('content-type', 'text/html');
    var tr = trumpet();
    read('layout.html').pipe(tr).pipe(res);
    return tr.createWriteStream('#body');
}
```

and then in `static/layout.html` I have an empty element with an id of `body`:

``` html
<html>
  <body>
    <h1>my way cool website</h1>
    <div id="body"></div>
  </body>
</body>
```

Also check out [hyperstream](https://npmjs.org/package/hyperstream), which uses
trumpet but lets you specify many selectors at once.

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

