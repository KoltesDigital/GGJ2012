package org.ilod.ggj.server;


import net.tootallnate.websocket.WebSocket;

import org.json.JSONException;
import org.json.JSONObject;

public class SpawnEvent implements Event {
	private final Client c;
	private final int id;
	private final long ts;
	
	public SpawnEvent(Client c, int id) {
		this(c, id, System.currentTimeMillis() + 3000);
	}

	public SpawnEvent(Client c, int id, long ts) {
		this.c = c;
		this.id = id;
		this.ts = ts;
	}
	
	public boolean applyEvent() {
		if (System.currentTimeMillis() < ts) return false;
		Player p;
		switch (c.getWork()) {
		case 0:
			p = new Lancer(c, c.getTeam(), id);
			break;
		case 1:
			p = new Horseman(c, c.getTeam(), id);
			break;
		default:
			p = new Archer(c, c.getTeam(), id);
		}
		c.getTeam().getServer().addPlayer(c, p);
		return true;
	}
}
