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
		switch (obj.type) {
		case "dead":
			game.removePlayer(obj.id);
			break;
			
		case "id":
			game.setCurrentPlayer(obj.id);
			break;
			
		case "move":
			var player = game.getPlayer(obj.id);
			player.setPosition(obj.x, obj.y);
			player.setDirection(obj.xMove, obj.yMove);
			break;
			
		case "ping":
			this.send({
				type: "pong",
				data: obj.data
			});
			break;
			
		case "spawn":
			var player = new Player(obj.id, obj.work, obj.team);
			player.setDirection(obj.x, obj.y);
			game.addPlayer(player);
			break;
		}
	};
};

Socket.prototype.send = function(data) {
	data.ts = Date.now();
	return this.sock.send(JSON.stringify(data));
};