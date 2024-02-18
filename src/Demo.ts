import { AmbientLight, DirectionalLight, Mesh, PerspectiveCamera, Scene, WebGLRenderer, PlaneGeometry, MeshPhysicalMaterial } from "three";
import { File, NoteOnEvent, ReadStream } from "@perry-rylance/midi";
import { TimeResolver } from "@perry-rylance/midi-to-milliseconds";

import { capture } from "../package.json";

import bytes from "./Chopin";
import Cube from "./Cube";

export default class Demo
{
	private midi: File;
	private resolver: TimeResolver;
	private renderer: WebGLRenderer;
	private scene: Scene;
	private camera: PerspectiveCamera;
	private cubes: Cube[];

	constructor()
	{
		this.initMidi();
		this.initRenderer();		
		this.initScene();
		this.initCamera();
		this.initLighting();
	}

	private initMidi()
	{
		this.midi = File.fromBase64(bytes);
		this.resolver = new TimeResolver(this.midi);
	}

	private initRenderer()
	{
		const { width, height } = capture;

		const canvas = document.querySelector("canvas")!;

		canvas.width = width;
		canvas.height = height;

		this.renderer = new WebGLRenderer({
			canvas,
			antialias: true
		});
	}

	private initCamera()
	{
		const { width, height } = capture;

		this.camera = new PerspectiveCamera(30, width / height, 0.1, 1000);

		this.camera.position.x = 6;
		this.camera.position.y = 18;
		this.camera.position.z = 6;

		this.camera.lookAt(0, 0, 0);
	}

	private initScene()
	{
		this.scene = new Scene();

		// NB: FLoor
		const floor = new Mesh(
			new PlaneGeometry(64, 64), 
			new MeshPhysicalMaterial({
				color: 0x292c2e,
				roughness: 1,
				metalness: 0,
				ior: 1.5,
				reflectivity: 0.5
			})
		);

		floor.rotation.x = -Math.PI / 2;

		this.scene.add(floor);

		// NB: Cubes
		const radius = 4;

		this.cubes = [];
		
		for(let i = 0; i < 12; i++)
		{
			const angle = 2 * Math.PI * (i / 12);
			const cube = new Cube(i);

			cube.position.x = -Math.sin(angle) * radius;
			cube.position.z = Math.cos(angle) * radius;

			cube.rotation.y = -angle;

			this.scene.add(cube);
			this.cubes.push(cube);
		}
	}

	private initLighting()
	{
		this.scene.add( new AmbientLight(0xffffff, 0.1) );

		const light = new DirectionalLight(0xffffff, 0.1);
		light.position.set(3, 12, 5);
		light.lookAt(0, 0, 0);

		this.scene.add(light);
	}

	render(playhead: number)
	{
		const { fps } = capture;
		const seconds = playhead * capture.duration;

		const start = seconds * 1000;
		const end = (seconds + 1 / fps) * 1000;
		const piano = this.resolver.tracks[0];
		const events = piano.getEventsBetweenMilliseconds(start, end);

		for(let i = 0; i < this.cubes.length; i++)
		{
			const cube = this.cubes[i];

			cube.update(
				playhead, 
				events
					.filter(event => event.original instanceof NoteOnEvent)
					.filter(event => ((event.original as NoteOnEvent).key % 12) === i)
					.map(event => event.original as NoteOnEvent)
			);
		}

		this.camera.position.x = 6 - Math.sin(playhead / 5);
		this.camera.position.y = 18 + Math.cos(playhead / 7);
		this.camera.lookAt(0, 0, 0);

		this.renderer.render(this.scene, this.camera);
	}
}