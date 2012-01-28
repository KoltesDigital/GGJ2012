package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class Fantassin extends Player {
	private static final int ALLONGE = 32;
	private static final int HITBOX = 16;
	private static final int HP = 100;
	private static final int DOMMAGES = 40;
	
	public Fantassin(WebSocket ws, Team team, int id) {
		super(ws, team, id, HP);
	}
	
	@Override
	public String getType() {
		return "fantassin";
	}
	
	@Override
	public void hit(long delta) {
		for (Player p : this.getTeam().getServer().getPlayers()) {
			int d = ALLONGE + p.getHitbox();
			if (this.getSquareDistance(p) < d*d) {
				int dom = (int)(DOMMAGES * delta / 1000);
				int hp = p.hp.addAndGet(dom);
				if (hp <= 0 && dom+hp > 0) {
					p.kill();
				}
			}
		}
	}
	
	@Override
	public int getHitbox() {
		return HITBOX;
	}
}
