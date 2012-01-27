package org.ilod.ggj.server;

import java.io.IOException;

import websocket4j.server.WebServerSocket;

public class Server {
	private static int id = 0;
	private static final Game game = new Game();

	/**
	 * @param args
	 */
	public static void main(String[] args) throws IOException {
		WebServerSocket wss = new WebServerSocket(8133);
		for (;;) {
			new Thread(new Client(game, wss.accept(), id++));
		}
	}

}
