#include <ESP8266WiFi.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <ESP8266mDNS.h>
#include <ESP8266HTTPUpdateServer.h>
#include <SimpleDHT.h>
#include "creds.h"

const char* host = "ESP8266";
const char* update_path = "/firmware";
const char* update_username = "admin";
const char* update_password = "admin";
//const char* ssid = "....";
//const char* password = "....";

int pinCount = 7;
const int pins[] = {5, 4, 0, 2, 14, 12, 13};
int pinsState[] = {HIGH, HIGH, HIGH, HIGH, HIGH, HIGH, HIGH};
unsigned long pinsPreviousMillis[] = {0, 0, 0, 0, 0, 0, 0};
const long pinInterval = 1800000; //30min -- longest pin is allowed to be on -- Prevents flooding if don't catch close command later.

ESP8266WebServer server(80);
ESP8266HTTPUpdateServer httpUpdater;

void handleRoot() {
  String response = "{\"result\":\"Hello World\"}";
  server.send(200, "application/json", response);
}

void handleApiPin() {
  int pin = -1;
  if (server.arg("pin") != "") {
    pin = server.arg("pin").toInt();
  }
  Serial.print("Pin: ");
  Serial.println(pin);

  bool state = false;
  if (server.arg("state") != "") {
    state = server.arg("state") !=  "on";
  }
  Serial.print("State: ");
  Serial.println(state);

    String response = "";
    response += "{\"pin\":";
    response += pin;
    response += ",\"state\":";
    response += (state ? "\"OFF\"" : "\"ON\"");
    response += ",\"value\":";
    response += state;
  if (setPinState(pin, state)) {
    response += ",\"success\":true}";
  } else {
    response += ",\"success\":false}";
  }

  server.send(200, "application/json", response);
}

bool setPinState(int pin, int state) {
  if (pin > -1 && pin < pinCount) {
    if (pinsState[pin] == state) {
        //Prevents keep-alive scenario where pin timer is reset continuously.
        return false;
    }
    //NOTE: 1 or HIGH disables the relay. Relays are triggered LOW or 0.
    pinsState[pin] = state ? HIGH : LOW;
    digitalWrite(pins[pin], state ? HIGH : LOW);
    pinsPreviousMillis[pin] = state ? pinsPreviousMillis[pin] : millis();
    return true;
  } 
  return false;
}

void updatePinState() {
  unsigned long currentMillis = millis();
  for (int i = 0; i < pinCount; i++) {
    if (pinsState[i] == LOW) {
        if (currentMillis - pinsPreviousMillis[i] >= pinInterval) {
            Serial.print("Detected pin on too long. Pin: ");
            Serial.println(i);
            pinsPreviousMillis[i] = currentMillis;
            setPinState(i, HIGH);
        }
    }
  }
}

void handleApiStatus() {
    String response = "";
    response += "{\"pinCount\":";
    response += pinCount;
    
    response += ",\"states\":[";
    for (int i = 0; i < pinCount; i++) {
        response += (pinsState[i] ? "\"OFF\"" : "\"ON\"");
        if (i != (pinCount - 1)) {
            response += ",";
        }
    }

    response += "],\"values\":[";
    for (int i = 0; i < pinCount; i++) {
        response += pinsState[i];
        if (i != (pinCount - 1)) {
            response += ",";
        }
    }
    response += "],\"success\":true}";

    server.send(200, "application/json", response);
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
  server.on("/api/pin", handleApiPin);
  server.on("/api/status", handleApiStatus);
  
  server.begin();

  MDNS.addService("http", "tcp", 80);
  Serial.print("http://"); Serial.println(WiFi.localIP());

  //Setup pins
  for (int i = 0; i < pinCount; i++) {
    Serial.print("pin: ");
    Serial.println(i);
    Serial.print("pinState: ");
    Serial.println(pinsState[i]);
    pinMode(pins[i], OUTPUT);
    digitalWrite(pins[i], pinsState[i]);
  } 
}

void loop() {
  server.handleClient();
  updatePinState();
}