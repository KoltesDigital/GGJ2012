package org.ilod.ggj.server;

import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONException;
import org.json.JSONObject;

public class Arrow {
	private final Team team;
	private double x;
	private double y;
	private final int xMove;
	private final int yMove;
	private final int moveSpeed;
	private final int damages;
	private final int distMax;
	private final int id;
	private int dist = 0;
	private static AtomicInteger idFactory = new AtomicInteger();
	
	public Arrow(Team team, double x, double y, int xMove, int yMove, int moveSpeed, int damages, int distMax) {
		this.team = team;
		this.x = x;
		this.y = y;
		this.xMove = xMove;
		this.yMove = yMove;
		this.moveSpeed = moveSpeed;
		this.damages = damages;
		this.distMax = distMax;
		this.id = idFactory.getAndIncrement();
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "arrow");
			jo.put("team", team.getId());
			jo.put("x", x);
			jo.put("y", y);
			jo.put("xMove", xMove);
			jo.put("yMove", yMove);
			jo.put("speed", moveSpeed);
			jo.put("damages", damages);
			jo.put("distance", distMax);
			jo.put("ts", team.getServer().getTimestamp());
			jo.put("id", id);
			team.getServer().sendToAll(jo.toString());
		} catch (JSONException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
	
	public boolean doAction(long delta) {
		int iMin = (int)(Math.ceil(x + 2500 - Lancer.HITBOX)) / 250;
		int iMax = (int)(Math.ceil(x + 2500 + Lancer.HITBOX)) / 250;
		int jMin = (int)(Math.ceil(y + 2500 - Lancer.HITBOX)) / 250;
		int jMax = (int)(Math.ceil(y + 2500 + Lancer.HITBOX)) / 250;
		for (int i = iMin ; i < iMax ; i++) {
			for (int j = jMin ; j < jMax ; j++) {
				for (Player p : team.getServer().getTile(i, j).getPlayers()) {
					if (p.getTeam() != team && p.getSquareDistance(x, y) < p.getHitbox() * p.getHitbox()) {
						JSONObject jo = new JSONObject();
						try {
							jo.put("type", "arrowEnd");
							jo.put("hit", true);
							jo.put("id", id);
							jo.put("player", p.getId());
							p.getTeam().getServer().sendToAll(jo.toString());
						} catch (JSONException e) {
							throw new RuntimeException(e);
						} catch (InterruptedException e) {
							throw new RuntimeException(e);
						}
						int hp = p.hp.addAndGet(-damages);
						if (hp <= 0 && hp + damages > 0) p.kill();
						return true;
					}
				}
			}
		}
		if (dist >= distMax) {
			JSONObject jo = new JSONObject();
			try {
				jo.put("type", "arrowEnd");
				jo.put("hit", false);
				jo.put("id", id);
				team.getServer().sendToAll(jo.toString());
			} catch (JSONException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
			return true;
		}
		dist += moveSpeed * delta / 100.0;
		this.x += xMove * moveSpeed * delta / 100.0;
		this.y += yMove * moveSpeed * delta / 100.0;
		return false;
	}
}
