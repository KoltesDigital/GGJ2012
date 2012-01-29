package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class Lancer extends Player {
	private static final int ALLONGE = 64;
	public static final int HITBOX = 16;
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
		System.out.println("hit");
		final int yHit = (hitDirection == 0 ? -1 : hitDirection == 2 ? 1 : 0);
		final int xHit = (hitDirection == 3 ? -1 : hitDirection == 1 ? 1 : 0);
		for (Player p : this.getTeam().getServer().getPlayers()) {
			if (p.getTeam() == this.getTeam()) continue;
			System.out.println("player");
			int d = ALLONGE + p.getHitbox();
			System.out.println(this.getSquareDistance(p));
			System.out.println(d*d);
			if (this.getSquareDistance(p) < d*d) {
				System.out.println("player2");
				double bc = y - p.y;
				double ab = x - p.x;
				boolean ok = false;
				if (ab == 0) {
					System.out.println("player3");
					ok = ((bc == 0) || (bc * yHit < 0));
				} else if (bc == 0) {
					System.out.println("player4");
					ok = (ab * xHit < 0);
				} else {
					System.out.println("player5");
					double a = Math.atan2(bc, ab);
					if (xHit == 0) {
						System.out.println("player6");
						if (yHit == 0) {
							
						} else if (yHit > 0) {
							ok = (a > Math.PI / 4 && a < 3 * Math.PI / 4);
						} else {
							ok = (a < -Math.PI / 4 && a > -3 * Math.PI / 4);
						}
					} else if (xHit > 0) {
						System.out.println("player7");
						if (yHit == 0) {
							ok = (a < Math.PI / 4 && a > -Math.PI / 4);
						} else if (yHit > 0) {
							ok = (a > 0 && a < Math.PI / 2);
						} else {
							ok = (a < 0 && a > -Math.PI / 2);
						}
					} else {
						System.out.println("player8");
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
					System.out.println("player9");
					hitten = true;
					int dom = (int)(DOMMAGES * delta / 1000);
					int hp = p.hp.addAndGet(-dom);
					if (hp <= 0 && dom+hp > 0) {
						p.kill();
					}
				}
				System.out.println("player10");
			}
		}
	}
}
