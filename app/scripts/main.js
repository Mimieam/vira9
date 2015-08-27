/*!
 *
 *  Web Starter Kit
 *  Copyright 2014 Google Inc. All rights reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    https://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License
 *
 */
(function () {
  'use strict';

  var querySelector = document.querySelector.bind(document);

  var navdrawerContainer = querySelector('.navdrawer-container');
  var body = document.body;
  var appbarElement = querySelector('.app-bar');
  var menuBtn = querySelector('.menu');
  var main = querySelector('main');

  function closeMenu() {
    body.classList.remove('open');
    appbarElement.classList.remove('open');
    navdrawerContainer.classList.remove('open');
  }

  function toggleMenu() {
    body.classList.toggle('open');
    appbarElement.classList.toggle('open');
    navdrawerContainer.classList.toggle('open');
    navdrawerContainer.classList.add('opened');
  }

  main.addEventListener('click', closeMenu);
  menuBtn.addEventListener('click', toggleMenu);
  navdrawerContainer.addEventListener('click', function (event) {
    if (event.target.nodeName === 'A' || event.target.nodeName === 'LI') {
      closeMenu();
    }
  });
})();


'use strict';
var Log = function (name, msg) {
    var date = new Date().toJSON().substring(0, 19).replace('T', ' ');
    console.log("{" + name + "} >> " + msg);
   }

var gameServerAPI = function (serverSocket, UI) {
    var _API = {
        _socket: serverSocket,
        _ui: UI,
        ui: {
            update: function(row, col, content){
                console.log("#cell"+UI.reversed_map[[row,col].join(",")] + " div", [row,col].join(","))
                var $cell_id = $("#cell"+UI.reversed_map[[row,col].join(",")] + " div")
                $cell_id.html(content)
            }
        },

        server: {
            login: function(name){
                serverSocket.send(JSON.stringify({"msgType": "login", "data": {"name": name}}))
            },
            getGame: function(){
                serverSocket.send(JSON.stringify({"msgType": "getGame", "data": {}}))
            },
            update: function(name, row, col, content){
                console.log(name, row, col)
                serverSocket.send(JSON.stringify({
                    "msgType": "update",
                    "data":{
                        name: name,
                        col:col,
                        row:row,
                        content: content
                    }

                }));
            },
            save: function(gameStateObj){
                serverSocket.send(JSON.stringify({"msgType": "save", "data": gameStateObj}))
            },
            load: function(id){
                serverSocket.send(JSON.stringify({"msgType": "load", "data": id}))
            },
        }
    }
    serverSocket.uiAdapter = _API.ui
    console.log(serverSocket)
    return _API
}

// var DataBinder = function( object_id ) {
//   // Use a jQuery object as simple PubSub
//   var pubSub = jQuery({});

//   // We expect a `data` element specifying the binding
//   // in the form: data-bind-<object_id>="<property_name>"
//   var data_attr = "bind-" + object_id,
//       message = object_id + ":change";

//   // Listen to change events on elements with the data-binding attribute and proxy
//   // them to the PubSub, so that the change is "broadcasted" to all connected objects
//   jQuery( document ).on( "change", "[data-" + data_attr + "]", function( evt ) {
//     var $input = jQuery( this );

//     pubSub.trigger( message, [ $input.data( data_attr ), $input.val() ] );
//   });

//   // PubSub propagates changes to all bound elements, setting value of
//   // input tags or HTML content of other tags
//   pubSub.on( message, function( evt, prop_name, new_val ) {
//     jQuery( "[data-" + data_attr + "=" + prop_name + "]" ).each( function() {
//       var $bound = jQuery( this );

//       if ( $bound.is("input, textarea, select") ) {
//         $bound.val( new_val );
//       } else {
//         $bound.html( new_val );
//       }
//     });
//   });

//   return pubSub;
// }

