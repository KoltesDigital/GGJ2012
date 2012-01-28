package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class ListServEvent implements Event {
	private final WebSocket ws;
	private final Server s;
	
	public ListServEvent(WebSocket ws, Server s) { // A optimiser
		this.ws = ws;
		this.s = s;
	}

	@Override
	public boolean applyEvent() {
		s.sendServ(ws);
		return true;
	}

}
