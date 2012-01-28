package org.ilod.ggj.server;

public class StopHitEvent implements Event {
	private final Player p;
	
	public StopHitEvent(Player p) {
		this.p = p;
	}

	@Override
	public boolean applyEvent() {
		p.setHitting(false);
		return true;
	}

}
