package org.ilod.ggj.server;

import net.tootallnate.websocket.WebSocket;

public class Archer extends Player {
	private static final int ALLONGE = 1000;
	private static final int ARROW_SPEED = 60;
	private static final int HITBOX = 16;
	private static final int HP = 300;
	private static final int DOMMAGES = 200;
	private static final int MOVE_SPEED = 30;
	
	public Archer(Client c, Team team, int id) {
		super(c, team, id, HP, MOVE_SPEED, HITBOX);
	}
	
	@Override
	public int getType() {
		return 2;
	}
	
	@Override
	public void hit(long delta) {
	}
	
	@Override
	public void arrow(int power) {
		this.getTeam().getServer().addArrow(new Arrow(this.getTeam(), this.x, this.y, this.xMoveOld, this.yMoveOld, ARROW_SPEED, DOMMAGES, ALLONGE));
	}

}
