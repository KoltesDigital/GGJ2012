package org.ilod.ggj.server;

import java.nio.channels.NotYetConnectedException;

import org.json.JSONException;
import org.json.JSONObject;

import net.tootallnate.websocket.WebSocket;

public class MyIdEvent implements Event {
	private final Client c;
	
	public MyIdEvent(Client c) {
		this.c = c;
	}

	@Override
	public boolean applyEvent() {
		JSONObject jo = new JSONObject();
		try {
			jo.put("type", "id");
			jo.put("id", c.getId());
			c.getSocket().send(jo.toString());
		} catch (JSONException e) {
			throw new RuntimeException(e);
		} catch (NotYetConnectedException e) {
			throw new RuntimeException(e);
		} catch (IllegalArgumentException e) {
			throw new RuntimeException(e);
		} catch (InterruptedException e) {
			throw new RuntimeException(e);
		}
		return true;
	}

}
