package org.ilod.ggj.server;

import org.json.JSONException;
import org.json.JSONObject;

public class DisconnectEvent implements Event {
	private final Client c;
	private final Server s;
	
	public DisconnectEvent(Client c, Server s) {
		this.c = c;
		this.s = s;
	}

	@Override
	public boolean applyEvent() {
		c.getTeam().removeClient();
		s.removeClient(c);
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "disconnect");
			jo.put("id", c.getId());
			s.sendToAll(jo.toString());
		} catch (JSONException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
		return true;
	}

}
