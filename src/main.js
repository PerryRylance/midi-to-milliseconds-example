import Demo from './Demo';

const demo = new Demo();

window.render = function(playhead) {
	demo.render(playhead);
}

render();