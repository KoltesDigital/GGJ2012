package org.ilod.ggj.server;

import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONException;
import org.json.JSONObject;

import net.tootallnate.websocket.WebSocket;

public abstract class Player {
	private static final int X_MIN = -2500;
	private static final int X_MAX =  2499;
	private static final int Y_MIN = -2500;
	private static final int Y_MAX =  2499;
	private final int hitbox;
	protected int x = 256;
	protected int y = 256;
	private final int id;
	private final Team team;
	private final int moveSpeed;
	private int xMove;
	private int yMove;
	protected int xHit = 1;
	protected int yHit = 0;
	private boolean dead = false;
	private final WebSocket ws;
	protected final AtomicInteger hp;
	private boolean hitting = false;
	protected boolean hitten = false;
	
	public Player(WebSocket ws, Team team, int id, int hp, int moveSpeed, int hitbox) {
		this.ws = ws;
		this.id = id;
		this.team = team;
		this.hp = new AtomicInteger(hp);
		this.moveSpeed = moveSpeed;
		this.hitbox = hitbox;
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
		return getSquareDistance(p.x, p.y);
	}
	
	public int getSquareDistance(int _x, int _y) {
		return (x-_x)*(x-_x) + (y-_y)*(y-_y);
	}
	
	public abstract int getType();
	public abstract void hit(long delta);
	public abstract void arrow(int power);
	
	public int getHitbox() {
		return hitbox;
	}
	
	public Team getTeam() {
		return team;
	}
	
	public void setDirection(int xMove, int yMove) {
		if (xMove != 0 || yMove != 0) {
			xHit = xMove;
			yHit = yMove;
		}
		this.xMove = xMove;
		this.yMove = yMove;
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
		x += xMove * delta * moveSpeed / 100;
		y += yMove * delta * moveSpeed / 100;
		if (x > X_MAX) x = X_MAX;
		else if (x < X_MIN) x = X_MIN;
		if (y > Y_MAX) y = Y_MAX;
		else if (y < Y_MIN) y = Y_MIN;
		setDirection(0, 0);
		if (hitten) {
			JSONObject jo = new JSONObject();
			try {
				jo.put("type", "hp");
				jo.put("id", this.id);
				jo.put("hp", this.hp.get());
				ws.send(jo.toString());
			} catch (JSONException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
		}
	}
}
