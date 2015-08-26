'use strict';
var engine = require('engine.io');
var Rooms = require('engine.io-rooms');
// var utils = require('../Shared/utils.js')
// var Log = new utils.Log("Server2")
var http = require('http');
// var loadedExpressServer = require('../app');
// var debug = require('debug')('vira:server');


var port = process.env.PORT || '8080';
var ip = process.env.IP || "127.0.0.1";
// loadedExpressServer.set('port', port);
// loadedExpressServer.set('ip', ip);

// var CustomWeirdServer = http.createServer(loadedExpressServer);
// *
//  * Normalize a port into a number, string, or false.

// CustomWeirdServer.listen(port ,ip, function () {
// console.log("✔ Express server listening at %s:%d ", ip, port);
// });


var args = process.argv.slice(2);
var serverList = [];

function GServer (httpServer) {
  var Server = (function (id, name, PORT) {
    var _games = {};
    var _connectedClient = [];
    var _httpServer = httpServer;
    var server_log_faces = {
                "OK": "☻",
                "HMM": "⚈",
                "WARN": "⚠",
                "CRAP": "~❦~",
                "DEBUG": "♻",
              }

    //communication layer
    var socket = function (port, name, gameAPI) {
        if (!port){
            port = 3000
        }
        var server = engine.attach(_httpServer);
        server = Rooms(server)
        console.log("Game Server starting... on port " + port)

        this.send = function (socket, msg) {
          socket.send(msg)
        }

        server.on('connection', function (_socket) {
            _socket.join('lobby'); // all the connected client will join the lobby before going to a unique room

            console.log("current room: ",_socket.join('room1'))
            var new_socket_msg = 'Welcome ' + _socket.id + ':)';
            var old_socket_msg = '' + _socket.id + ' just connected';

            this.broadcast(old_socket_msg, _socket.id, false, new_socket_msg)
            // print(server.clientsCount)
            _socket.room('lobby').send('hello');
            console.log(_socket.rooms());
            _socket.on("message", client_message_handler.bind({}, this, _socket))

_socket.room('lobby').clients(function(clients) {
    console.log(clients); // output array of socket ids
  });


        });



        /*handle anything received from client*/
        function client_message_handler(server, _socket, data) {
            var _data = null,
                _res=null;
            if (data) {
                _data = JSON.parse(data)
                console.log(_data)
                switch(_data.msgType){
                    case 'login':
                        _socket.name = _data.data
                        _res = print("Hello " + (_socket.name?_socket.name:_socket.id) +
                               " " + JSON.stringify(_data) + _socket.id, "HMM", false)
                        break;

                    case 'play':
                    case 'update':
                        print(JSON.stringify(_data), "HMM", true)
                        console.log(_data.data.player, _data.data.col, _data.data.row, _data.data.content)
                        _res = gameAPI.makeMove(_socket, _data.data.player, _data.data.row, _data.data.col, _data.data.content)

                        break;

                    case 'getGame':
                        _res = JSON.stringify({
                            "msgType": "getGame",
                            "data": {},
                            // "data":gameAPI.getGame().board
                        })
                        break;
                    case 'save':
                        _res = gameAPI.save()
                        break;


                }
            }

            if (_res){
                console.log("Sending ", _res)
                _socket.send(_res)
            }
        }

        // ♬ ♫♬
        function print (msg, level, to_console, to_client) {

            var face = server_log_faces["OK"]

            if (level && level in server_log_faces){
                face = server_log_faces[level]
            }
            var _res = null
            try{ // try to print an object
                _msg = JSON.parse(msg)
                _res = (_msg instanceof Object? msg : "[" +face + "]:" + msg)
            }catch(e){ // we are printing a text
                _res = msg
            }

            if (to_console != false)
                console.log(_res)
            return _res
        }
        server.broadcast = function(msg, sender_id, to_all, msg_counter_part) {
            if( to_all == true) {
                sender_id = null
            }

            for( var key in server.clients ) {
                if(typeof sender_id !== 'undefined') {

                    if( key == sender_id ) { // Don't broadcast to sending client
                        continue;
                    }
                }
                server.clients[key].send(print(msg));
                // print(server.clients[key].name)
            }
            if (msg_counter_part && sender_id != null)
                server.clients[sender_id].send(msg_counter_part)

            print("=========> End Broadcast <=========")
        }
        this.broadcast = server.broadcast

    }

    // game constructor
    function Game (id, name, port, MaxR, MaxC){
        this.id = id
        this.players = []
        this.name = String(name) + " Server"
        this.socket = new socket(port, name, this)
        this.dimensions = {
            y: MaxR,
            x: MaxC
        }
        var _map = {
            1: [0,0], 2: [0,1], 3: [0,2],
            4: [1,0], 5: [1,1], 6: [1,2],
            7: [2,0], 8: [2,1], 9: [2,2],
        }
        var reversed_map = {}
        for (var index in _map){
            reversed_map[_map[index].join(",")] = index
        }
        console.log(reversed_map)

        this.board = (function makeBoard (MaxR,MaxC) {
          if(MaxC == undefined) MaxC = MaxR;
          var board = [];
          for (var r = 0; r < MaxR ; r++) {         // create row first
            var col = [];
            for (var c = 0; c < MaxC ; c++) {       // then columns
              col.push(
                {
                  x:c,
                  y:r ,
                  count: 0,
                  content: 0,
                  state: null,
                }
              );
            };
            board.push(col);
          };
          return board;
        })(this.dimensions.y,this.dimensions.x);


        /*
            internal function used by the server to
            add a single element to the board ( no ripple effect)
        */
        this._addToBoard = function (_socket, row, col, _content) {
            Log(row, col, _content)
            var status = false
            if (_content == undefined){
                _content = 1
            }
            console.log("board entry : ",row,col , this.board[row][col])
            if (this.board[row][col].count < 5 ){
                this.board[row][col] = {
                    x:col,
                    y:row ,
                    count: this.board[row][col].count + 1,
                    content: this.board[row][col].content + _content,
                    state: "active",
                }
                status = true

            }

            // emit to UI  - update client

            var res = {
                'msgType':'update',
                'status': status,
                'data': this.board[row][col]
            }

            _socket.send(JSON.stringify(res))
            this.socket.broadcast(JSON.stringify(res))

            return res
        }

        this.sendToClient = function (id, msg) {

        }

        /*
            Function add to the board and start the ripple effect
        */
        this.addToBoard = function (_socket, row, col, _content) {
            var res = this._addToBoard(_socket, row, col, _content)
            console.log("status", res.status)
            if (res.status){
                var similar_neighbors = this.rippleEffect(_socket,row, col)
                if (similar_neighbors) {
                    this.board[row][col].content -= 2  // -2 because we added to the content already so we need to remove twice
                    console.log("similar_neighbors ==> -2")
                //     var $cell_id = $("#cell"+reversed_map[[row,col].join(",")] + " div")
                //     $cell_id.html(this.board[row][col].content)

                    var _res = {
                        'msgType':'update',
                        'status': res.status,
                        'data': this.board[row][col]
                    }

                    _socket.send(JSON.stringify(_res))
                    this.socket.broadcast(JSON.stringify(_res))

                }
            }
            else{
                console.log("Tile already in use")
            }
            return res.status
        }

        /*
            Ripple Effect on to neighbor cells
                           r-1,c
                             |
                r,c-1  <--- r,c  --> r,c+1
                             |
                           r+1,c

        */
        this.rippleEffect = function (_socket, row, col, _content) {
            Log("ripple Effect from ", row, col)
            var similar_neighbors_status = false
            var neighbors = {
                left:col-1 >= 0 ? [row, col-1] : null,
                top: row-1 >= 0 ? [row-1, col] : null,
                right:col+1 < this.dimensions.x ? [row, col+1] : null,
                bottom:row+1 < this.dimensions.y ? [row+1, col] : null,
            }
            var neighbors_values = []

            for (var neighbor in neighbors){
                 if (neighbors[neighbor] != null){
                        var nValue = this.getContent.apply(this, neighbors[neighbor])
                        nValue != null? neighbors_values.push(nValue): 0
                    }
            }

            // console.log(neighbors_values)
            if(utils.containsDuplicate(neighbors_values)){
                console.log("similar neighbors... removing 1 :P")
                similar_neighbors_status = true
            }

            // increment each neighbor
            for (var neighbor in neighbors){
                    // console.log(neighbor, neighbors[neighbor])
                    if (neighbors[neighbor] != null){
                        this._addToBoard(_socket, neighbors[neighbor][0],
                                        neighbors[neighbor][1], _content)
                        // var nValue = this.getContent.apply(this, neighbors[neighbor])
                        // neighbors_values.push(nValue)
                    }
                    // neighbors[neighbor][0] //row
                    // neighbors[neighbor][1] //col
            }
            return similar_neighbors_status
        };

        this.getContent = function (row, col) {

            return this.board[row][col].state == null ? null: this.board[row][col].content
        };
        /*
            @prop - property from cell board to be printed
        */
        this.print = function (prop) {
          var b = "";
          if (prop == undefined){
            prop = "content"
          }
          this.board.every(function (row, index, array){
            row.every(function (obj, i, a){
              if (i == 0) {
                b+=obj[prop]+ '|';
              }
              else if( i == 2){
                b+= '|' + obj[prop] + (index < 2 ? '\n-----':'');
              }
              else
                b+= '' + obj[prop]+ '';
              return true;
            });
            b+='\n';
            return true
          });
          return b
        };
        this.makeMove = function (_socket, player, row, col, _content) {
            var res = this.moveIsLegal(_socket, row, col, _content)
            if (res){
              Log(this.name, player + " moved to {" + row +"," + col + "}")
              // upgrade board now
            } else{
                Log("Sorry " + player +
                  " the move to {" + row +"," + col + "} is illegal", this.name)
            }
            // console.log(this.board)
            console.log(this.print())
            return res
        };
        this.moveIsLegal = function(_socket, row, col, _content) {
            var legal = this.addToBoard(_socket, row, col, _content)

            return legal
        }
    };

    _games[id] = new Game(id, name, PORT, 3, 3);

    var getGame = function(id){
      return _games[id];
    }
    return _games;
  })("GameServer", "Master", args[0]);
  serverList += Server;
  return Server;
}

console.log(serverList);

// console.log(Server.getGame())
module.exports = GServer
