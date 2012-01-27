package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class KillEvent implements Event {
	private final Player p;
	
	public KillEvent(Player p) {
		this.p = p;
	}
	
	@Override
	public boolean applyEvent() {
		p.getTeam().removePlayer(p);
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "dead");
			jo.put("id", p.getId());
			p.getTeam().getGame().sendToAll(jo.toString());
			return true;
		} catch (JSONException e) {
			throw new RuntimeException(e);
		}
	}
}
