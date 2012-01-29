package org.ilod.ggj.server;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedQueue;
import java.util.concurrent.atomic.AtomicInteger;

import org.json.JSONException;
import org.json.JSONObject;

import net.tootallnate.websocket.WebSocket;
import net.tootallnate.websocket.WebSocketServer;

public class Server extends WebSocketServer {
	private final AtomicInteger id = new AtomicInteger();
	private final Queue<Event> events = new ConcurrentLinkedQueue<Event>();
	private final Team brocoli = new Team(0, this);
	private final Team carrote = new Team(1, this);
	private final Map<WebSocket, Player> players = new ConcurrentHashMap<WebSocket, Player>();
	private final Map<WebSocket, Client> clients = new ConcurrentHashMap<WebSocket, Client>();
	private final Queue<Arrow> arrows = new ConcurrentLinkedQueue<Arrow>();
	private long timestamp;
	private final Turn turn = new Turn();
	private final Tile[][] tiles = new Tile[20][20];
	
	public static void main(String[] args) {
		new Server().start();
	}
	
	private Server() {
		super(new InetSocketAddress(8133));
		for (int i = 0 ; i < 20 ; i++) {
			for (int j = 0 ; j < 20 ; j++) {
				tiles[i][j] = new Tile(i * 250 - 2500, j * 250 - 2500, 250, 250);
			}
		}
		new Thread(turn).start();
	}
	
	private Team getTeamToRenforce() {
		if (brocoli.getSize() < carrote.getSize()) {
			brocoli.addClient();
			return brocoli;
		} else {
			carrote.addClient();
			return carrote;
		}
	}
	
	@Override
	public void onClientClose(WebSocket conn) {
		Player p = players.remove(conn);
		if (p != null) p.disconnect();
		addEvent(new DisconnectEvent(clients.get(conn), this));
	}
	
	public void removeClient(Client c) {
		clients.remove(c.getSocket());
	}
	
	@Override
	public void onClientMessage(WebSocket conn, String message) {
		try {
			JSONObject jo = new JSONObject(message);
			String s = jo.getString("type");
			if ("ping".equals(s)) {
				JSONObject jos = new JSONObject();
				jos.put("type", "pong");
				jos.put("data", jo.get("data"));
				jos.put("ts", System.currentTimeMillis());
				try {
					conn.send(jos.toString());
				} catch (InterruptedException e) {
					throw new RuntimeException(e);
				}
			} else if ("move".equals(s)) {
				events.add(new MoveEvent(players.get(conn), jo.getInt("xMove"), jo.getInt("yMove"), jo.getInt("direction")));
			} else if ("startHit".equals(s)) {
				events.add(new StartHitEvent(players.get(conn)));
			} else if ("stopHit".equals(s)) {
				events.add(new StopHitEvent(players.get(conn)));
			} else if ("change".equals(s)) {
				Client c = clients.get(conn);
				c.setWork(jo.getInt("character"));
				Player p = players.get(conn);
				if (p != null) p.kill();
			}
		} catch (JSONException e) {
			e.printStackTrace();
		}
	}
	
	@Override
	public void onClientOpen(WebSocket conn) {
		Client c = new Client(conn, id.getAndIncrement(), getTeamToRenforce());
		clients.put(conn, c);
		events.add(new ListServEvent(c, this));
		events.add(new SpawnEvent(c, 0));
		events.add(new MyIdEvent(c));
	}
	
	@Override
	public void onError(WebSocket conn, Exception ex) {
		conn.close();
	}
	
	public void addPlayer(Client c, Player p) {
		players.put(c.getSocket(), p);
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
	
	public void sendServ(Client c) {
		JSONObject jo = new JSONObject();
		for (Player p : players.values()) {
			try {
				jo.put("type", "spawn");
				jo.put("id", p.getId());
				jo.put("team", p.getTeam().getId());
				jo.put("x", p.getX());
				jo.put("y", p.getY());
				jo.put("work", p.getType());
				c.getSocket().send(jo.toString());
			} catch (JSONException e) {
				throw new RuntimeException(e);
			} catch (InterruptedException e) {
				throw new RuntimeException(e);
			}
		}
	}
	
	public void removePlayer(Player p) {
		players.remove(p.getClient().getSocket());
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
			this.processArrows(delta);
			this.processHits(delta);
			this.processEvents();
			this.processMoves(delta);
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
	
	private void processArrows(long delta) {
		Iterator<Arrow> iter = arrows.iterator();
		while (iter.hasNext()) {
			if (iter.next().doAction(delta)) iter.remove();
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
	
	public void addArrow(Arrow a) {
		this.arrows.add(a);
	}
	
	public Tile getTileAtPos(int x, int y) {
		return tiles[(x + 2500) / 250][(y + 2500) / 250];
	}
	
	public Tile getTile(int i, int j) {
		return tiles[i][j];
	}

}
