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

				o.clear = function ()
				{
					for (let id in game.object)
					{
						let object = game.object[id];
						if (game.get.inbox (o, object))
						{
							if (game.get.Y (o) > game.get.Y (object) || o.z > object.z)
							{
								object.draw ();
								for (let i in game.object)
								{
									if (i != o.id)
									{
										let io = game.object[i];
										if (game.get.inbox (object, io))
										{
											if (game.get.Y (object) < game.get.Y (io) || object.z < io.z)
											{
												io.draw ();
											}
										}
									}
								}
								console.log (object.id);
							}
						}
					}
				}

				o.draw = function ()
				{
					let hwxy = game.get.hwxy (o);
					game.canvas.context.fillStyle = o.color;
					game.canvas.context.fillRect (hwxy.x, hwxy.y, hwxy.w, hwxy.h);
				}

				o.move = function (x, y)
				{
					o.clear ();
					o.x = x;
					o.y = y;
					o.draw ();
				}

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
					if (game.get.Y (layer[j]) > game.get.Y (layer[j + 1]))
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
			return h >> 0;
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

		inbox: function (A, B)
		{
			let a = game.get.hwxy (A);
			let b = game.get.hwxy (B);
			return ((Math.abs (a.x - b.x + 0.5 * (a.w - b.w)) <= 0.5 * Math.abs (a.w + b.w)) &&
								(Math.abs (a.y - b.y + 0.5 * (a.h - b.h)) <= 0.5 * Math.abs (a.h + b.h)));
		},

		w: function (o)
		{
			let w = (o.w > 1) ? o.w : o.w * game.canvas.width;
				w = (o.wk) ? o.wk * game.get.h (o) : w;
			return w >> 0;
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
		},

		Y: function (o)
		{
			return game.get.y (o) + game.get.h (o);
		}
	},

	object: {},

	run: function ()
	{
		game.canvas.load ();
		game.event.load ();
		game.scene.load ();

		game.draw ();
	},

	scene: { load: function () { game.scene.test (); } },

	tick: 50,

	time: 0
}

window.onload = game.run;

game.scene.test = function ()
{
	game.create.box
	({
		h: 0.5,
		wk: 1,
		x: 0.5, xk: 0.5,
		y: 0.5, yk: 0.5,
		z: 1
	}).load ();

	for (let i = 0; i < 10; i++)
	{
		for (let j = 0; j < 10; j++)
		{
			game.create.box
			({
				color: '#ccc',
				h: 0.1,
				w: 0.1,
				x: i * 0.1,
				y: j * 0.1
			}).load ();
		}
	}
}