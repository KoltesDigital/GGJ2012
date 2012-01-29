goog.provide('SocketMock');

goog.require('constants');
goog.require('Player');

SocketMock = function(game, server) {
	this.game = game;
};

SocketMock.prototype.init = function() {
	for (var i = 1; i < 5; ++i) {
		var player = new Player(i, 0, 1);
		player.spawn((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100, 0, 1);
		game.addPlayer(player);
	}
	
	var player = new Player(0);
	player.spawn((Math.random() - 0.5) * 10, (Math.random() - 0.5) * 10, 0, 1);
	game.addPlayer(player);
	
	game.setCurrentPlayer(0);
	
	setInterval(function() {
		var player = game.players[Math.floor(Math.random() * 4) + 1];
		var x = (Math.random() - 0.5) * 10 + player.x;
		var y = (Math.random() - 0.5) * 10 + player.y;
		var dx = x - player.x;
		var dy = y - player.y;
		player.predicatePosition(Date.now() - deltaTime + (Math.random() - 0.5) * 100, x, y, dx, dy);
		console.log('plop');
	}, 2000);
};

SocketMock.prototype.send = function(data) {
	data.ts = Date.now();
	
	switch (data.type) {
	case "change":
		var player = new Player(0, 0, 1);
		player.setPosition((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
		game.addPlayer(player);
		game.setCurrentPlayer(0);
		break;
		
	case "ping":
		setTimeout(function() {
			var time = Date.now();
			setTimeout(function() {
				this.game.pong({
					ts: time,
					data: data.data
				});
			}, Math.random() * 100);
		}, Math.random() * 100);
		break;
		
	case "startAttack":
		this.game.dead(1);
		break;
	}
};