var Autumn = (function (name, game) {
    "use strict";
    var countDownTimer = function (fn, initialTime, element, interval, _callMeAtEveryIteration) {
        this.time = initialTime
        this.fn = fn
        this._callMeAtEveryIteration = _callMeAtEveryIteration
        this._timeOutId = null
        this.renderingTarget = element
        this.interval = interval? interval: 1000

        this.start = function () {
            // modified from http://stackoverflow.com/a/20618517/623546
            var _this = this;
            this.stop()
            var seconds = null
            var remaining = this.time
            this._timeOutId = setInterval(function () {
                seconds = parseInt(remaining % 60, 10);
                seconds = seconds < 10 ? "0" + seconds : seconds;
                if (_this.renderingTarget != undefined){
                    _this.renderingTarget.textContent = seconds;
                }
                if (_this._callMeAtEveryIteration)
                    _this._callMeAtEveryIteration(seconds)
                if (--remaining < 0) {
                    remaining = _this.time;
                    _this.fn()
                }
            }, _this.interval);
        }

        this.stop = function() {
            if (this._timeOutId){
                window.clearInterval(this._timeOutId);
                this._timeOutId = null
            }
        }
        this.cancel = function () {
            this.stop()
        }
    };

    var UI = function () {

        this._map = {
            1: [0,0], 2: [0,1], 3: [0,2],
            4: [1,0], 5: [1,1], 6: [1,2],
            7: [2,0], 8: [2,1], 9: [2,2],
        }

        this.reversed_map = {}
        for (var index in this._map){
            this.reversed_map[this._map[index].join(",")] = index
        }
        console.log(this.reversed_map)

        this.idToCoord = function(id){
            console.log("id", id, " = " , this._map[id])
            return this._map[id].slice(0)
        }

        this.setHandlers = function(fn) {
            var _this = this;
            $(".tile").on("click", function(e){

                var $pos = $(e.target).data("id"),
                    coords = _this.idToCoord($pos)
                    console.log("coords = ",coords[0], coords[1])
                    fn(coords[0], coords[1])

            });

        }

        this.update = function (pos, content) {
            console.log()
        };
    };

    var socket = function (serverAddress,port) {
        var _this = this
        var _socket = new eio.Socket('ws://' + serverAddress + ':' + port);

        _socket.on('open', function(){
            _socket.on('message', server_message_handler.bind({}, this, _socket));
            _socket.on('close', function(){console.log("time to bail out!") });
        });
        return _socket

        function server_message_handler(client, _socket, data) {
            var _data = null,
                _res=null;
            if (data) {
                try{
                    _data = JSON.parse(data)
                } catch(e) {
                    _data = data
                }
                console.log(JSON.stringify(_data))
                switch(_data.msgType){
                    case 'login':
                        // _socket.name = _data.data
                        // _res = print("Hello " + (_socket.name?_socket.name:_socket.id) +
                        //        " " + JSON.stringify(_data) + _socket.id, "HMM", false)
                        // console.log(_res)
                        break;

                    case 'getGame':
                        console.log("getGame Res :", _data);
                        var tile;
                        for (var i =  0; i <= _data.data.length - 1; i++) {
                            console.log(_data.data[i])
                            for (var j = 0 ;j <= _data.data[i].length - 1; j++) {
                                var content = ".";
                                tile = _data.data[i][j]
                                if (tile.count!=0){
                                    content = tile.content
                                }
                                _socket.uiAdapter.update(tile.y, tile.x, content)
                            };
                        };
                        break;

                    case 'play':
                    case 'update':
                        console.log(_data.data)
                        // print(JSON.stringify(_data), "HMM", true)
                        // console.log(_data.data.player, _data.data.col, _data.data.row, _data.data.content)
                        console.log(_data.data.state, _data.data.x, _data.data.y, _data.data.content)
                        _res = _socket.uiAdapter.update(_data.data.y, _data.data.x, _data.data.content)
                        console.log(_res)
                        break;

                    case 'save':

                        break;
                    default:
                        // console.log("Error FULLY parsing msg received From SERVER", _data)
                        break;
                }

            }

            if (_res){
                // console.log("Sending ", _res)
                _socket.send(_res)
            }
        }
    };

    var AI = function (name, UI, socket) {
        this.name = name;
        // this.game = game;
        // this.game.players.push(this);
        this.UI = UI;
        this.socket = socket
        this.game = gameServerAPI(this.socket, this.UI);
        this.game.server.login(name);
        this.game.server.getGame();

        /* components*/

        this.timer = new countDownTimer(timerCallback, 30, document.querySelector(".app-timer"))  // every 30 sec
        this.mateFace = new countDownTimer(mateFace, 10, document.querySelector(".app-timer-mate"),1000, mateFace)  // TODO -> clean that!
        this.mateFace.start()
        // this.components = components;
        var _this = this;


        this.initUI = function(){
            this.UI.setHandlers(this.moveTo)
        };

        this.moveTo = function (row, col)  {
            _this.timer.start()
            Log(_this.name, " moving to {" + row +"," + col + "}")
            var res = _this.game.server.update(_this.name, row, col)
            // console.log(_this.game.server.getGame())
            return res
        };
        function timerCallback () {
            console.log(_this.name, "Timer still active... ")
        }
        function mateFace(secs){
            switch(String(secs)){
                case "10":
                    document.querySelector(".app-timer-mate").textContent = "( -_-)";
                    break;
                 case "09":
                 case "08":
                    document.querySelector(".app-timer-mate").textContent = "( -_•)";
                    break;
                 case "07":
                 case "06":
                    document.querySelector(".app-timer-mate").textContent = "( •_•)";
                    break;
                 case "05":
                 case "04":
                    document.querySelector(".app-timer-mate").textContent = "( •_•)>⌐■-■";
                    break;
                 case "03":
                 case "02":
                 case "01":
                 case "00":
                    document.querySelector(".app-timer-mate").textContent = "(⌐■_■)";
                    break;
                default:
                    document.querySelector(".app-timer-mate").textContent = "(-_- )";
            }
        }
    };

    var Ai = new AI(name, new UI(), new socket('//' + window.location.hostname , window.location.port))
    console.log(Ai)
    Ai.initUI();

  return Ai;
})('Mimi-0.4');
// })('Mimi-0.2', Server.getGame());
// Autumn.moveTo(2,2)
// Autumn.moveTo(0,2)





