package org.ilod.ggj.server;

public class ArrowEvent implements Event {
	private final Player p;
	private final int power;
	
	public ArrowEvent(Player p, int power) {
		this.p = p;
		this.power = power;
	}
	
	@Override
	public boolean applyEvent() {
		p.arrow(power);
		return true;
	}
}
