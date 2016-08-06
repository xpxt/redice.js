var game =
{
	canvas:
	{
		load: function ()
		{
			let canvas = window.document.createElement ('canvas');
				canvas.style.left = 0;
				canvas.style.position = 'absolute';
				canvas.style.top = 0;

			game.canvas.clear = function ()
			{
				game.canvas.context.clearRect (0, 0, game.canvas.width, game.canvas.height);
			}

			game.canvas.context = canvas.getContext ('2d');

			game.canvas.resize = function ()
			{
				canvas.height = game.canvas.height = window.innerHeight;
				canvas.width = game.canvas.width = window.innerWidth;
				game.draw ();
			}

			game.canvas.resize ();

			window.onresize = game.canvas.resize;

			window.document.body.appendChild (canvas);
		}
	},

	create:
	{
		box: function (_)
		{
			let o = game.create.object (_);
				o.color = _.color || '#000';
				o.z = _.z || 0;

				o.draw = function ()
				{
					let hwxy = game.get.hwxy (o);
					game.canvas.context.fillStyle = o.color;
					game.canvas.context.fillRect (hwxy.x, hwxy.y, hwxy.w, hwxy.h);
				}

			o.draw ();
			return o;
		},

		object: function (_)
		{
			let o = _ || {};
				o.class = o.class || 'object';
				o.id = o.id || o.class + Object.keys (game.object).length;
				o.load = function () { game.object[o.id] = o; }
			return o;
		}
	},

	draw: function ()
	{
		let scene = {};

		for (let id in game.object)
		{
			let object = game.object[id];
			if (scene[object.z] == undefined) { scene[object.z] = []; }
			scene[object.z].push (object);

		}

		for (let z in scene)
		{
			let layer = scene[z];
			for (let i = 0; i < layer.length - 1; i++)
			{
				let swaped = false;
				let j = 0
				let n = 0;
				while (j < layer.length - 1)
				{
					let o0 = layer[j];
					let y0 = game.get.y (o0) + game.get.h (o0);
					let o1 = layer[j + 1];
					let y1 = game.get.y (o1) + game.get.h (o1);
					if (y0 > y1)
					{
						let temp = layer[j];
						layer[j] = layer[j + 1];
						layer[j + 1] = temp;
						swaped = true;
					}
					j++;
				}

				if (!swaped) break;
			}

			for (let o of layer) o.draw ();
		}
	},

	event:
	{
		load: function ()
		{
			window.onmousedown = game.event.update;
			window.onmouseup = game.event.update;
			game.event.tick = game.event.update;
		},

		set tick (f)
		{
			window.setInterval (function () { game.time += game.tick; f ({ type: 'tick' });  }, game.tick);
		},

		update: function (event)
		{
			for (let id in game.object)
			{
				for (let name in game.object[id])
				{
					if (name == event.type) { game.object[id][name] (event); }
				}
			}
		}
	},

	get:
	{
		h: function (o)
		{
			let h = (o.h > 1) ? o.h : o.h * game.canvas.height;
				h = (o.hk) ? o.hk * game.get.w (o) : h;
			return h;
		},

		hwxy: function (o)
		{
			let hwxy = {};
				hwxy.h = game.get.h (o);
				hwxy.w = game.get.w (o);
				hwxy.x = game.get.x (o);
				hwxy.y = game.get.y (o);
			return hwxy;
		},

		w: function (o)
		{
			let w = (o.w > 1) ? o.w : o.w * game.canvas.width;
				w = (o.wk) ? o.wk * game.get.h (o) : w;
			return w;
		},

		x: function (o)
		{
			let x = (o.x > 1) ? o.x : o.x * game.canvas.width;
				x = (o.xk) ? x - o.xk * game.get.w (o) : x;
			return x;
		},

		y: function (o)
		{
			let y = (o.y > 1) ? o.y : o.y * game.canvas.height;
				y = (o.yk) ? y - o.yk * game.get.h (o) : y;
			return y;
		}
	},

	object: {},

	run: function ()
	{
		game.canvas.load ();
		game.event.load ();

		game.create.box
		({
			h: 0.5,
			wk: 1,
			x: 0.5, xk: 0.5,
			y: 0.5, yk: 0.5
		}).load ();

		game.create.box
		({
			color: '#f00',
			h: 0.4,
			wk: 1,
			x: 0.6, xk: 0.5,
			y: 0.56, yk: 0.5
		}). load ();
	},

	tick: 50,

	time: 0
}

window.onload = game.run;