import { world } from "../..";
import { CommonAngles, RectHitbox, Vec2 } from "../../types/maths";
import { GameObject } from "../../types/objects";
import { GunColor } from "../../types/misc";
import { Gun } from "../entities";
import { World } from "../../types/terrain";

export default class Crate extends GameObject {
	type = "crate";

	constructor(world: World) {
		const hitbox = new RectHitbox(4, 4);
		super(world, hitbox, hitbox.scaleAll(0.75), 80, 80);
		this.direction = Vec2.ONE;
		while (world.obstacles.find(obstacle => obstacle.collided(this.hitbox, this.position, this.direction))) this.position = world.size.scale(Math.random(), Math.random());
	}

	die() {
		super.die();
		// TODO: Spawn loots
		const gun = new Gun("m9", GunColor.YELLOW);
		gun.position = this.position;
		gun.velocity = Vec2.ONE.addAngle(Math.random() * CommonAngles.TWO_PI).scaleAll(0.025);
		world.entities.push(gun);
	}
}