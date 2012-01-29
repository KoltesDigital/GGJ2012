package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class ListServEvent implements Event {
	private final Client c;
	private final Server s;
	
	public ListServEvent(Client c, Server s) { // A optimiser
		this.c = c;
		this.s = s;
	}

	@Override
	public boolean applyEvent() {
		s.sendServ(c);
		return true;
	}

}
