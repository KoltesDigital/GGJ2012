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
	hit: [6, 7]
};

var sheets = [
              [
               {
            	   filename: 'fantassin_b.png',
            	   metadata: lime.ASSETS.fantassin_b.zwoptex
               },
               {
            	   filename: 'fantassin_c.png',
            	   metadata: lime.ASSETS.fantassin_c.zwoptex
               }
               ]
              ];

CharacterAnimation = function(character, team) {
	lime.animation.KeyframeAnimation.call(this);

	this.direction_ = 0;

	this.state_ = 'idle';

	var sheet = sheets[character][team];
	var ss = new lime.SpriteSheet(constants.imagesPath + sheet.filename, sheet.metadata, lime.parser.ZWOPTEX);

	for(var i = 1; i <= 32; ++i) {
		this.addFrame(ss.getFrame('frame_'+goog.string.padNumber(i, 4)+'.png'));
	}
};
goog.inherits(CharacterAnimation, lime.animation.KeyframeAnimation);

CharacterAnimation.prototype.setDirection = function(direction) {
	if (this.direction_ > 2 && direction <= 2 || this.direction_ <= 2 && direction > 2) {
		this.updateScale_ = true;
	}
	this.direction_ = direction;
	return this;
};

CharacterAnimation.prototype.setState = function(state) {
	if (this.state_ == 'idle' && state == 'attacking') {
		state = 'attackingFill';
	} else if (this.state_ == 'attacking' && state == 'idle') {
		state = 'idleFill';
	}
	this.state_ = state;
	return this;
};

CharacterAnimation.prototype.setWalking = function(walking) {
	this.walking_ = walking;
	return this;
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
		if (this.state_ == 'attackingFill') {
			animation = characterAnimations.fill;
			this.state_ = 'attacking';
		} else if (this.state_ == 'idleFill') {
			animation = characterAnimations.fill;
			this.state_ = 'idle';
		} else {
			animation = characterAnimations[this.state_];
		}

		var nextFrame = this.currentFrame_ + 1;
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
