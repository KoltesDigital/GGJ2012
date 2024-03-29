goog.provide('game');

goog.require('lime.Director');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');;
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.fill.Image');
goog.require('lime.animation.FadeTo');
goog.require('constants');
goog.require('Arrow');
goog.require('Player');
goog.require('Socket');
goog.require('SocketMock');

game.players = {};

game.arrows = {};

game.addPlayer = function(player) {
	this.players[player.id] = player;
	player.addToLayer(game.playersLayer);
};

game.removePlayer = function(id) {
	var player = this.players[id];
	if (player) {
		if (player == this.currentPlayer) {
			delete this.currentPlayer;
			player.removeFromLayer(game.currentPlayerLayer);
		} else {
			player.removeFromLayer(game.playersLayer);
		}
		delete this.players[id];
	}
};

game.changeCharacter = function() {
	socket.send({
		type: 'change',
		character: this.newCharacter,
		team: this.newTeam
	});
};

game.hit = function(id) {
	var player = this.players[id];
	if (player) {
		player.hit();
	}
};

game.dead = function(id) {
	var player = this.players[id];
	if (player) {
		player.dead();
	}
};

game.addArrow = function(id, x, y, sx, sy) {
	var arrow = new Arrow(id, x, y, sx, sy);
	this.arrows[id] = arrow;
	arrow.addToLayer(this.arrowLayer);
};

game.removeArrow = function(id) {
	var arrow = this.arrows[id];
	if (arrow) {
		arrow.removeFromLayer(this.arrowLayer);
		delete this.arrows[id];
	}
};

game.ping = function() {
	socket.send({
		type: "ping",
		data: Date.now()
	});
};

game.pong = function(obj) {
	var now = Date.now();
	deltaTime = (now - obj.data) / 2 + now - obj.ts;
	
	setTimeout(this.ping, constants.pingInterval);
};

game.collide = function() {
	this.collideX = directionX;
	this.collideY = directionY;
};

