goog.provide('game');

goog.require('lime.Director');
goog.require('lime.GlossyButton');
goog.require('lime.Layer');;
goog.require('lime.Scene');
goog.require('lime.Sprite');
goog.require('lime.fill.Image')
goog.require('constants');
goog.require('Player');
goog.require('Socket');
goog.require('SocketMock');

game.players = {};

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
		this.player.removeFromLayer(game.playersLayer);
		this.player.addToLayer(game.currentPlayerLayer);
	}
};

game.changeCharacter = function() {
		socket.send({
		type: 'change',
		character: this.newCharacter,
		team: this.newTeam
	});
	scene.appendChild(this.playersLayer);
	scene.appendChild(this.currentPlayerLayer);
};

game.start = function() {
	director = new lime.Director(document.body, constants.screenWidth, constants.screenHeight);
	scene = new lime.Scene();
	//scene.setRenderer(lime.Renderer.CANVAS);
	
	this.playersLayer = new lime.Layer();
	//this.appendChild(this.playersLayer);

	this.currentPlayerLayer = new lime.Layer();
	//this.appendChild(this.currentPlayerLayer);

	this.teamSelectionLayer = new lime.Layer();
	//scene.appendChild(this.teamSelectionLayer);

	var btnBroccolis = new lime.GlossyButton('Broccolis').setSize(400, 600).setPosition(250, 450).setRenderer(lime.Renderer.CANVAS);
	this.teamSelectionLayer.appendChild(btnBroccolis);
	goog.events.listen(btnBroccolis, 'click', function() {
		game.newTeam = constants.teams.broccolis;
		scene.removeChild(game.teamSelectionLayer);
		scene.appendChild(game.characterSelectionLayer);
	});

	var btnCarrots = new lime.GlossyButton('Carrots').setSize(400, 600).setPosition(774, 450).setRenderer(lime.Renderer.CANVAS);
	this.teamSelectionLayer.appendChild(btnCarrots);
	goog.events.listen(btnCarrots, 'click', function() {
		game.newTeam = constants.teams.carrots;
		scene.removeChild(game.teamSelectionLayer);
		scene.appendChild(game.characterSelectionLayer);
	});

	this.characterSelectionLayer = new lime.Layer();

	var btnLancer = new lime.GlossyButton('Lancer').setSize(300, 600).setPosition(200, 450).setRenderer(lime.Renderer.CANVAS);
	this.characterSelectionLayer.appendChild(btnLancer);
	goog.events.listen(btnLancer, 'click', function() {
		game.newCharacter = constants.characters.lancer;
		scene.removeChild(game.characterSelectionLayer);
		game.changeCharacter();
	});

	var btnKnight = new lime.GlossyButton('Knight').setSize(300, 600).setPosition(512, 450).setRenderer(lime.Renderer.CANVAS);
	this.characterSelectionLayer.appendChild(btnKnight);
	goog.events.listen(btnKnight, 'click', function() {
		game.newCharacter = constants.characters.knight;
		scene.removeChild(game.characterSelectionLayer);
		game.changeCharacter();
	});

	var btnArcher = new lime.GlossyButton('Archer').setSize(300, 600).setPosition(824, 450).setRenderer(lime.Renderer.CANVAS);
	this.characterSelectionLayer.appendChild(btnArcher);
	goog.events.listen(btnArcher, 'click', function() {
		game.newCharacter = constants.characters.archer;
		scene.removeChild(game.characterSelectionLayer);
		game.changeCharacter();
	});

	var leftKey, rightKey, upKey, downKey;
	var directionX = 0, directionY = 0, direction;
	var cameraX = 0, cameraY = 0;

	socket = new SocketMock(this, constants.server);

	game.newCharacter = 0;
	game.newTeam = 0;
	game.changeCharacter();
	
	goog.events.listen(window, ['keydown'], function(e) {
		//console.log(e.keyCode);
		modif = false;
		switch (e.keyCode) {
		case 32: //space
			game.player.startAttacking();
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
		if (modif)
			socket.send({
				type: "move",
				xMove: directionX,
				yMove: directionY
			});
		game.player.setDirection(directionX, directionY, direction);
	});

	goog.events.listen(window, ['keyup'], function(e) {
		switch (e.keyCode) {
		case 32: //space
			game.player.stopAttacking();
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
		socket.send({
			type: "move",
			xMove: directionX,
			yMove: directionY
		});
		game.player.setDirection(directionX, directionY);
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
			game.playersLayer.setPosition(constants.screenWidth / 2 - cameraX, constants.screenHeight / 2 - cameraY);
			game.currentPlayerLayer.setPosition(constants.screenWidth / 2 - cameraX, constants.screenHeight / 2 - cameraY);
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
