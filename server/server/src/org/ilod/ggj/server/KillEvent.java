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
		p.getTeam().getServer().removePlayer(p);
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "dead");
			jo.put("id", p.getId());
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
