package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class Horseman extends Player {
	private static final int ALLONGE = 32;
	private static final int HITBOX = 16;
	private static final int HP = 300;
	private static final int DOMMAGES = 200;
	private static final int MOVE_SPEED = 45;
	
	public Horseman(Client c, Team team, int id) {
		super(c, team, id, HP, MOVE_SPEED, HITBOX);
	}
	
	@Override
	public int getType() {
		return 1;
	}
	
	@Override
	public void arrow(int power) {
	}
	
	@Override
	public void hit(long delta) {
		final int yHit = (hitDirection == 0 ? -1 : hitDirection == 2 ? 1 : 0);
		final int xHit = (hitDirection == 3 ? -1 : hitDirection == 1 ? 1 : 0);
		for (Player p : this.getTeam().getServer().getPlayers()) {
			if (p.getTeam() == this.getTeam()) continue;
			if (!p.isHitting() && (p instanceof Lancer)) continue;
			int d = ALLONGE + p.getHitbox();
			if (this.getSquareDistance(p) < d*d) {
				double bc = y - p.y;
				double ab = x - p.x;
				boolean ok = false;
				if (ab == 0) {
					ok = ((bc == 0) || (bc * yHit < 0));
				} else if (bc == 0) {
					ok = (ab * xHit < 0);
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
					int hp = p.hp.addAndGet(-dom);
					if (hp <= 0 && dom+hp > 0) {
						p.kill();
					}
				}
			}
		}
	}
}
