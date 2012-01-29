goog.provide('Arrow')

goog.require('constants');
goog.require('lime.Sprite');

Arrow = function(id, x, y, sx, sy) {
	this.id = id;
	this.x = x;
	this.y = y;
	this.sx = sx;
	this.sy = sy;
	
	this.sprite = new lime.Sprite().
		setFill(constants.imagesPath + 'fleche.png').
		setPosition(x, y).
		setRotation(-Math.atan2(sy, sx) * 180 / Math.PI);
};

Arrow.prototype.addToLayer = function(layer) {
	layer.appendChild(this.sprite);
};

Arrow.prototype.removeFromLayer = function(layer) {
	layer.removeChild(this.sprite);
};

Arrow.prototype.update = function(dt) {
	this.x += this.sx * dt;
	this.y += this.sy * dt;
	this.sprite.setPosition(this.x, this.y);
};
