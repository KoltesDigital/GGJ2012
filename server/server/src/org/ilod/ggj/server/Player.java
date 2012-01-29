package org.ilod.ggj.server;

import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONException;
import org.json.JSONObject;

public abstract class Player {
	private static final int X_MIN = -2480;
	private static final int X_MAX =  2480;
	private static final int Y_MIN = -2480;
	private static final int Y_MAX =  2480;
	private final int hitbox;
	protected double x = (int)(Math.random() * 4960 - 2480);
	protected double y = (int)(Math.random() * 4960 - 2480);
	private final int id;
	private final Team team;
	private final int moveSpeed;
	protected int xMove;
	protected int yMove;
	protected int hitDirection = 0;
	private boolean dead = false;
	private final Client c;
	protected final AtomicInteger hp;
	protected boolean hitting = false;
	protected boolean hitten = false;
	
	public Player(Client c, Team team, int id, int hp, int moveSpeed, int hitbox) {
		this.c = c;
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
		this.getTeam().getServer().addEvent(new SpawnEvent(c));
	}
	
	public void disconnect() {
		if (!dead) {
			dead = true;
			this.getTeam().getServer().addEvent(new KillEvent(this));
		}
	}
	
	public Client getClient() {
		return c;
	}
	
	public void setHitting(boolean hitting) {
		this.hitting = hitting;
	}
	
	public boolean isHitting() {
		return hitting;
	}
	
	public void move(long delta) {
		if (dead) return;
		boolean collision = false;
		double oldX = x;
		double oldY = y;
		if (yMove == 0) {
			x += xMove * delta * moveSpeed / 100.0;
		} else if (xMove == 0) {
			y += yMove * delta * moveSpeed / 100.0;
		} else {
			x += xMove * delta * moveSpeed * Math.sqrt(2) / 200.0;
			y += yMove * delta * moveSpeed * Math.sqrt(2) / 200.0;
		}
		if (x > X_MAX || x < X_MIN || y > Y_MAX || y < Y_MIN) {
			collision = true;
		}
		int xMin = (int)Math.ceil(x - hitbox);
		int yMin = (int)Math.ceil(y - hitbox);
		int xMax = (int)Math.floor(x - hitbox);
		int yMax = (int)Math.floor(y - hitbox);
		int iMin = (xMin+2500)/250;
		int iMax = (xMax+2500)/250;
		int jMin = (yMin+2500)/250;
		int jMax = (yMax+2500)/250;
		final Team t = getTeam();
		for (int i = iMin ; i <= iMax && !collision; i++) {
			for (int j = jMin ; j <= jMax && !collision ; j++) {
				for (Player p : team.getServer().getTile(i, j).getPlayers()) {
					if (p.getTeam() != t && p.getSquareDistance(this) < 4 * hitbox * p.hitbox) {
						collision = true;
						break;
					}
				}
			}
		}
		if (collision) {
			System.out.println("COLLISION!!!");
			x = oldX;
			y = oldY;
			team.getServer().addEvent(new MoveEvent(this, 0, 0, hitDirection, true));
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
				c.getSocket().send(jo.toString());
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
