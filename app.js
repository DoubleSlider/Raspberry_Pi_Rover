// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs');

  // make web server listen on port 1337
app.listen(1337);

var SerialPort = require("serialport");
var serialport = new SerialPort("COM10",{
	baudrate:57600,
	parser:SerialPort.parsers.readline("\n")
});


    
var esc;
var speed, steer;
var speed_max = 100;
var speed_min = 0;
var safe_distance = 100; //cm
var safe_speed = 20; //50+-20 = 30 and 70
var IsBrake;

// arduino board
serialport.on('open', function(){
  console.log('Serial Port Opend');
  serialport.on('data', function(data){
      console.log(data);
  });
});

// handle web server
function handler (req, res) {
  fs.readFile(__dirname + '/index.html',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

function calcSpeed(throtte, IsBrake, dist1, dist2){
	//throtte = -50~50
	speed = (IsBrake-1)*throtte*500+1500; //1000~2000, middle = 1500
	return speed;
}
// on a socket connection
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
 

  // if led message received
  socket.on('led', function (data) {
    console.log(data);
  });
  
  // using gamepad data to control throtte and servo

  // throtte and steer
  socket.on('axes', function(data) {
	//console.log('xx:',data.xx,', xy:',data.xy,', yx:',data.yx,', yy:',data.yy);
	throtte = data.yy; // -50~50
	speed = calcSpeed(throtte, IsBrake);
	steer = (data.xx)*25+90; // 65~115

  });
  socket.on('A', function(data) {
	console.log(data);

  });
  // brake
  socket.on('X', function(data) {
  	IsBrake = 1;

  });
});

// send command to arduino
setInterval(function(){
	string = 'S'+Math.round(steer)+'E'+Math.round(speed)+';';
	serialport.write(string);
	//console.log(string);
	IsBrake = 0;
	
},50);
