package org.ilod.ggj.server;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

public class Team {
	private final AtomicInteger nClients = new AtomicInteger();
	private final String id;
	private final Server server;
	
	public Team(String id, Server server) {
		this.id = id;
		this.server = server;
	}
	
	public Server getServer() {
		return server;
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
	
	public String getId() {
		return id;
	}
}
