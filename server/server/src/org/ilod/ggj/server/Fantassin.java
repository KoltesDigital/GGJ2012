package org.ilod.ggj.server;

public class Fantassin implements Player {
	private float x = 0;
	private float y = 0;
	private final int id;
	private final Team team;
	private String direction;
	private int xMove;
	private int yMove;
	private boolean dead = false;
	
	public Fantassin(int id, Team team) {
		this.id = id;
		this.team = team;
	}
	
	@Override
	public int getId() {
		return id;
	}
	
	@Override
	public float getX() {
		return x;
	}
	
	@Override
	public float getY() {
		return y;
	}
	
	@Override
	public String getType() {
		return "fantassin";
	}
	
	@Override
	public Team getTeam() {
		return team;
	}
	
	public void setDirection(String direction) {
		if (!direction.equals(this.direction)) {
			this.direction = direction;
			switch (direction) {
			case "haut":
				xMove = 0;
				yMove = -1;
				break;
			case "bas":
				xMove = 0;
				yMove = 1;
				break;
			case "gauche":
				xMove = -1;
				yMove = 0;
				break;
			case "droite":
				xMove = 1;
				yMove = 0;
				break;
			default:
				xMove = 0;
				yMove = 0;
				break;
			}
		}
	}
	
	public void kill() {
		if (dead) return;
		dead = true;
		this.getTeam().getGame().addEvent(new KillEvent(this));
	}
}
