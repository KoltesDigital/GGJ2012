goog.provide('game');

goog.require('lime.Director');
goog.require('lime.Scene');
goog.require('lime.Layer');
goog.require('lime.fill.Image');
goog.require('lime.Sprite');

var imagesPath = 'images/';

var imageData = {
	player: 'fantassin_01.png'
};

var images = {};

Player = function(x, y) {
	this.x = x;
	this.y = y;
	this.sprite = new lime.Sprite().setFill(images.player).setPosition(x, y);
};

Player.prototype.addToScene = function() {
	playersLayer.appendChild(this.sprite);
};

Player.prototype.removeFromScene = function() {
	playersLayer.removeChild(this.sprite);
};

Player.prototype.move = function(x, y) {
	this.x += x;
	this.y += y;
	this.sprite.setPosition(this.x, this.y);
};

game.start = function() {
	director = new lime.Director(document.body,1024,768);
	scene = new lime.Scene();
	
	for (i in imageData) {
		images[i] = new lime.fill.Image(imagesPath + imageData[i]);
	}
	
	playersLayer = new lime.Layer();
	scene.appendChild(playersLayer);
	
	var player = new Player(256, 256);
	player.addToScene();
	
	director.replaceScene(scene);
};


goog.exportSymbol('game.start', game.start);
