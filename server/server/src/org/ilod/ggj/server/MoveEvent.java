package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class MoveEvent implements Event {
	private final Player p;
	private final int xMove;
	private final int yMove;
	
	public MoveEvent(Player p, int xMove, int yMove) {
		this.p = p;
		this.xMove = xMove;
		this.yMove = yMove;
	}

	@Override
	public boolean applyEvent() {
		p.setDirection(xMove, yMove);
		try {
			JSONObject jo = new JSONObject();
			jo.put("type", "move");
			jo.put("id", p.getId());
			jo.put("xMove", xMove);
			jo.put("yMove", yMove);
			jo.put("x", p.getX());
			jo.put("y", p.getY());
			jo.put("timestamp", p.getTeam().getServer().getTimestamp());
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
