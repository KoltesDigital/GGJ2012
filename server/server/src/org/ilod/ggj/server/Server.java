package org.ilod.ggj.server;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Collection;
import java.util.Iterator;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;

import org.json.JSONException;
import org.json.JSONObject;

import net.tootallnate.websocket.WebSocket;
import net.tootallnate.websocket.WebSocketServer;

public class Server extends WebSocketServer {
	private int id = 0;
	private final Queue<Event> events = new ConcurrentLinkedQueue<Event>();
	private final Team brocoli = new Team(0, this);
	private final Team carrote = new Team(1, this);
	private final Map<WebSocket, Player> players = new ConcurrentHashMap<WebSocket, Player>();
	private long timestamp;
	private final Turn turn = new Turn();
	
	public static void main(String[] args) {
		new Server().start();
	}
	
	private Server() {
		super(new InetSocketAddress(8133));
		new Thread(turn).start();
	}
	
	private Team getTeamToRenforce() {
		if (brocoli.getSize() > carrote.getSize()) {
			carrote.addClient();
			return carrote;
		} else {
			brocoli.addClient();
			return brocoli;
		}
	}
	
	@Override
	public void onClientClose(WebSocket conn) {
		Player p = players.remove(conn);
		p.kill();
		p.getTeam().removeClient();
	}
	
	@Override
	public void onClientMessage(WebSocket conn, String message) {
		try {
			JSONObject jo = new JSONObject(message);
			String s = jo.getString("type");
			if ("move".equals(s)) {
				events.add(new MoveEvent(players.get(conn), jo.getInt("xMove"), jo.getInt("yMove")));
			} else if ("startHit".equals(s)) {
				events.add(new StartHitEvent(players.get(conn)));
			} else if ("stoptHit".equals(s)) {
				events.add(new StopHitEvent(players.get(conn)));
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void onClientOpen(WebSocket conn) {
		events.add(new SpawnEvent(conn, getTeamToRenforce(), id++));
	}
	
	@Override
	public void onError(WebSocket conn, Exception ex) {
		conn.close();
	}
	
	public void addPlayer(WebSocket ws, Player p) {
		players.put(ws, p);
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "spawn");
			jo.put("id", p.getId());
			jo.put("team", p.getTeam().getId());
			jo.put("x", p.getX());
			jo.put("y", p.getY());
			jo.put("work", p.getType());
			this.sendToAll(jo.toString());
		} catch (JSONException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
	}
	
	public void removePlayer(Player p) {
		players.remove(p.getSocket());
	}
	
	public void addEvent(Event e) {
		events.add(e);
	}
	
	private void processEvents() {
		Iterator<Event> iter = events.iterator();
		while (iter.hasNext()) {
			Event e = iter.next();
			if (e.applyEvent()) iter.remove();
		}
	}
	
	public long getTimestamp() {
		return timestamp;
	}
	
	private void processTurn() {
		long ts = System.currentTimeMillis();
		long delta = ts - timestamp;
		if (delta < 34) {
			this.processEvents();
		} else {
			this.timestamp = ts;
			this.processEvents();
			this.processMoves(delta);
			this.processHits(delta);
		}
	}
	
	private void processMoves(long delta) {
		for (Player p : players.values()) {
			p.move(delta);
		}
	}
	
	private void processHits(long delta) {
		for (Player p : players.values()) {
			if (p.isHitting()) {
				p.hit(delta);
			}
		}
	}
	
	public Collection<Player> getPlayers() {
		return players.values();
	}
	
	public class Turn implements Runnable {
		@Override
		public void run() {
			for (;;) processTurn();
		}
	}

}
