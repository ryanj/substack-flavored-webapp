var alloc = require('tcp-bind');
var minimist = require('minimist');
var argv = minimist(process.argv.slice(2), {
    alias: { p: 'port', u: 'uid', g: 'gid' },
    default: { port: require('is-root')() ? 80 : 8000 }
});
var fd = alloc(argv.port);
if (argv.gid) process.setgid(argv.gid);
if (argv.uid) process.setuid(argv.uid);

var http = require('http');
var ecstatic = require('ecstatic')(__dirname + '/static');
var body = require('body/any');
var xtend = require('xtend');
var trumpet = require('trumpet');
var through = require('through2');
var encode = require('he').encode;
var fs = require('fs');
var path = require('path');

var router = require('routes')();
router.addRoute('/', function (req, res, params) {
    layout(res).end('welcome!');
});
router.addRoute('/hello/:name', function (req, res, params) {
    layout(res).end('hello there, ' + encode(params.name));
});

router.addRoute('/submit', post(function (req, res, params) {
    console.log(params);
    layout(res).end('form submitted!');
}));

var server = http.createServer(function (req, res) {
    var m = router.match(req.url);
    if (m) m.fn(req, res, m.params);
    else ecstatic(req, res)
});
server.listen({ fd: fd }, function () {
    console.log('listening on :' + server.address().port);
});

function post (fn) {
    return function (req, res, params) {
        if (req.method !== 'POST') {
            res.statusCode = 400;
            res.end('not a POST\n');
        }
        body(req, res, function (err, pvars) {
            fn(req, res, xtend(pvars, params));
        });
    };
}

function layout (res) {
    res.setHeader('content-type', 'text/html');
    var tr = trumpet();
    read('layout.html').pipe(tr).pipe(res);
    return tr.createWriteStream('#body');
}

function read (file) {
    return fs.createReadStream(path.join(__dirname, 'static', file));
}
