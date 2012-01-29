goog.provide('game');

goog.require('lime.Director');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');;
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.fill.Image');
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
	if (player == this.player) {
		delete this.player;
		player.removeFromLayer(game.currentPlayerLayer);
	} else {
		player.removeFromLayer(game.playersLayer);
	}
	delete this.players[id];
};

game.getCurrentPlayer = function(id) {
	return this.players[id];
};

game.setCurrentPlayer = function(id) {
	this.player = this.players[id];
	if (this.player) {
		scene.appendChild(this.mainLayer);
		
		this.player.removeFromLayer(game.playersLayer);
		this.player.addToLayer(game.currentPlayerLayer);
		
		var leftKey, rightKey, upKey, downKey;
		var directionX = 0, directionY = 0, direction;
		var cameraX = 0, cameraY = 0;
		
		deltaTime = 50;
		
		goog.events.listen(window, ['keydown'], function(e) {
			//console.log(e.keyCode);
			modif = false;
			switch (e.keyCode) {
			case 32: //space
				game.player.startAttacking();
				socket.send({
					type: "startAttack",
					direction: game.player.direction
				});
				break;
			case 37: //left
				if (directionX != -1) {
					leftKey = true;
					modif = true;
					directionX = -1;
					direction = constants.directions.left;
				}
				break;
			case 38: //up
				if (directionY != -1) {
					upKey = true;
					modif = true;
					directionY = -1;
					direction = constants.directions.up;
				}
				break;
			case 39: //right
				if (directionX != 1) {
					rightKey = true;
					modif = true;
					directionX = 1;
					direction = constants.directions.right;
				}
				break;
			case 40: //down
				if (directionY != 1) {
					downKey = true;
					modif = true;
					directionY = 1;
					direction = constants.directions.down;
				}
				break;
			}
			if (modif) {
				game.player.setDirection(directionX, directionY, direction);
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
				game.player.stopAttacking();
				socket.send({
					type: "stopAttack"
				});
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
			game.player.setDirection(directionX, directionY);
			socket.send({
				type: "move",
				xMove: directionX,
				yMove: directionY,
				direction: game.player.direction
			});
		});

		lime.scheduleManager.schedule(function(dt) {
			for (key in game.players) {
				game.players[key].update(dt);
			}

			for (key in game.arrows) {
				game.arrows[key].update(dt);
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
				game.mainLayer.setPosition(constants.screenWidth / 2 - cameraX, constants.screenHeight / 2 - cameraY);

				var x = Math.floor(cameraX / constants.backgroundWidth);
				var y = Math.floor(cameraY / constants.backgroundHeight + 0.5);
				var k = 0;
				for (var i = x-1; i <= x+2; ++i) {
					for (var j = y-1; j <= y+1; ++j) {
						game.bgSprites[k].setPosition(i*constants.backgroundWidth, j*constants.backgroundHeight);
						++k;
					}
				}
			}
		});
		
		this.ping = function() {
			socket.send({
				type: "ping",
				data: Date.now()
			});
		};
		this.ping();
	}
};

game.changeCharacter = function() {
	socket.send({
		type: 'change',
		character: this.newCharacter,
		team: this.newTeam
	});
};

game.pong = function(obj) {
	deltaTime = (Date.now() - obj.data) / 2;
	setTimeout(this.ping, constants.pingInterval);
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

game.start = function() {
	director = new lime.Director(document.body, constants.screenWidth, constants.screenHeight);
	scene = new lime.Scene();

	this.mainLayer = new lime.Layer();
	
	this.bgLayer = new lime.Layer();
	this.mainLayer.appendChild(this.bgLayer);
	
	this.playersLayer = new lime.Layer();
	this.mainLayer.appendChild(this.playersLayer);
	
	this.currentPlayerLayer = new lime.Layer();
	this.mainLayer.appendChild(this.currentPlayerLayer);
	
	this.arrowLayer = new lime.Layer();
	this.mainLayer.appendChild(this.arrowLayer);
	
	this.bgSprites = [];
	for (var i = 0; i < 12; ++i) {
		var sprite = new lime.Sprite().setFill(constants.imagesPath + 'grass.jpg');
		this.bgLayer.appendChild(sprite);
		this.bgSprites[i] = sprite;
	}
	
	socket = new Socket(this, constants.server);

	game.newCharacter = 0;
	game.newTeam = 0;
	
	director.replaceScene(scene);
};

goog.exportSymbol('game.start', game.start);
