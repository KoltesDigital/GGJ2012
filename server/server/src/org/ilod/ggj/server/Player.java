package org.ilod.ggj.server;

import java.util.concurrent.atomic.AtomicInteger;

import net.tootallnate.websocket.WebSocket;

public abstract class Player {
	private static final int X_MIN = -2500;
	private static final int X_MAX =  2500;
	private static final int Y_MIN = -2500;
	private static final int Y_MAX =  2500;
	private int x = 0;
	private int y = 0;
	private final int id;
	private final Team team;
	private String direction;
	private int xMove;
	private int yMove;
	private boolean dead = false;
	private final WebSocket ws;
	protected final AtomicInteger hp;
	private boolean hitting = false;
	
	public Player(WebSocket ws, Team team, int id, int hp) {
		this.ws = ws;
		this.id = id;
		this.team = team;
		this.hp = new AtomicInteger(hp);
	}
	
	public int getId() {
		return id;
	}
	
	public float getX() {
		return x;
	}
	
	public float getY() {
		return y;
	}
	
	public int getSquareDistance(Player p) {
		return (x-p.x)*(x-p.x) + (y-p.y)*(y-p.y);
	}
	
	public abstract String getType();
	public abstract void hit(long delta);
	public abstract int getHitbox();
	
	public Team getTeam() {
		return team;
	}
	
	public void setDirection(String direction) {
		if (!direction.equals(this.direction)) {
			this.direction = direction;
			if ("haut".equals(direction)) {
				xMove = 0;
				yMove = -1;
			} else if ("bas".equals(direction)) {
				xMove = 0;
				yMove = 1;
			} else if ("gauche".equals(direction)) {
				xMove = -1;
				yMove = 0;
			} else if ("droite".equals(direction)) {
				xMove = 1;
				yMove = 0;
			} else {
				xMove = 0;
				yMove = 0;
			}
		}
	}
	
	public void kill() {
		if (dead) return;
		dead = true;
		this.getTeam().getServer().addEvent(new KillEvent(this));
	}
	
	public WebSocket getSocket() {
		return ws;
	}
	
	public void setHitting(boolean hitting) {
		this.hitting = hitting;
	}
	
	public boolean isHitting() {
		return hitting;
	}
	
	public void move(long delta) {
		x += xMove * delta * 3 / 100;
		y += yMove * delta * 3 / 100;
		if (x > X_MAX) x = X_MAX;
		else if (x < X_MIN) x = X_MIN;
		if (y > Y_MAX) y = Y_MAX;
		else if (y < Y_MIN) y = Y_MIN;
	}
}
