// initialize everything, web server, socket.io, filesystem, johnny-five
var app = require('http').createServer(handler)
  , io = require('socket.io').listen(app)
  , fs = require('fs')
  , five = require("johnny-five"),
  board,servo,led,sensor;

  // make web server listen on port 1337
app.listen(1337);

//var SerialPort = require("serialport").SerialPort;
board = new five.Board();/*{
  port: new SerialPort("COM4", {
    baudrate: 57600,
    buffersize: 1
  });*/
    
var esc;
var speed, steer;
var IsBrake;
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

function calcSpeed(throtte, IsBrake){
	//throtte = -50~50
	speed = (IsBrake-1)*throtte*50+50;
	return speed;
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
	throtte = -data.xy*50; // -50~50
	speed = calcSpeed(throtte, IsBrake);
	steer = (data.xx)*50+90; // 40~140

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
  	IsBrake = 1;
  	speed = 50;
	esc.speed(speed);
/*	console.log(data);
	if( board.isReady){
		speed = 50;
		esc.speed(speed);
	}*/
  });
});

// send command to arduino
setInterval(function(){
	if( board.isReady){
		servo.to(steer);
		esc.speed(speed);
		IsBrake = 0; // reset to 0 every cycle
		//console.log('speed:',speed,' steer:',steer);
	}
},50);
