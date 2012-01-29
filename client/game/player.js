goog.provide('Player')

goog.require('constants');
goog.require('CharacterAnimation');
goog.require('lime.animation.KeyframeAnimation');

var anchors = [
               {
            	   x: 0.203125,
            	   y: 0.48046875
               },
               {
            	   x: 0.375,
            	   y: 0.46875
               },
               {
            	   x: 0.203125,
            	   y: 0.48046875
               }
               ];

Player = function(id) {
	this.id = id;
	this.living = false;

	this.sprite = new lime.Sprite();
};

Player.prototype.addToLayer = function(layer) {
	layer.appendChild(this.sprite);
};

Player.prototype.removeFromLayer = function(layer) {
	layer.removeChild(this.sprite);
};

Player.prototype.loadSprite = function() {
	var anchor = anchors[this.character];
	this.sprite.setAnchorPoint(0.203125, 0.48046875);
	this.animation = new CharacterAnimation(this.character, this.team).setDirection(this.direction);
	this.sprite.runAction(this.animation);
};

Player.prototype.unloadSprite = function() {
	this.animation = null;
};

Player.prototype.spawn = function(x, y, character, team) {
	this.x = this.targetX = x;
	this.y = this.targetY = y;

	this.living = true;
	this.direction = constants.directions.right;
	this.directionX = 0;
	this.directionY = 0;

	if (this.character != character || this.team != team) {
		this.unloadSprite();
		this.character = character;
		this.team = team;
		this.loadSprite();
	}

	this.sprite.setPosition(x, y);
	this.animation.idle();
};

Player.prototype.dead = function() {
	this.animation.dead();
	this.directionX = 0;
	this.directionY = 0;
	this.living = false;
};

Player.prototype.hit = function() {
	this.animation.hit();
};

Player.prototype.startAttacking = function() {
	this.animation.attack();
};

Player.prototype.stopAttacking = function() {
	this.animation.idle();
};

Player.prototype.predicatePosition = function(time, x, y, dx, dy) {
	var step = constants.characterSpeed * (Date.now() - time - deltaTime);
	this.setDirection(dx, dy);
	this.targetX = x + this.directionX * step;
	this.targetY = y + this.directionY * step;
	console.log('step', step, Date.now(), time, deltaTime);
};

Player.prototype.setPosition = function(x, y) {
	this.targetX = this.x = x;
	this.targetY = this.y = y;
};

Player.prototype.setDirection = function(x, y, direction) {
	var walking = (x != 0 || y != 0);
	this.directionX = x;
	this.directionY = y;

	this.animation.setWalking(walking);

	if (walking) {
		var norm = Math.sqrt(x*x + y*y);
		this.directionX /= norm;
		this.directionY /= norm;

		if (direction !== undefined) {
			this.direction = direction;
		} else {
			if (x > 0 && Math.abs(x) >= Math.abs(y)) {
				this.direction = constants.directions.right;
			} else if (x < 0 && Math.abs(x) >= Math.abs(y)) {
				this.direction = constants.directions.left;
			} else if (y > 0) {
				this.direction = constants.directions.down;
			} else {
				this.direction = constants.directions.up;
			}
		}
		this.animation.setDirection(this.direction);
	}
};

Player.prototype.update = function(dt) {
	if (this.directionX != 0 || this.directionY != 0) {
		var step = constants.characterSpeed * dt;
		if (this.character == constants.characters.knight) {
			step *= 1.5;
		}
		
		this.targetX += this.directionX * step;
		this.targetY += this.directionY * step;
	
		var dx = this.targetX - this.x;
		var dy = this.targetY - this.y;
		var distance2 = dx*dx + dy*dy;
		var step2 = step * step;
		if (distance2 < constants.farDistanceSquared && distance2 > step2 * 1.05) {
			var ratio = step / Math.sqrt(distance2);
			this.x += dx * ratio;
			this.y += dy * ratio;
			console.log('slide', this.x, this.y);
		} else {
			this.x = this.targetX;
			this.y = this.targetY;
			console.log('jump', this.x, this.y, this.directionX, this.directionY, step);
		}
	
		this.animation.setWalking(true);
	} else {
		this.x = this.targetX;
		this.y = this.targetY;
		this.animation.setWalking(false);
	}
	
	this.sprite.setPosition(this.x, this.y);
};
