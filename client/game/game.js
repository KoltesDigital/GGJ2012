goog.provide('game');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.fill.Image');
goog.require('lime.Sprite');
goog.require('CharacterAnimation');
goog.require('constants');

Player = function(x, y, character, team) {
	this.x = x;
	this.y = y;
	this.character = character;
	this.team = team;

	this.walking = false;
	this.attacking = false;
	this.directionX = 1;
	this.directionY = 0;

	this.sprite = new lime.Sprite().setPosition(x, y);
	this.animation = new CharacterAnimation(character, team).setDirection(constants.directions.right);
	this.sprite.runAction(this.animation);
};

Player.prototype.addToScene = function() {
	playersLayer.appendChild(this.sprite);
};

Player.prototype.removeFromScene = function() {
	playersLayer.removeChild(this.sprite);
};

Player.prototype.setDirection = function(x, y) {
	this.walking = (x != 0 || y != 0);
	this.directionX = x;
	this.directionY = y;

	this.animation.setWalking(this.walking);
	
	if (this.walking) {
		var norm = Math.sqrt(x*x + y*y);
		this.directionX /= norm;
		this.directionY /= norm;
		
		var direction;
		if (x > 0 && Math.abs(x) >= Math.abs(y)) {
			direction = constants.directions.right;
		} else if (x < 0 && Math.abs(x) >= Math.abs(y)) {
			direction = constants.directions.left;
		} else if (y > 0) {
			direction = constants.directions.down;
		} else {
			direction = constants.directions.up;
		}
		
		this.animation.setDirection(direction);
	}
};

Player.prototype.update = function(dt) {
	if (this.walking) {
		this.x += this.directionX * dt;
		this.y += this.directionY * dt;
		this.sprite.setPosition(this.x, this.y);
	}
};

game.start = function() {
	director = new lime.Director(document.body,1024,768);
	scene = new lime.Scene();

	playersLayer = new lime.Layer();
	scene.appendChild(playersLayer);

	var player = new Player(256, 256, constants.characters.lancer, constants.teams.carrot);
	player.addToScene();

	var leftKey, rightKey, upKey, downKey;
	var directionX = 0, directionY = 0;

	goog.events.listen(window, ['keydown'], function(e) {
		//console.log(e.keyCode);
		switch (e.keyCode) {
		case 37: //left
			leftKey = true;
			directionX = -1;
			break;
		case 38: //up
			upKey = true;
			directionY = -1;
			break;
		case 39: //right
			rightKey = true;
			directionX = 1;
			break;
		case 40: //down
			downKey = true;
			directionY = 1;
			break;
		}
		player.setDirection(directionX, directionY);
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
		player.setDirection(directionX, directionY);
	});

	lime.scheduleManager.schedule(function(dt) {
		player.update(dt);
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
