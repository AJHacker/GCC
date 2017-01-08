'use strict';

var express = require('express');
var socketIO = require('socket.io');
var path = require('path');

var PORT = process.env.PORT || 3000;
var INDEX = path.join(__dirname, 'index.html');
var CLIENTPATH = path.join(__dirname, 'client.html');
var HOSTPATH = path.join(__dirname, 'host.html');
var MONITORPATH = path.join(__dirname, 'monitor.html');

var data = {
  'globalcookies':0,
  'clients': 0,
  'cookiesbyclient':{},
  'hostIDs':[],
  'totalConnections':0,
  'clientIDs':[],
  'printcookies': function() {
    console.log('Total Cookies:' + this.globalcookies);
  }
};


var server = express()
  .get('/',(req, res) => res.sendFile(INDEX))
  .get('/client',(req, res) => res.sendFile(CLIENTPATH))
  .get('/host',(req, res) => res.sendFile(HOSTPATH))
  .get('/monitor',(req, res) => res.sendFile(MONITORPATH))
  .use("/styles",express.static(__dirname + "/styles"))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));



var io = socketIO(server);



io.on('connection', (socket) => {
  data.totalConnections = data.totalConnections+1;

  socket.on('clientConnected',function(){
    data.clientIDs.push(String(socket.id));
    data.cookiesbyclient[String(socket.id)+'cookies'] = 0;
    data.clients = data.clients + 1;

  });

  socket.on('hostConnected',function(){
    data.hostIDs.push(String(socket.id));

  });

  socket.on('update',function(id,cookies){
    data.cookiesbyclient[id+'cookies'] += cookies;
    data.globalcookies += cookies;
  });

  socket.on('disconnect',function(){
    if(data.clientIDs.includes(String(socket.id))){
        delete data.positions[String(socket.id)+'cookies'];
        var index = data.clientIDs.indexOf(String(socket.id));
        data.clientIDs.splice(index, 1);
        data.clients = data.clients-1;
    }
    else if(data.hostIDs.includes(socket.id)){
        var index = data.hostIDs.indexOf(String(socket.id));
        data.hostIDs.splice(index, 1);
    }
    data.totalConnections = data.totalConnections-1
  });

  });



// function initCanvas(data){
//   data.canvas = document.createElement('canvas');
//   data.ctx = canvas.getContext("2d");
//
// }
setInterval(function () {
    io.emit('tick', data);
  },50);
