package org.ilod.ggj.server;

import java.util.Iterator;
import java.util.Queue;
import java.util.concurrent.ConcurrentLinkedQueue;

public class Game implements Runnable {
	private final Team brocoli = new Team("brocoli", this);
	private final Team carrote = new Team("carrote", this);
	private final Queue<Event> events = new ConcurrentLinkedQueue<>();
	private final Queue<Client> clients = new ConcurrentLinkedQueue<>();
	private long timestamp;
	
	public Team getTeam() {
		return (brocoli.getSize() > carrote.getSize() ? carrote : brocoli);
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
	
	public void addClient(Client c) {
		this.clients.add(c);
	}
	
	public void removeClient(Client c) {
		this.clients.remove(c);
	}
	
	public void sendToAll(String s) {
		for (Client c : clients) {
			c.send(s);
		}
	}
	
	public long getTimestamp() {
		return timestamp;
	}
	
	private void processTurn() {
		long ts = System.currentTimeMillis();
		long delta = ts - timestamp;
		this.timestamp = ts;
		this.processEvents();
		this.processMoves(delta);
	}
	
	private void processMoves(long delta) {
		brocoli.processMoves(delta);
		carrote.processMoves(delta);
	}
	
	public void run() {
		for (;;) processTurn();
	}
}
