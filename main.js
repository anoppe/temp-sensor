/*jslint node:true, vars:true, bitwise:true, unparam:true */
/*jshint unused:true */

/*
A simple node.js application intended to read data from Digital pins on the Intel based development boards such as the Intel(R) Galileo and Edison with Arduino breakout board.

MRAA - Low Level Skeleton Library for Communication on GNU/Linux platforms
Library in C/C++ to interface with Galileo & other Intel platforms, in a structured and sane API with port nanmes/numbering that match boards & with bindings to javascript & python.

Steps for installing MRAA & UPM Library on Intel IoT Platform with IoTDevKit Linux* image
Using a ssh client: 
1. echo "src maa-upm http://iotdk.intel.com/repos/1.1/intelgalactic" > /etc/opkg/intel-iotdk.conf
2. opkg update
3. opkg upgrade

Article: https://software.intel.com/en-us/html5/articles/intel-xdk-iot-edition-nodejs-templates
*/
var mraa = require('mraa'); //require mraa
var ubidots = require('ubidots');
var influxDB = require('influx');

// Create ubidots client with API-key
var client = ubidots.createClient('de526bc9f5822647a8413ea54d9425e444be2969');

var saveValue = function(value) {
    client.auth(function () {
        
        var v = this.getVariable('571cb30076254248a5838cbc');

        v.saveValue(value);

    });    
};

const influx = new Influx.InfluxDB({
  host: '10.0.1.9',
  database: 'homeautomation',
  schema: [
    {
      measurement: 'temperature',
      fields: {
        temperature: Influx.FieldType.INTEGER
      },
      tags: [
        'temperature'
      ]
    }
  ]
});


mraa.init();

console.log('MRAA Version: ' + mraa.getVersion()); //write the mraa version to the console

var myDigitalPin0 = new mraa.Aio(0); //setup digital read on Digital pin #0

periodicActivity(); //call the periodicActivity function

function periodicActivity() {
    var sensorValue =  myDigitalPin0.read(); //read the digital value of the pin
    var voltage = (sensorValue/1024) * 5.0;
    //var voltage = (sensorValue / 1024.0) * 5.0;
    
    var temperature = (voltage - 0.5) * 100;
    console.log(temperature);
    saveValue(temperature);
    
    influx.writePoints([
      {
        measurement: 'temperature',
        tags: { room: 'woonkamer' },
        fields: { 'temperature' : temperature},
      }
    ]).catch(err => {
      console.error(`Error saving data to InfluxDB! ${err.stack}`)
    })
    
    setTimeout(periodicActivity,60000); //call the indicated function after 1 second (1000 milliseconds)
}


