package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class MoveEvent implements Event {
	private final Player p;
	private final int xMove;
	private final int yMove;
	private final int direction;
	
	public MoveEvent(Player p, int xMove, int yMove, int direction) {
		this.p = p;
		this.xMove = xMove;
		this.yMove = yMove;
		this.direction = direction;
	}

	@Override
	public boolean applyEvent() {
		p.setDirection(xMove, yMove);
		p.setHitDirection(direction);
		try {
			JSONObject jo = new JSONObject();
			jo.put("type", "move");
			jo.put("id", p.getId());
			jo.put("xMove", xMove);
			jo.put("yMove", yMove);
			jo.put("x", p.getX());
			jo.put("y", p.getY());
			jo.put("ts", p.getTeam().getServer().getTimestamp());
			try {
				p.getTeam().getServer().sendToAll(jo.toString());
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
			return true;
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}
	}

}
