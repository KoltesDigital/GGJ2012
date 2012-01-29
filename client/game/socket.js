goog.provide('Socket');

goog.require('constants');
goog.require('Player');

Socket = function(game, server) {
	this.sock = new WebSocket(server);
};

Socket.prototype.init = function() {
	this.sock.onopen = function(evt) {

	};
	
	this.sock.onclose = function(evt) {

	};
	
	this.sock.onerror = function(evt) {

	};
	
	this.sock.onmessage = function(evt) {
		obj = eval('('+evt.data+')');
		
		if (obj.type != "pong") {
			console.log("received", obj);
		}
		
		switch (obj.type) {
		case "arrow":
			game.addArrow(obj.id, obj.x, obj.y, obj.xMove * obj.speed, obj.yMove * obj.speed);
			break;
			
		case "arrowHit":
			if (obj.victim !== undefined) {
				var player = game.players[obj.id];
				if (player) {
					player.hit();
				}
			}
			game.removeArrow(obj.id);
			break;
			
		case "dead":
			var player = game.players[obj.id];
			if (player) {
				player.dead();
			}
			break;
			
		case "disconnect":
			game.removePlayer(obj.id);
			break;
			
		case "id":
			game.setCurrentPlayer(obj.id);
			break;
			
		case "move":
			var player = game.players[obj.id];
			if (player) {
				if (player == game.currentPlayer) {
					
				} else {
					player.predicatePosition(obj.ts, obj.x, obj.y, obj.xMove, obj.yMove);
				}
			}
			break;
			
		case "pong":
			game.pong(obj);
			break;
			
		case "spawn":
			var player = game.players[obj.id];
			if (!player) {
				player = new Player(obj.id);
				player.spawn(obj.x, obj.y, obj.work, obj.team);
				game.addPlayer(player);
			} else {
				player.spawn(obj.x, obj.y, obj.work, obj.team);
			}
			break;
		}
	};
};

Socket.prototype.send = function(data) {
	data.ts = Date.now();
	
	if (data.type != "ping") {
		console.log("sent", data);
	}
	
	return this.sock.send(JSON.stringify(data));
};