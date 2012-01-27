package org.ilod.ggj.server;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class Team {
	private final Map<Player, Player> players = new ConcurrentHashMap<>();
	private final AtomicInteger nClients = new AtomicInteger();
	private final String id;
	private final Game game;
	
	public Team(String id, Game game) {
		this.id = id;
		this.game = game;
	}
	
	public void processMoves(long delta) {
		for (Player p : players.values()) {
			p.move(delta);
		}
	}
	
	public Game getGame() {
		return game;
	}
	
	public int getSize() {
		return nClients.get();
	}
	
	public void addClient() {
		nClients.incrementAndGet();
	}
	
	public void removeClient() {
		nClients.decrementAndGet();
	}
	
	public Player createPlayer(Client c) {
		Player p = new Fantassin(c.getId(), this);
		players.put(p, p);
		return p;
	}
	
	public void removePlayer(Player p) {
		players.remove(p);
	}
	
	public String getId() {
		return id;
	}
}
