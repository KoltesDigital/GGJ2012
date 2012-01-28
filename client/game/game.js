goog.provide('game');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.fill.Image');
goog.require('lime.Sprite');
goog.require('constants');
goog.require('Player');
goog.require('Socket');

game.players = {};

game.addPlayer = function(player) {
	this.players[player.id] = player;
	player.addToScene();
};

game.removePlayer = function(id) {
	this.players[id].removeFromScene();
	delete this.players[id];
};

game.getCurrentPlayer = function(id) {
	return this.players[id];
};

game.setCurrentPlayer = function(id) {
	this.player = this.players[id];
	console.log('set', id, this.player);
};

game.start = function() {
	director = new lime.Director(document.body, constants.screenWidth, constants.screenHeight);
	scene = new lime.Scene();
	
	socket = new Socket(this, constants.server);
	
	playersLayer = new lime.Layer();
	scene.appendChild(playersLayer);

	var leftKey, rightKey, upKey, downKey;
	var directionX = 0, directionY = 0;
	var cameraX = 0, cameraY = 0;

	goog.events.listen(window, ['keydown'], function(e) {
		//console.log(e.keyCode);
		modif = false;
		switch (e.keyCode) {
		case 37: //left
			if (directionX != -1) {
				leftKey = true;
				modif = true;
				directionX = -1;
			}
			break;
		case 38: //up
			if (directionY != -1) {
				upKey = true;
				modif = true;
				directionY = -1;
			}
			break;
		case 39: //right
			if (directionX != 1) {
				rightKey = true;
				modif = true;
				directionX = 1;
			}
			break;
		case 40: //down
			if (directionY != 1) {
				downKey = true;
				modif = true;
				directionY = 1;
			}
			break;
		}
		if (modif)
			socket.send({
				type: "move",
				xMove: directionX,
				yMove: directionY
			});
		//player.setDirection(directionX, directionY);
	});

	goog.events.listen(window, ['keyup'], function(e) {
		switch (e.keyCode) {
		case 37: //left
			leftKey = false;
			directionX = (rightKey ? 1 : 0);
			break;
		case 38: //up
			upKey = false;
			directionY = (downKey ? 1 : 0);
			break;
		case 39: //right
			rightKey = false;
			directionX = (leftKey ? -1 : 0);
			break;
		case 40: //down
			downKey = false;
			directionY = (upKey ? -1 : 0);
			break;
		}
		socket.send({
			type: "move",
			xMove: directionX,
			yMove: directionY
		});
		//player.setDirection(directionX, directionY);
	});

	lime.scheduleManager.schedule(function(dt) {
		for (key in game.players) {
			game.players[key].update(dt);
		}
		
		if (game.player) {
			var targetX = game.player.x;
			if (directionX != 0) {
				targetX += directionX * constants.cameraGap;
			} else if (game.player.direction == constants.directions.left) {
				targetX -= constants.cameraGap;
			} else if (game.player.direction == constants.directions.right) {
				targetX += constants.cameraGap;
			}
	
			var targetY = game.player.y;
			if (directionY != 0) {
				targetY += directionY * constants.cameraGap;
			} else if (game.player.direction == constants.directions.up) {
				targetY -= constants.cameraGap;
			} else if (game.player.direction == constants.directions.down) {
				targetY += constants.cameraGap;
			}
			
			cameraX += (targetX - cameraX) * constants.cameraRatio * dt;
			cameraY += (targetY - cameraY) * constants.cameraRatio * dt;
			playersLayer.setPosition(constants.screenWidth / 2 - cameraX, constants.screenHeight / 2 - cameraY);
		}
	});
	
	/*
	player.setPosition(x, y);
	player.setSpeed(x, y);
	player.updatePosition(time);

	player.move(x, y);

	player.startAttack();
	player.stopAttack();
	player.hit();
	 */
	director.replaceScene(scene);
};

goog.exportSymbol('game.start', game.start);
