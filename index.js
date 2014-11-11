var app = require('express')();
var cookie = require('cookie');
var cookieParser = require('cookie-parser');
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Databases.
var redis   = require("redis"),
    rClient = redis.createClient();
var mysql   = require('mysql');
var mConn	= mysql.createConnection({
	host : 'localhost',
	database: 'twothousand'
	user : 'twothousand',
	password: 'TT99!!!'
});

var connectedUsers = {};//this will hold all users who are currently connected.

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
				connectedUsers[socket.handshake.user.username] = socket;//this saves the socket so we can refer to it globally.
			} else {
				return false;
			}
		});
	} else {
		return false;
	}

	//private message.
	socket.on('private', function(data) {
		//1. Check to make sure you're allowed to send a message to this user via SQL.
		var me = socket.handshake.user.username;
		if(check_mutual(data.to, me)) {
			//2. send the message to that user.
			connectedUsers[data.to].emit('private', {from: me, message: data.msg});
			//3. store the sent message in mongo.

		}
	});

});

//note, to/from should use the username.
function check_mutual(to, from) {
	//MySQL voodoo to check to see if they are mutual.
	//mConn.query('select id',function(err, rows){});
	return true;
}



http.listen(3000, function(){
	console.log('listening on *:3000');
});
