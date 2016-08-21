 #include <Servo.h>

Servo myServo;  // create servo object to control a servo
Servo myESC;  // create servo object to control a servo




void serialEvent();
long ultrasonic_ranger(int pingPin);
long microsecondsToCentimeters(long microseconds);
long microsecondsToInches(long microseconds);


String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete

int posX = 0;


const int pingPin_1 = 3;
const int pingPin_2 = 4;

int cm1 = 200;
int cm2 = 200;

void setup() {
  delay(200);  
  // initialize serial:
  Serial.begin(57600);
  // reserve 100 bytes for the inputString:
  inputString.reserve(100);

 myServo.attach(6);  // attaches the servo on pin 6 to the servo object
  myESC.attach(9);  // attaches the ESC on pin 9 to the servo object
  myServo.write(90); // start at 90 degree

// arming
  for(int i=0;i++;i<20){
    myESC.writeMicroseconds(950);  // set servo to mid-point
  }
  delay(2000);// 115 or 120 //65
  
}


void loop() {
  serialEvent(); //call the function
  // print the string when a newline arrives:
  if (stringComplete) {
    Serial.println(inputString);
    // clear the string:
    inputString = "";
    stringComplete = false;
  }
  // detect collision
  cm1 = (int)ultrasonic_ranger(pingPin_1);
  cm2 = (int)ultrasonic_ranger(pingPin_2);
  Serial.print("P1:");
   Serial.print(cm1);
     Serial.print("P2:");
   Serial.println(cm2);

  delay(10);
}

/*
  SerialEvent occurs whenever a new data comes in the
 hardware serial RX.  This routine is run between each
 time loop() runs, so using delay inside loop can delay
 response.  Multiple bytes of data may be available.
 */
void serialEvent() {
  while (Serial.available()) {
    // get the new byte:
    char inChar = (char)Serial.read();
    // add it to the inputString:
    inputString += inChar;
    // if the incoming character is afire; newline, set a flag
    // so the main loop can do something about it:
    if (inChar == ';') {
      Serial.print("I recieve: "+inputString);
     int a = inputString.indexOf('S');    
      int b = inputString.indexOf('E');
      int c = inputString.indexOf(';');
      if( b > a ){
        auto x_num_string = inputString.substring(a+1,b);
        auto y_num_string = inputString.substring(b+1,c);
        
        int posX =  x_num_string.toInt();
        int posY =  y_num_string.toInt();
        const int ss = 165;

           if( cm1 < 60 && posY > 1640){
            posY = 1640;
            }
            if( cm2 < 60 && posY < 1500-ss){
              posY=1500-ss;
            }
       /* Serial.print("I recieve: S=");
        Serial.print(posX);
         Serial.print(",E=");
         Serial.println(posY);*/
          myServo.write(posX);   
           myESC.write(posY);  
      } else {
        
      }
      stringComplete = true;
    }
  }
}


long ultrasonic_ranger(int pingPin){
  // establish variables for duration of the ping,
  // and the distance result in inches and centimeters:
  unsigned long timeout = 15000; // us
  long duration, cm;

  // The PING))) is triggered by a HIGH pulse of 2 or more microseconds.
  // Give a short LOW pulse beforehand to ensure a clean HIGH pulse:
  pinMode(pingPin, OUTPUT);
  digitalWrite(pingPin, LOW);
  delayMicroseconds(2);
  digitalWrite(pingPin, HIGH);
  delayMicroseconds(5);
  digitalWrite(pingPin, LOW);

  // The same pin is used to read the signal from the PING))): a HIGH
  // pulse whose duration is the time (in microseconds) from the sending
  // of the ping to the reception of its echo off of an object.
  pinMode(pingPin, INPUT);
  duration = pulseIn(pingPin, HIGH, timeout);
  if(duration==0){
    duration = timeout;
  }

  // convert the time into a distance
  cm = microsecondsToCentimeters(duration);
  return cm;
}

long microsecondsToInches(long microseconds) {
  // According to Parallax's datasheet for the PING))), there are
  // 73.746 microseconds per inch (i.e. sound travels at 1130 feet per
  // second).  This gives the distance travelled by the ping, outbound
  // and return, so we divide by 2 to get the distance of the obstacle.
  // See: http://www.parallax.com/dl/docs/prod/acc/28015-PING-v1.3.pdf
  return microseconds / 74 / 2;
}

long microsecondsToCentimeters(long microseconds) {
  // The speed of sound is 340 m/s or 29 microseconds per centimeter.
  // The ping travels out and back, so to find the distance of the
  // object we take half of the distance travelled.
  return microseconds / 29 / 2;
}
