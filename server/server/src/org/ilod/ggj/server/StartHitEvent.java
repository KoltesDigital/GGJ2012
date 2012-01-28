package org.ilod.ggj.server;

public class StartHitEvent implements Event {
	private final Player p;
	private final int direction;
	
	public StartHitEvent(Player p, int direction) {
		this.p = p;
		this.direction = direction;
	}

	@Override
	public boolean applyEvent() {
		p.setHitting(true);
		p.setHitDirection(direction);
		return true;
	}

}
