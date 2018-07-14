#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPUpdateServer.h>
#include <SimpleDHT.h>

const char* host = "ESP8266";
const char* update_path = "/firmware";
const char* update_username = "admin";
const char* update_password = "admin";
//const char* ssid = "....";
//const char* password = "....";

unsigned long sensorPreviousMillis = 0;
const long sensorInterval = 2500;
int pinDHT22 = 5;
SimpleDHT22 dht22;
float temperature = -1;
float humidity = -1;

int pinCount = 6;
int relayPins[] = {4, 0, 2, 14, 12, 13}; //include 5 ;later
unsigned long pinPreviousMillis = 0;
const long pinInterval = 1800000; //30min -- longest pin is allowed to be on


ESP8266WebServer server(80);
ESP8266HTTPUpdateServer httpUpdater;

void handleRoot() {
  String response = "{\"result\":\"Hello World\"}";
  server.send(200, "application/json", response);
}

void handleSensor() {
  String response = "{\"celsius\":";
  response += temperature;
  response += ",\"fahrenheit\":";
  response += (temperature * 1.8 + 32);
  response += ",\"humidity\":";
  response += humidity;
  response += "}";
  
  server.send(200, "application/json", response);
}

void handleRelayPin() {
  int pin = -1;
  if (server.arg("pin") != "") {
    pin = server.arg("pin").toInt();
  }
  Serial.print("Pin: ");
  Serial.println(pin);

  bool state = false;
  if (server.arg("state") != "") {
    state = server.arg("state") !=  "off";
  }
  Serial.print("State: ");
  Serial.println(state);

  String response = "";
  if (setPinState(pin, state)) {
    response += "{\"pin\":";
    response += pin;
    response += ",\"state\":";
    response += state;
    response += ",\"success\":true}";
    //response += "}";

  } else {
    response += "{\"pin\":";
    response += pin;
    response += ",\"state\":";
    response += state;
    response += ",\"success\":false}";
  }

  server.send(200, "application/json", response);
}

void updatePinState() {
  unsigned long currentMillis = millis();


}

bool setPinState(int pin, int state) {
  if (pin > -1 && pin < pinCount) {
    pinPreviousMillis = 0;
    digitalWrite(relayPins[pin], state ? LOW : HIGH);
    return true;
  } 
  return false;
}

void updateTemperatureReading() {
  unsigned long currentMillis = millis();
  if (currentMillis - sensorPreviousMillis >= sensorInterval) {
    sensorPreviousMillis = currentMillis;

    int err = SimpleDHTErrSuccess;
    if ((err = dht22.read2(pinDHT22, &temperature, &humidity, NULL)) != SimpleDHTErrSuccess) {
      Serial.print("Read DHT22 failed, err="); Serial.println(err);delay(2000);
      return;
    }
  
    float fah = temperature * 1.8 + 32;
    Serial.print("Sample OK: ");
    Serial.print((float)temperature); Serial.print(" *C, ");
    Serial.print((float)fah); Serial.print(" *F, ");
    Serial.print((float)humidity); Serial.println(" RH%");
    }
}

void setup() {
  Serial.begin(115200);
  Serial.println();
  Serial.println("Booting Sketch...");
  WiFi.mode(WIFI_AP_STA);
  WiFi.begin(ssid, password);

  while (WiFi.waitForConnectResult() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    Serial.println("WiFi failed, retrying.");
  }

  MDNS.begin(host);

  httpUpdater.setup(&server, update_path, update_username, update_password);
  
  server.on("/", handleRoot);
  server.on("/api/pin", handleRelayPin);
  server.on("/api/sensor", handleSensor);
  
  server.begin();

  MDNS.addService("http", "tcp", 80);
  Serial.print("http://"); Serial.println(WiFi.localIP());
  for (int i = 0; i < pinCount; i++) {
    pinMode(relayPins[i], OUTPUT);
    digitalWrite(relayPins[i], HIGH);
  }
  
   updateTemperatureReading();
   //ESP.deepSleep(10 * 1000000); //10s
   //ESP.deepSleep(5000000, WAKE_RF_DEFAULT);
}

void loop() {
  //server.handleClient();
  updateTemperatureReading();
}