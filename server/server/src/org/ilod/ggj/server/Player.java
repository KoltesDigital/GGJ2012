package org.ilod.ggj.server;

public interface Player {
	float getX();
	float getY();
	int getId();
	String getType();
	Team getTeam();
	void setDirection(String direction);
	void kill();
}
