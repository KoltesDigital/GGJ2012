package org.ilod.ggj.server;

import java.util.concurrent.ThreadLocalRandom;

import net.tootallnate.websocket.WebSocket;

import org.json.JSONException;
import org.json.JSONObject;

public class SpawnEvent implements Event {
	private final WebSocket ws;
	private final int id;
	private final Team team;
	
	public SpawnEvent(WebSocket ws, Team team, int id) {
		this.ws = ws;
		this.id = id;
		this.team = team;
	}
	
	public boolean applyEvent() {
		Player p;
		switch (ThreadLocalRandom.current().nextInt(3)) {
		case 0:
			p = new Lancer(ws, team, id);
			break;
		case 1:
			p = new Horseman(ws, team, id);
			break;
		default:
			p = new Archer(ws, team, id);
		}
		team.getServer().addPlayer(ws, p);
		return true;
	}
}
