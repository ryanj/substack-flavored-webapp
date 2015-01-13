Here are some tiny modules I like to glue together to build webapps.

This example only includes the backend components.

# modules

* [tcp-bind](https://npmjs.org/package/tcp-bind) - allocate a low port before
  dropping privileges
* [routes](https://npmjs.org/package/routes) - organize routing
* [body](https://npmjs.org/package/body) - parse incoming form data
* [minimist](https://npmjs.org/package/minimist) - parse arguments
* [ecstatic](https://npmjs.org/package/ecstatic) - serve static files

# running the server

To run the server for development, do:

```
$ npm start
```

To run the server on port 80 for production, do:

```
$ sudo node server.js -u $USER -g $USER 
```

