import { BoxGeometry, Object3D, PointLight, Mesh, MeshPhysicalMaterial } from "three";
import convert from "color-convert";
import { TimeResolvedEvent } from "@perry-rylance/midi-to-milliseconds";
import { NoteOnEvent } from "@perry-rylance/midi";

const geometry = new BoxGeometry( 1, 1, 1 );
const material = new MeshPhysicalMaterial({
	color: 0x7f7f7f,
	roughness: 0.5,
	metalness: 0,
	ior: 1.5,
	reflectivity: 0.5,
	transparent: true,
	opacity: 0.25
});

export default class Cube extends Object3D
{
	private light: PointLight;

	constructor(pitch: number)
	{
		super();

		const hue = 360 * pitch / 12;
		const color = Number("0x" + convert.hsl.hex(hue, 100, 50));

		const cube = new Mesh(
			geometry,
			material
		);

		cube.position.y = .5;

		this.add(cube);

		this.light = new PointLight(color, 0, 12);
		this.light.position.y = .5;

		this.add(this.light);
	}

	update(playhead: number, events: NoteOnEvent[])
	{
		const velocity = events.reduce(
			(accumulator, current) => Math.max(accumulator, current.velocity),
			0
		);

		if(events.length > 0)
			this.light.intensity = velocity;
		else
		{
			this.light.intensity = this.light.intensity * (1 - 1/15);
		}
	}
}