/*
 * Include standard and third-party npm modules
 */
var net = require('net');
var dgram = require('dgram');
var uuid = require('uuid');

var PORT_UDP = 2205;
var PORT_TCP = 2205;
var MULTI_CAST_ADDRESS = "239.255.22.5"
var s = dgram.createSocket('udp4');

	
var musicians = new Map();
	
function removeMusician(uuid){
	console.log("Le musicien avec l'uuid :" + uuid + " ne joue plus d'instrument.");
	musicians.delete(uuid);
}

s.on('message', function(msg, source) {
	console.log("Data has arrived: " + msg + ". Source port: " + source.port);

var sound = JSON.parse(msg);
var musicianUuid = sound.uuid;
var musician = musicians.get(musicianUuid);

//if the musician doesn't exist, we put it in the map
if(musician == undefined){
	musicians.set( musicianUuid, {"instrument" : sound.instrument, "activeSince" : sound.activeSince, "timeout" : setTimeout(removeMusician,5000,musicianUuid)} );
}
//else, we reset the timeout of the musician
else{
	clearTimeout(musician.timeout);
	musician.timeout = setTimeout(removeMusician,5000,musicianUuid);
}

});



//we subscribe to the multi cast address
s.bind(PORT_UDP,(err) => {
	s.addMembership(MULTI_CAST_ADDRESS);
});

//communication with the validator through TCP
var tcp = net.createServer( (socket) => {
	var musiciansList = [];
	
	musicians.forEach( function(m,uuid,map) {		
		musiciansList.push( {"uuid":uuid, "instrument":m.instrument, "activeSince":m.activeSince} );
	});
	
	socket.write(JSON.stringify(musiciansList) + "\r\n");
	socket.end();
});

tcp.listen(PORT_TCP);