
// primary file for api

var http = require('http');
var https =  require('https')
var url = require('url');
var  StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs')

// define what the server does
// respond to all requests with a string
// create server takes a callback
// erase above: we are instantiating httpServer:
var httpServer = http.createServer(function(req, res) {
   unifiedServer(req, res);
})


// listen on 3000
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

var httpsServer = https.createServer(httpsServerOptions, function(req, res) {
  unifiedServer(req, res);
})
 

httpServer.listen(config.httpPort, function() {
  console.log("we're listening on " + config.httpPort + "on " + config.envName)
})

httpsServer.listen(config.httpsPort, function() {
  console.log("we're listening on " + config.httpsPort + "on " + config.envName)
})

var handlers = {};

// 1. sample handler
// callback will be function in chosenHandler paramter that is then called
// with these parameters: 406, and a payload object
// 4. which is just an function
handlers.sample = function(data, callback) {
// callback http status code and payload object
callback(406, {'name': 'sample handler'})

};

handlers.notFound = function(data, callback){
  callback(404)
}
//  3 return hanlders.sample
var router = {
  'sample': handlers.sample,

}



// all the server logic for both http and https servers

var unifiedServer = function(req, res) {
  // get url from req object and parse it (so latter makes it true)
  var parsedUrl = url.parse(req.url, true);
  // parsedUrl - an object with mnay keys including path, get it: 
  var path = parsedUrl.pathname;
  // now trim this path - removes / at start and end
  var trimmedPath = path.replace(/^\/+|\/+$/g, '');
  // get http method
  var method = req.method.toLowerCase();
  // get query string and turn it into an object
  var queryStringObject = parsedUrl.query;
  // get header and turn into object
  var headers = req.headers;
  // get the payload the user sent // tell it what kind of decoding
  // payloads come in as streams, so we need to collect the streams as they come in
  // so when they tell us the end, we coalesce it
  var decoder = new StringDecoder('utf-8');
  // /create a string to hold the on-coiming stream
  var buffer = '';
  // when request object emits the event, we want callback called and data passed to it
  // when data comesin, request object emits data event we are binding to, we decod it to utf-8, and append result to buffer
  req.on('data', function(data) {
    // buffer will take this decoded data
    buffer += decoder.write(data)
  })
  // another event tells us when its done: 
  req.on('end', function() {
    buffer +=decoder.end();
    // finished, so go back to before
    // send a response
    // even if no payload, the end event will still be called, even if .on not
    // ps - only post methods have payloads
  res.end("hello world");
  // choose handler this request should go to
  // define chosenHandler by looking at path /foo and 
  // if present, it is router[trimmedPath]
  // 1 get router name
  var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;
  console.log(chosenHandler)
  // construct data handler to send to handler
  var data = {
    'trimmedPath': trimmedPath,
    'queryStringObject': queryStringObject,
    'method': method,
    'headers': headers,
    'payload': buffer  
  }
  // route request to handler specfieed in router;
  // call router[trimmedPath]
  // router.sample is a global object, which gets hoisted.
  // 2 call router router[sample]
  chosenHandler(data, function(statusCode, payload){
    // what comes in here is what's sent from handler callback
    // default status called by handler or default 200
    statusCode = typeof(statusCode) =='number' ? statusCode: 200;
    // default payload - use called back or default to empty obj
    payload = typeof(payload) =='object' ? payload : {};
    // turn it into a string
    // payload handler sending back to user - not the one recieved
    var payloadString = JSON.stringify(payload);
    
    // return response
    // tells browser that we're sending json, so parse it as such
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(statusCode)
    // 
    res.end(payloadString);
    // buffer is what was sent in request body -  object...
    console.log('buffer returned - ', buffer)
    // payload is what was sent in response by handler
    console.log("Returning this response: ",statusCode,payloadString);
  })
  // log path person was asking for
  // console.log('request is recieved on this path: ', trimmedPath + ' with ', method + 'sending ', queryStringObject , ' headers: ', headers)
  
  })


  
}