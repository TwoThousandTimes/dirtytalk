var app = require('express')();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var redis = require("redis"),
    rClient = redis.createClient();

app.get('/', function(req, res){
	res.sendfile('index.html');
});
/*
io.use(function(socket,next){
	var data = socket.request;
	if(!data.headers.cookie) {		
		return next('No Cookies', false);
	}

	cookieParser(data, {}, function(parseErr) {
		if(parseErr) {
			console.log('test');
			return next('Error parsing cookies', false);
		}
		var dirtytalk = data.cookies['dirtytalk'];
		console.log(dirtytalk);
	});

});
*/

io.on('connection', function(socket){
	//Note, the handshake objects lets us grab the laravel session id.
	cookies = cookie.parse(socket.handshake.headers.cookie);
	if(cookies.dirtytalk) {
		socket.handshake.sess = cookies.dirtytalk;//just store that stuff.
		//use the session id to figure out who this is.
		rClient.get(cookies.dirtytalk,function(err,reply) {
			console.log(reply);
			if(reply) {
				socket.handshake.user = reply;
				
			} else {
				return false;
			}
		});
	} else {
		return false;
	}
});

http.listen(3000, function(){
	console.log('listening on *:3000');
});
