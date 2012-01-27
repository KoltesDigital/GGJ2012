package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class SpawnEvent implements Event {
	private final Client c;
	
	public SpawnEvent(Client c) {
		this.c = c;
	}
	
	public Client getClient() {
		return c;
	}
	
	public boolean applyEvent() {
		Player p = c.getTeam().createPlayer(c);
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "spawn");
			jo.put("id", p.getId());
			jo.put("team", c.getTeam().getId());
			jo.put("x", p.getX());
			jo.put("y", p.getY());
			jo.put("class", p.getType());
			c.getGame().sendToAll(jo.toString());
			return true;
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}
	}
}
