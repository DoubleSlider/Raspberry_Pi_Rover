 #include <Servo.h>

Servo servoX;  // create servo object to control a servo
Servo myESC;  // create servo object to control a servo

String inputString = "";         // a string to hold incoming data
boolean stringComplete = false;  // whether the string is complete

int posX = 0;

void setup() {
  servoX.attach(6);  // attaches the servo on pin 8 to the servo object
  myESC.attach(9);  // attaches the servo on pin 9 to the servo object
  servoX.write(90); // start at 90 degree
  delay(200);  
  // initialize serial:
  Serial.begin(57600);
  // reserve 100 bytes for the inputString:
  inputString.reserve(100);
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
  Serial.println("STACEY");
  delay(200);
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
  
     int a = inputString.indexOf('X');    
      int b = inputString.indexOf('Y');
      int c = inputString.indexOf(';');
      if( b > a ){
        auto x_num_string = inputString.substring(a+1,b);
        auto y_num_string = inputString.substring(b+1,c);
        
        int posX =  x_num_string.toInt();
        int posY =  y_num_string.toInt();
        Serial.print("I recieve: X=");
        Serial.print(posX);
         Serial.print(",Y=");
         Serial.println(posY);
          servoX.write(posX);   
           myESC.write(posY);  
      } else {
        
      }
      stringComplete = true;
    }
  }
}
