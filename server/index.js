let express  = require('express');
let app      = express();
let httpProxy = require('http-proxy');
let path = require('path');
let apiProxy = httpProxy.createProxyServer();
let prod_server = 'http://192.168.40.54:9001';
let port = 3000;

app.use(express.static(path.resolve(__dirname, '..', 'build')));

app.use("/*", function(req, res) {
    console.log('redirecting to prod_server :' + prod_server);
    apiProxy.web(req, res, {target: prod_server});
});

if (process.argv[2] !==  undefined)
      port = process.argv[2];
console.log("Server running on port : " + port );
app.listen(port);