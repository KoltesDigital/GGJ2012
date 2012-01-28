package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class Arrow {
	private final Team team;
	private int x;
	private int y;
	private final int xMove;
	private final int yMove;
	private final int moveSpeed;
	private final int damages;
	private final int distMax;
	private int dist = 0;
	
	public Arrow(Team team, int x, int y, int xMove, int yMove, int moveSpeed, int damages, int distMax) {
		this.team = team;
		this.x = x;
		this.y = y;
		this.xMove = xMove;
		this.yMove = yMove;
		this.moveSpeed = moveSpeed;
		this.damages = damages;
		this.distMax = distMax;
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
			team.getServer().sendToAll(jo.toString());
		} catch (JSONException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
	
	public boolean doAction(long delta) {
		for (Player p : team.getServer().getPlayers()) {
			if (p.getTeam() != team && p.getSquareDistance(x, y) < p.getHitbox() * p.getHitbox()) {
				int hp = p.hp.addAndGet(-damages);
				if (hp <= 0 && hp + damages > 0) p.kill();
				return true;
			}
		}
		if (dist >= distMax) {
			return true;
		}
		dist += moveSpeed * delta / 100;
		this.x += xMove * moveSpeed * delta / 100;
		this.y += yMove * moveSpeed * delta / 100;
		return false;
	}
}
