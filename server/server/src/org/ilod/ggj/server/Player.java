package org.ilod.ggj.server;

import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONException;
import org.json.JSONObject;

import net.tootallnate.websocket.WebSocket;

public abstract class Player {
	private static final int X_MIN = -2480;
	private static final int X_MAX =  2480;
	private static final int Y_MIN = -2480;
	private static final int Y_MAX =  2480;
	private final int hitbox;
	protected double x = /*(int)(Math.random() * 5000 - 2500)*/ 256;
	protected double y = /*(int)(Math.random() * 5000 - 2500)*/ 256;
	private final int id;
	private final Team team;
	private final int moveSpeed;
	protected int xMove;
	protected int yMove;
	protected int hitDirection = 0;
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
	
	public double getX() {
		return x;
	}
	
	public double getY() {
		return y;
	}
	
	public double getSquareDistance(Player p) {
		return getSquareDistance(p.x, p.y);
	}
	
	public double getSquareDistance(double _x, double _y) {
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
		if (dead) return;
		this.xMove = xMove;
		this.yMove = yMove;
	}
	
	public void kill() {
		if (dead) return;
		dead = true;
		this.getTeam().getServer().addEvent(new KillEvent(this));
		this.getTeam().getServer().addEvent(new SpawnEvent(ws, team, id));
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
		if (dead) return;
		double oldX = x;
		double oldY = y;
		x += xMove * delta * moveSpeed / 100.0;
		y += yMove * delta * moveSpeed / 100.0;
		if (x > X_MAX) {
			x = X_MAX;
			setDirection(0, 0);
		} else if (x < X_MIN) {
			x = X_MIN;
			setDirection(0, 0);
		}
		if (y > Y_MAX) {
			y = Y_MAX;
			setDirection(0, 0);
		} else if (y < Y_MIN) {
			y = Y_MIN;
			setDirection(0, 0);
		}
		int xMin = (int)Math.ceil(x - hitbox);
		int yMin = (int)Math.ceil(y - hitbox);
		int xMax = (int)Math.floor(x - hitbox);
		int yMax = (int)Math.floor(y - hitbox);
		int iMin = (xMin+2500)/250;
		int iMax = (xMax+2500)/250;
		int jMin = (yMin+2500)/250;
		int jMax = (yMax+2500)/250;
		boolean block = false;
		for (int i = iMin ; i < iMax && !block ; i++) {
			for (int j = jMin ; j < jMax && !block ; j++) {
				for (Player p : team.getServer().getTile(i, j).getPlayers()) {
					if (p.getSquareDistance(this) < 4 * hitbox * p.hitbox) {
						block = true;
						break;
					}
				}
			}
		}
		if (block) {
			x = oldX;
			y = oldY;
			team.getServer().addEvent(new MoveEvent(this, 0, 0, hitDirection));
		}
		int i = (int)(Math.ceil(x + 2500)) / 250;
		int j = (int)(Math.ceil(y + 2500)) / 250;
		int iOld = (int)(Math.ceil(oldX + 2500)) / 250;
		int jOld = (int)(Math.ceil(oldY + 2500)) / 250;
		if (iOld != i || jOld != j) {
			team.getServer().getTile(iOld, jOld).removePlayer(this);
			team.getServer().getTile(i, j).addPlayer(this);
		}
		if (hitten) {
			JSONObject jo = new JSONObject();
			try {
				jo.put("type", "hp");
				jo.put("id", this.id);
				jo.put("hp", this.hp.get());
				jo.put("ts", this.team.getServer().getTimestamp());
				ws.send(jo.toString());
			} catch (JSONException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
		}
	}
	
	public void setHitDirection(int direction) {
		this.hitDirection = direction;
	}
}
