goog.provide('game');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.fill.Image');
goog.require('lime.Sprite');
goog.require('CharacterAnimation');
goog.require('constants');

var players = new Object();

var sock = new WebSocket('ws://sd-24732.dedibox.fr:8133');
sock.onopen = function(evt) {

};
sock.onclose = function(evt) {

};
sock.onerror = function(evt) {

};
sock.onmessage = function(evt) {
	obj = eval('('+evt.data+')');
	switch (obj.type) {
	case "spawn":
		new Player(obj.id, obj.x, obj.y, obj.work, obj.team);
		break;
	case "move":
		players['id'+obj.id].setPosition(obj.x, obj.y);
		players['id'+obj.id].setDirection(obj.xMove, obj.yMove);
		break;
	case "dead":
		players['id'+obj.id].removeFromGame();
		break;
		
	}
};

Player = function(id, x, y, character, team) {
	this.x = x;
	this.y = y;
	this.id = id;
	this.character = character;
	this.team = team;

	this.walking = false;
	this.attacking = false;
	this.direction = constants.directions.right;
	this.directionX = 1;
	this.directionY = 0;

	this.sprite = new lime.Sprite().setPosition(x, y);
	this.animation = new CharacterAnimation(character, team).setDirection(this.direction);
	this.sprite.runAction(this.animation);
	
	players['id'+this.id] = this;
	this.addToScene(); // A enlever
};

Player.prototype.addToScene = function() {
	console.log(this);
	playersLayer.appendChild(this.sprite);
};

Player.prototype.removeFromScene = function() {
	playersLayer.removeChild(this.sprite);
};

Player.prototype.removeFromGame = function() {
	this.removeFromScene();
	delete players['id'+this.id];
}

Player.prototype.setDirection = function(x, y) {
	this.walking = (x != 0 || y != 0);
	this.directionX = x;
	this.directionY = y;

	this.animation.setWalking(this.walking);
	
	if (this.walking) {
		var norm = Math.sqrt(x*x + y*y);
		this.directionX /= norm;
		this.directionY /= norm;
		
		if (x > 0 && Math.abs(x) >= Math.abs(y)) {
			this.direction = constants.directions.right;
		} else if (x < 0 && Math.abs(x) >= Math.abs(y)) {
			this.direction = constants.directions.left;
		} else if (y > 0) {
			this.direction = constants.directions.down;
		} else {
			this.direction = constants.directions.up;
		}
		this.animation.setDirection(this.direction);
	}
};

Player.prototype.setPosition = function(x, y) {
	this.x = x;
	this.y = y;
	this.sprite.setPosition(x, y);
}

Player.prototype.update = function(dt) {
	if (this.walking) {
		this.x += this.directionX * constants.characterSpeed * dt;
		this.y += this.directionY * constants.characterSpeed * dt;
		this.sprite.setPosition(this.x, this.y);
	}
};

game.start = function() {
	director = new lime.Director(document.body, constants.screenWidth, constants.screenHeight);
	scene = new lime.Scene();

	playersLayer = new lime.Layer();
	scene.appendChild(playersLayer);

	//var player = new Player(0, 256, 256, constants.characters.lancer, constants.teams.carrot);
	//player.addToScene();

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
			sock.send(JSON.stringify({"type": "move", "xMove": directionX, "yMove": directionY}));
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
		sock.send(JSON.stringify({"type": "move", "xMove": directionX, "yMove": directionY}));
		//player.setDirection(directionX, directionY);
	});

	lime.scheduleManager.schedule(function(dt) {
		for (key in players) {
			child = players[key];
			child.update(dt);
		}
		
		/*var targetX = player.x;
		if (directionX != 0) {
			targetX += directionX * constants.cameraGap;
		} else if (player.direction == constants.directions.left) {
			targetX -= constants.cameraGap;
		} else if (player.direction == constants.directions.right) {
			targetX += constants.cameraGap;
		}

		var targetY = player.y;
		if (directionY != 0) {
			targetY += directionY * constants.cameraGap;
		} else if (player.direction == constants.directions.up) {
			targetY -= constants.cameraGap;
		} else if (player.direction == constants.directions.down) {
			targetY += constants.cameraGap;
		}
		
		cameraX += (targetX - cameraX) * constants.cameraRatio * dt;
		cameraY += (targetY - cameraY) * constants.cameraRatio * dt;
		console.log(cameraX + constants.screenWidth / 2, cameraY + constants.screenHeight / 2);
		playersLayer.setPosition(constants.screenWidth / 2 - cameraX, constants.screenHeight / 2 - cameraY);*/
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
