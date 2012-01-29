package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class Client {
	private final WebSocket ws;
	private final int id;
	private int work;
	private Team team;
	
	public Client(WebSocket ws, int id, Team team) {
		this.ws = ws;
		this.id = id;
		this.team = team;
		this.work = (int)(Math.random()*3);
	}
	
	public void setWork(int work) {
		this.work = work;
	}
	
	public void setTeam(Team team) {
		this.team = team;
	}
	
	public int getId() {
		return id;
	}
	
	public int getWork() {
		return work;
	}
	
	public Team getTeam() {
		return team;
	}
	
	public WebSocket getSocket() {
		return ws;
	}
}
