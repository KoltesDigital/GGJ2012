goog.provide('Socket');

goog.require('constants');
goog.require('Player');

Socket = function(game, server) {
	this.sock = new WebSocket(server);
	
	this.sock.onopen = function(evt) {

	};
	
	this.sock.onclose = function(evt) {

	};
	
	this.sock.onerror = function(evt) {

	};
	
	this.sock.onmessage = function(evt) {
		obj = eval('('+evt.data+')');
		console.log(obj.type);
		switch (obj.type) {
		case "dead":
			game.getCurrentPlayer(obj.id).dead();
			break;
		case "id":
			console.log(obj.id);
			game.setCurrentPlayer(obj.id);
			break;
		case "arrow":
			game.addArrow(obj.id, obj.x, obj.y, obj.xMove * obj.speed, obj.yMove * obj.speed);
			break;
		case "arrowHit":
			if (obj.hit) {
				game.getPlayer(obj.victim).hit();
			}
			game.removeArrow(obj.id);
			break;
		case "move":
			var player = game.getCurrentPlayer(obj.id);
			player.setPosition(obj.x, obj.y);
			player.setDirection(obj.xMove, obj.yMove);
			break;
			
		case "pong":
			game.pong(evt);
			break;
			
		case "spawn":
			var player = new Player(obj.id, obj.work, obj.team);
			player.setPosition(obj.x, obj.y);
			game.addPlayer(player);
			break;
		}
	};
};

Socket.prototype.send = function(data) {
	data.ts = Date.now();
	return this.sock.send(JSON.stringify(data));
};