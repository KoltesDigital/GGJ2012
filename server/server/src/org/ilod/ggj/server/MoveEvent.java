package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class MoveEvent implements Event {
	private final Player p;
	private final String direction;
	
	public MoveEvent(Player p, String direction) {
		this.p = p;
		this.direction = direction;
	}

	@Override
	public boolean applyEvent() {
		p.setDirection(direction);
		try {
			JSONObject jo = new JSONObject();
			jo.put("type", "move");
			jo.put("direction", direction);
			jo.put("x", p.getX());
			jo.put("y", p.getY());
			jo.put("timestamp", p.getTeam().getGame().getTimestamp());
			p.getTeam().getGame().sendToAll(jo.toString());
			return true;
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}
	}

}
