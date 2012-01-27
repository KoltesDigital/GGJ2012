package org.ilod.ggj.server;

import java.io.IOException;

import org.json.JSONException;
import org.json.JSONObject;

import websocket4j.server.WebSocket;

public class Client implements Runnable {
	private final Game game;
	private final WebSocket ws;
	private final Team team;
	private final int id;
	private volatile Player player = null;
	private boolean deco = false;
	
	public Client(Game game, WebSocket ws, int id) {
		this.game = game;
		this.ws = ws;
		this.id = id;
		this.team = game.getTeam();
	}
	
	public int getId() {
		return id;
	}
	
	public Team getTeam() {
		return team;
	}
	
	public Game getGame() {
		return game;
	}
	
	public void send(String s) {
		if (deco) return;
		try {
			ws.sendMessage(s);
		} catch (IOException e) {
			this.kill();
		}
	}
	
	private void kill() {
		if (deco) return;
		deco = true;
		try {
			ws.close();
		} catch (IOException e) {
		}
		player.kill();
		team.removeClient();
		game.removeClient(this);
	}
	
	public void run() {
		try {
			if (player == null) {
				game.addEvent(new SpawnEvent(this));
			}
			JSONObject o = new JSONObject(ws.getMessage());
			switch (o.getString("type")) {
			case "move":
				game.addEvent(new MoveEvent(player, o.getString("direction")));
			}
		} catch (IOException e) {
			this.kill();
		} catch (JSONException e) {
			// On passe au suivant
		}
	}
}
