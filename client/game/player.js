goog.provide('Player')

goog.require('constants');
goog.require('CharacterAnimation');
goog.require('lime.animation.KeyframeAnimation');

Player = function(id, character, team) {
	this.id = id;
	this.character = character;
	this.team = team;

	this.x = 0;
	this.y = 0;
	this.walking = false;
	this.attacking = false;
	this.direction = constants.directions.right;
	this.directionX = 0;
	this.directionY = 0;

	this.sprite = new lime.Sprite().setAnchorPoint(0.203125, 0.48046875);
	//this.animation = new lime.animation.KeyframeAnimation();
	//this.animation.addFrame('images/fantassin_b.png');
	this.animation = new CharacterAnimation(character, team).setDirection(this.direction);
	this.sprite.runAction(this.animation);
};

Player.prototype.addToLayer = function(layer) {
	console.log(this);
	layer.appendChild(this.sprite);
};

Player.prototype.removeFromLayer = function(layer) {
	layer.removeChild(this.sprite);
};

Player.prototype.setDirection = function(x, y, direction) {
	this.walking = (x != 0 || y != 0);
	this.directionX = x;
	this.directionY = y;

	this.animation.setWalking(this.walking);
	
	if (this.walking) {
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

Player.prototype.setPosition = function(x, y) {
	this.targetX = x;
	this.targetY = y;
};

Player.prototype.update = function(dt) {
	var step = constants.characterSpeed * dt;
	this.targetX += this.directionX * step;
	this.targetY += this.directionY * step;
	
	var dx = this.targetX - this.x;
	var dy = this.targetY - this.y;
	var distance2 = dx*dx + dy*dy;
	if (distance2 < constants.farDistanceSquared && distance2 > step * step * 1.05) {
		var ratio = step / Math.sqrt(distance2);
		this.x += dx * ratio;
		this.y += dy * ratio;
	} else {
		this.x = this.targetX;
		this.y = this.targetY;
	}
	this.sprite.setPosition(this.x, this.y);
};

Player.prototype.startAttacking = function() {
	this.animation.setState('attacking');
};

Player.prototype.stopAttacking = function() {
	this.animation.setState('idle');
};

Player.prototype.predicatePosition = function(time, x, y, dx, dy) {
	var step = constants.characterSpeed * (time + deltaTime - Date.now());
	this.setDirection(dx, dy);
	this.targetX = x + this.directionX * step;
	this.targetY = y + this.directionY * step;
};

Player.prototype.hit = function() {
	this.animation.hit();
};

Player.prototype.dead = function() {
	this.animation.dead();
	this.directionX = 0;
	this.directionY = 0;
};
