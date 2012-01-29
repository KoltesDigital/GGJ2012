package org.ilod.ggj.server;

public class StartHitEvent implements Event {
	private final Player p;
	
	public StartHitEvent(Player p) {
		this.p = p;
	}

	@Override
	public boolean applyEvent() {
		p.setHitting(true);
		return true;
	}

}
