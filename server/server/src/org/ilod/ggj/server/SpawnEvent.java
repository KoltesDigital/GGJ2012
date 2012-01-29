package org.ilod.ggj.server;


import net.tootallnate.websocket.WebSocket;

import org.json.JSONException;
import org.json.JSONObject;

public class SpawnEvent implements Event {
	private final WebSocket ws;
	private final int id;
	private final Team team;
	private final long ts;
	
	public SpawnEvent(WebSocket ws, Team team, int id) {
		this(ws, team, id, System.currentTimeMillis() + 3000);
	}

	public SpawnEvent(WebSocket ws, Team team, int id, long ts) {
		this.ws = ws;
		this.id = id;
		this.team = team;
		this.ts = ts;
	}
	
	public boolean applyEvent() {
		if (System.currentTimeMillis() < ts) return false;
		Player p;
		switch ((int)(Math.random()*3)) {
		case 0:
		case 1:
		case 2:
			p = new Lancer(ws, team, id);
			break;
		case 3:
			p = new Horseman(ws, team, id);
			break;
		default:
			p = new Archer(ws, team, id);
		}
		team.getServer().addPlayer(ws, p);
		return true;
	}
}