game.setCurrentPlayer = function(id) {
	this.currentPlayer = this.players[id];
	if (!this.currentPlayer) {
		return;
	}
	
	this.currentPlayer.removeFromLayer(game.playersLayer);
	this.currentPlayer.addToLayer(game.currentPlayerLayer);
	
	var leftKey, rightKey, upKey, downKey;
	directionX = 0, directionY = 0, direction = 0;
	var cooldownTime = 0;
	var attacking = false;
	
	this.cameraX = this.currentPlayer.x;
	this.cameraY = this.currentPlayer.y;
	
	goog.events.listen(window, ['keydown'], function(e) {
		//console.log(e.keyCode);
		var moved = false;
		
		switch (e.keyCode) {
		case 32: //space
			if (game.currentPlayer.character == constants.characters.archer) {
				if (cooldownTime <= Date.now()) {
					cooldownTime = Date.now() + constants.cooldownArrow;
					socket.send({
						type: "arrow"
					});
				}
			} else if (!attacking) {
				attacking = true;
				game.currentPlayer.startAttacking();
				socket.send({
					type: "startHit",
					direction: game.currentPlayer.direction
				});
			}
			break;
			
		case 37: //left
			if (directionX != -1) {
				leftKey = true;
				moved = true;
				directionX = -1;
				direction = constants.directions.left;
			}
			break;
			
		case 38: //up
			if (directionY != -1) {
				upKey = true;
				moved = true;
				directionY = -1;
				direction = constants.directions.up;
			}
			break;
			
		case 39: //right
			if (directionX != 1) {
				rightKey = true;
				moved = true;
				directionX = 1;
				direction = constants.directions.right;
			}
			break;
			
		case 40: //down
			if (directionY != 1) {
				downKey = true;
				moved = true;
				directionY = 1;
				direction = constants.directions.down;
			}
			break;
		}
		
		if (moved) {
			game.currentPlayer.setDirection(directionX, directionY, direction);
			
			socket.send({
				type: "move",
				xMove: directionX,
				yMove: directionY,
				direction: direction
			});
		}
	});

	goog.events.listen(window, ['keyup'], function(e) {
		switch (e.keyCode) {
		case 32: //space
			if (game.currentPlayer.character != constants.characters.archer) {
				attacking = false;
				game.currentPlayer.stopAttacking();
				socket.send({
					type: "stopHit"
				});
			}
			break;
			
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
		
		game.currentPlayer.setDirection(directionX, directionY);
		
		socket.send({
			type: "move",
			xMove: directionX,
			yMove: directionY,
			direction: game.currentPlayer.direction
		});
	});

	lime.scheduleManager.schedule(function(dt) {
		for (key in game.players) {
			game.players[key].update(dt);
		}

		for (key in game.arrows) {
			game.arrows[key].update(dt);
		}
	});
};

game.start = function() {
	director = new lime.Director(document.body, constants.screenWidth, constants.screenHeight);
	scene = new lime.Scene();

	this.mainLayer = new lime.Layer();
	scene.appendChild(this.mainLayer);
	
	this.bgLayer = new lime.Layer();
	this.mainLayer.appendChild(this.bgLayer);
	
	this.playersLayer = new lime.Layer();
	this.mainLayer.appendChild(this.playersLayer);
	
	this.currentPlayerLayer = new lime.Layer();
	this.mainLayer.appendChild(this.currentPlayerLayer);
	
	this.arrowLayer = new lime.Layer();
	this.mainLayer.appendChild(this.arrowLayer);
	
	this.titleLayer = new lime.Layer();
	scene.appendChild(this.titleLayer);
	
	this.bgSprites = [];
	for (var i = 0; i < 12; ++i) {
		var sprite = new lime.Sprite().setFill(constants.imagesPath + 'grass.png');
		this.bgLayer.appendChild(sprite);
		this.bgSprites[i] = sprite;
	}
	
	this.welcomeSprite = new lime.Sprite().setFill(constants.imagesPath + 'titre.png');
	this.titleLayer.appendChild(this.welcomeSprite).setPosition(constants.screenWidth / 2, constants.screenHeight / 2);
	
	director.replaceScene(scene);
	
	this.cameraX = 0;
	this.cameraY = 0;

	deltaTime = 50;

	socket = new Socket(this, constants.server);
	socket.init();

	goog.events.listenOnce(window, ['keydown'], function(e) {
		switch (e.keyCode) {
		case 32: //space
			socket.send({
				type: "start"
			});
			var fadehalf = new lime.animation.FadeTo(0).setDuration(1);
			game.welcomeSprite.runAction(fadehalf);
			break;
		}
	});

	lime.scheduleManager.schedule(function(dt) {
		var targetX, targetY;
		
		if (game.currentPlayer) {
			targetX = game.currentPlayer.x;
			if (directionX != 0) {
				targetX += directionX * constants.cameraGap;
			} else if (game.currentPlayer.direction == constants.directions.left) {
				targetX -= constants.cameraGap;
			} else if (game.currentPlayer.direction == constants.directions.right) {
				targetX += constants.cameraGap;
			}
	
			targetY = game.currentPlayer.y;
			if (directionY != 0) {
				targetY += directionY * constants.cameraGap;
			} else if (game.currentPlayer.direction == constants.directions.up) {
				targetY -= constants.cameraGap;
			} else if (game.currentPlayer.direction == constants.directions.down) {
				targetY += constants.cameraGap;
			}
		} else {
			targetX = targetY = 0;
		}
		
		game.cameraX += (targetX - game.cameraX) * constants.cameraRatio * dt;
		game.cameraY += (targetY - game.cameraY) * constants.cameraRatio * dt;
		game.mainLayer.setPosition(constants.screenWidth / 2 - game.cameraX, constants.screenHeight / 2 - game.cameraY);
		
		var x = Math.floor(game.cameraX / constants.backgroundWidth);
		var y = Math.floor(game.cameraY / constants.backgroundHeight + 0.5);
		var k = 0;
		for (var i = x-1; i <= x+2; ++i) {
			for (var j = y-1; j <= y+1; ++j) {
				game.bgSprites[k].setPosition(i*constants.backgroundWidth, j*constants.backgroundHeight);
				++k;
			}
		}
	});
};

goog.exportSymbol('game.start', game.start);
