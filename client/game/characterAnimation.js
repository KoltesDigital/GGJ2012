goog.provide('CharacterAnimation');

goog.require('goog.events');
goog.require('lime.ASSETS.fantassin_b.zwoptex');
goog.require('lime.ASSETS.fantassin_c.zwoptex');
goog.require('lime.parser.ZWOPTEX');
goog.require('lime.SpriteSheet');
goog.require('lime.animation.KeyframeAnimation');
goog.require('constants');

var characterAnimations = {
	idle: [0, 1],
	fill: [2, 3],
	attacking: [4, 5],
	hit: [6, 7],
	death: [24, 25]
};

var sheets = [
              [
               {
            	   filename: 'fantassin_c.png',
            	   metadata: lime.ASSETS.fantassin_c.zwoptex
               },
               {
            	   filename: 'fantassin_c.png',
            	   metadata: lime.ASSETS.fantassin_c.zwoptex
               }
               ]
              ];

CharacterAnimation = function(character, team) {
	lime.animation.KeyframeAnimation.call(this);

	this.direction_ = constants.directions.right;
	
	var sheet = sheets[character][team];
	var ss = new lime.SpriteSheet(constants.imagesPath + sheet.filename, sheet.metadata, lime.parser.ZWOPTEX);

	for(var i = 1; i <= 32; ++i) {
		this.addFrame(ss.getFrame('frame_'+goog.string.padNumber(i, 4)+'.png'));
	}
	
	this.idle();
};
goog.inherits(CharacterAnimation, lime.animation.KeyframeAnimation);

CharacterAnimation.prototype.setDirection = function(direction) {
	if (this.direction_ > 2 && direction <= 2 || this.direction_ <= 2 && direction > 2) {
		this.updateScale_ = true;
	}
	this.direction_ = direction;
	return this;
};

CharacterAnimation.prototype.setWalking = function(walking) {
	this.walking_ = walking;
};

CharacterAnimation.prototype.idle = function() {
	if (this.state_ == 'attacking') {
		this.state_ = 'idleFill';
	} else {
		this.state_ = 'idle';
	}
	this.dead_ = false;
	this.hit_ = null;
};

CharacterAnimation.prototype.attack = function() {
	if (this.state_ == 'idle') {
		this.state_ = 'attackingFill';
	} else {
		this.state_ = 'attacking';
	}
};

CharacterAnimation.prototype.hit = function() {
	this.hit_ = true;
};

CharacterAnimation.prototype.dead = function() {
	this.dead_ = true;
	this.direction_ = 0;
	this.currentFrame_ = -1;
};

CharacterAnimation.prototype.updateAll = function(t, targets) {
	var dt = this.dt_,
	delay_msec = Math.round(this.delay * 1000),
	i = targets.length;
	
	if (this.updateScale_) {
		delete this.updateScale_;

		var scale = (this.direction_ > 2 ? -1 : 1);
		while (--i >= 0) {
			this.targets[i].setScale(scale, 1);
		}
		i = targets.length;
	}

	while (--i >= 0) {
		this.getTargetProp(targets[i]);
	}

	this.lastChangeTime_ += dt;
	if (this.lastChangeTime_ > delay_msec) {
		var animation;
		if (this.dead_) {
			animation = characterAnimations.death;
		} else if (this.hit_) {
			this.hit_ = null;
			animation = characterAnimations.hit;
		} else if (this.state_ == 'attackingFill') {
			animation = characterAnimations.fill;
			this.state_ = 'attacking';
		} else if (this.state_ == 'idleFill') {
			animation = characterAnimations.fill;
			this.state_ = 'idle';
		} else {
			animation = characterAnimations[this.state_];
		}

		var nextFrame = this.currentFrame_ + 1;
		if (this.dead_ && nextFrame >= animation.length) {
			return 1;
		}
		if (!this.walking_ || nextFrame >= animation.length) {
			nextFrame = 0;
		}
		
		var nextImage = this.frames_[animation[nextFrame] + 8 * (this.direction_ > 2 ? 1 : this.direction_)];

		i = targets.length;
		while (--i >= 0) {
			this.targets[i].setFill(nextImage);
		}

		this.currentFrame_ = nextFrame;

		this.lastChangeTime_ -= delay_msec;
		this.lastChangeTime_ %= delay_msec;
	}
	
	return 0;
};
