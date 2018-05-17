/*
 * Include standard and third-party npm modules
 */
var net = require('net');
var dgram = require('dgram');
var uuid = require('uuid/v1');
var PORT = 2205;
var MULTI_CAST_ADDRESS = "239.255.22.5"
var s = dgram.createSocket('udp4');

var instruments = new Map();

instruments.set("piano", "ti-ta-ti");
instruments.set("trumpet", "pouet");
instruments.set("flute", "trulu");
instruments.set("violin", "gzi-gzi");
instruments.set("drum", "boum-boum");

//retrieve the instrument name
var instrument = process.argv[2];

//if the instrument doesn't exist, we quit the process
if(instruments.get(instrument) == undefined){
	process.on('exit', function(){
		console.log("Invalid instrument");
		process.exit(1);
	});
}

var instrumentMessage = {"uuid":uuid(), "instrument":instrument, "activeSince":new Date()};
var JsonToSend = new Buffer(JSON.stringify(instrumentMessage));

var update = function() {
	s.send(JsonToSend,0,JsonToSend.length, PORT, MULTI_CAST_ADDRESS, (err)=> { console.log("sending : "+ JsonToSend);});
}

//send the payload every second
setInterval(update,1000);

