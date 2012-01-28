goog.provide('SocketMock');

goog.require('constants');
goog.require('Player');

SocketMock = function(game, server) {
	this.game = game;
	
	for (var i = 0; i < 5; ++i) {
		var player = new Player(i, 0, 1);
		player.setDirection((Math.random() - 0.5) * 100, (Math.random() - 0.5) * 100);
		game.addPlayer(player);
	}
	
	game.setCurrentPlayer(0);
	
	var frame = 0;

	lime.scheduleManager.schedule(function() {
		frame++;
		if (frame > 4) {
			game.players[Math.floor(Math.random() * 4) + 1].setDirection((Math.random() - 0.5) * 1000, (Math.random() - 0.5) * 1000);
		}
	});
};

SocketMock.prototype.send = function(data) {
	data.ts = Date.now();
	
	switch (data.type) {
		
	}
};