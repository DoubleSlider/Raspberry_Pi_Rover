// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , five = require("johnny-five"),
  board,servo,led,sensor;

  // make web server listen on port 1337
app.listen(1337);

var SerialPort = require("serialport").SerialPort;
board = new five.Board({
  port: new SerialPort("COM4", {
    baudrate: 9600,
    buffersize: 1
  });
    
console.log("establish control");




var esc;
var speed, steer;
// on board ready
board.on("ready", function() {
	// 利用前後左右控制汽車以一檔行進的方向, button A is for throtte, button X is for brake
	var start = Date.now();

	
	esc = new five.ESC({
		device:"FORWARD_REVERSE",
		neutral: 50,
		pin: 9
	});
	//waiting for arming, is RC car require??
 //if (Date.now() - start < 2e3) {
      //return;
    //}
  // init a led on pin 13, strobe every 1000ms
  led = new five.Led(13).strobe(1000);

  // setup a stanard servo, center at start
  servo = new five.Servo({
    pin:6,
    range: [40,140],
    type: "standard",
    center:true
  });

  // poll this sensor every second
  sensor = new five.Sensor({
    pin: "A0",
    freq: 1000
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


// on a socket connection
io.sockets.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
 
  // if board is ready
  if(board.isReady){
    // read in sensor data, pass to browser
    sensor.on("data",function(){
      socket.emit('sensor', { raw: this.raw });
    });
  }

  // if servo message received
  //socket.on('servo', function (data) {
  //  console.log(data);
 //   if(board.isReady){ servo.to(data.pos);  }
 // });
  // if led message received
  socket.on('led', function (data) {
    console.log(data);
     if(board.isReady){    led.strobe(data.delay); } 
  });
  
  // using gamepad data to control throtte and servo

  // throtte and steer
  socket.on('axes', function(data) {
	console.log('xx:',data.xx,', xy:',data.xy,', yx:',data.yx,', yy:',data.yy);
	speed = -(data.xy-1)*50;
	steer = (data.xx)*50+90; // 40~140
	if( board.isReady){
		servo.to(steer);
		//esc.speed(speed)
		console.log('speed:',speed,' steer:',steer);
	}else{
		speed = 50;
		esc.speed(speed);
	}
  });
  socket.on('A', function(data) {
	console.log(data);
	if( board.isReady){
		//if no collision
		//if()
		// 根據蘑菇頭決定前進速度
		esc.speed(speed)

	}
  });
  // brake
  socket.on('X', function(data) {
	console.log(data);
	if( board.isReady){
		speed = 50;
		esc.speed(speed);
	}
  });
});
