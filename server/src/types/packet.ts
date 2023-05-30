import { BASE_RADIUS } from "../constants";
import { Player } from "../store/entities";
import Building from "./building";
import { Entity } from "./entity";
import { Vec2 } from "./math";
import { MinBuilding, MinEntity, MinMinObstacle, MinObstacle, MinParticle, MinTerrain } from "./minimized";
import { MovementDirection } from "./misc";
import { Obstacle } from "./obstacle";
import { Particle } from "./particle";
import { Terrain } from "./terrain";

export interface IPacket {
	type: string;
}

export class ResponsePacket implements IPacket {
	type = "response";
	id!: string;
	username!: string;
}

class PingPacket implements IPacket {
	type = "ping";
}

interface MovementPacket extends IPacket {
	type: string;
	direction: MovementDirection;
}

export class MovementPressPacket implements MovementPacket {
	type = "movementpress";
	direction!: MovementDirection;
}

export class MovementReleasePacket implements MovementPacket {
	type = "movementrelease";
	direction!: MovementDirection;
}

interface MousePacket extends IPacket {
	type: string;
	button: number;
}

export class MousePressPacket implements MousePacket {
	type = "mousepress";
	button!: number;
}

export class MouseReleasePacket implements MousePacket {
	type = "mouserelease";
	button!: number;
}

export class MouseMovePacket implements IPacket {
	type = "mousemove";
	x!: number;
	y!: number;
}

export class InteractPacket implements IPacket {
	type = "interact";
}

export class SwitchWeaponPacket {
	type = "switchweapon";
	delta!: number;
	setMode!: boolean;
}

export class ReloadWeaponPacket {
	type = "reloadweapon";
}

export class UseHealingPacket {
	type = "usehealing";
	item!: string;
}

export type ClientPacketResolvable = ResponsePacket | PingPacket | MousePressPacket | MouseReleasePacket | MouseMovePacket | MovementPressPacket | MovementReleasePacket | InteractPacket | SwitchWeaponPacket | ReloadWeaponPacket;

export class AckPacket implements IPacket {
	type = "ack";
	id: string;
	tps: number;
	size: number[];
	terrain: string;

	constructor(id: string, tps: number, size: Vec2, terrain: Terrain) {
		this.id = id;
		this.tps = tps;
		this.size = Object.values(size);
		this.terrain = terrain.id;
	}
}

export class GamePacket implements IPacket {
	type = "game";
	entities: MinEntity[];
	obstacles: MinObstacle[];
	player: Player;
	alivecount: number;
	discardEntities?: string[];
	discardObstacles?: string[];

	constructor(entities: Entity[], obstacles: Obstacle[], player: Player, alivecount: number, sendAll = false, discardEntities: string[] = [], discardObstacles: string[] = []) {
		this.entities = (sendAll ? entities : entities.filter(entity => entity.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2))).map(entity => entity.minimize());
		this.obstacles = (sendAll ? obstacles : obstacles.filter(obstacle => obstacle.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2))).map(obstacle => obstacle.minimize());
		this.player = player;
		this.alivecount = alivecount;
		if (discardEntities.length) this.discardEntities = discardEntities;
		if (discardObstacles.length) this.discardObstacles = discardObstacles;
	}
}

export class MapPacket implements IPacket {
	type = "map";
	obstacles: MinMinObstacle[];
	buildings: MinBuilding[];
	terrains: MinTerrain[]

	constructor(obstacles: Obstacle[], buildings: Building[], terrains: Terrain[]) {
		this.obstacles = obstacles.map(obstacle => obstacle.minmin());
		this.buildings = buildings.map(building => building.minimize());
		this.terrains = terrains.map(terrain => terrain.minimize());
	}
}

export class AnnouncePacket implements IPacket {
	type = "announce";
	announcement: string;

	constructor(announcement: string) {
		this.announcement = announcement;
	}
}

// Let the client handle particles
export class ParticlesPacket implements IPacket {
	type = "particles";
	particles: MinParticle[];

	constructor(particles: Particle[], player: Player) {
		this.particles = particles.filter(particle => particle.position.addVec(player.position.inverse()).magnitudeSqr() < Math.pow(BASE_RADIUS * player.scope, 2)).map(particle => particle.minimize());
	}
}

export class SoundPacket implements IPacket {
	type = "sound";
	// No need to include "client/assets/sounds"
	path: string;
	position: Vec2;

	constructor(path: string, position: Vec2) {
		this.path = path;
		this.position = position;
	}
}