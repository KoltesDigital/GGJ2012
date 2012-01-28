package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class Lancer extends Player {
	private static final int ALLONGE = 64;
	private static final int HITBOX = 16;
	private static final int HP = 300;
	private static final int DOMMAGES = 200;
	private static final int MOVE_SPEED = 30;
	
	public Lancer(WebSocket ws, Team team, int id) {
		super(ws, team, id, HP, MOVE_SPEED, HITBOX);
	}
	
	@Override
	public int getType() {
		return 0;
	}
	
	@Override
	public void arrow(int power) {
	}
	
	@Override
	public void hit(long delta) {
		for (Player p : this.getTeam().getServer().getPlayers()) {
			int d = ALLONGE + p.getHitbox();
			if (this.getSquareDistance(p) < d*d) {
				int bc = y - p.y;
				int ab = x - p.x;
				boolean ok = false;
				if (ab == 0) {
					ok = ((bc == 0) || (bc * yHit > 0));
				} else if (bc == 0) {
					ok = (ab * xHit > 0);
				} else {
					double a = Math.atan2(bc, ab);
					if (xHit == 0) {
						if (yHit == 0) {
							
						} else if (yHit > 0) {
							ok = (a > Math.PI / 4 && a < 3 * Math.PI / 4);
						} else {
							ok = (a < -Math.PI / 4 && a > -3 * Math.PI / 4);
						}
					} else if (xHit > 0) {
						if (yHit == 0) {
							ok = (a < Math.PI / 4 && a > -Math.PI / 4);
						} else if (yHit > 0) {
							ok = (a > 0 && a < Math.PI / 2);
						} else {
							ok = (a < 0 && a > -Math.PI / 2);
						}
					} else {
						if (yHit == 0) {
							ok = (a > 3 * Math.PI / 4 && a < -3 * Math.PI / 4);
						} else if (yHit > 0) {
							ok = (a > Math.PI / 2);
						} else {
							ok = (a < -Math.PI / 2);
						}
					}
				}
				if (ok) {
					hitten = true;
					int dom = (int)(DOMMAGES * delta / 1000);
					int hp = p.hp.addAndGet(dom);
					if (hp <= 0 && dom+hp > 0) {
						p.kill();
					}
				}
			}
		}
	}
}
