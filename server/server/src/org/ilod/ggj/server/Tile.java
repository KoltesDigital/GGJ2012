package org.ilod.ggj.server;

import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedList;
import java.util.List;
import java.util.Set;

public class Tile {
	private final int xMin;
	private final int xMax;
	private final int yMin;
	private final int yMax;
	private final Set<Player> players = new HashSet<Player>();
	
	public Tile(int xMin, int yMin, int width, int height) {
		this.xMin = xMin;
		this.xMax = xMin + width;
		this.yMin = yMin;
		this.yMax = yMin + height;
	}
	
	public void addPlayer(Player p) {
		players.add(p);
	}
	
	public void removePlayer(Player p) {
		players.remove(p);
	}
	
	public Collection<Player> getPlayers() {
		return players;
	}
}
