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
		a: function (_)
		{
			let o = game.create.sprite (_);
				o.delay = _.delay || game.tick;
				o.frame = _.frame || [ o.i ];
				o.step = _.step || 0;
				o.time = game.time;

				o.next = function ()
				{
					if (game.time - o.time >= o.delay)
					{
						o.time = game.time;
						o.step++;
						o.step = (o.step + 1 > o.frame.length) ? 0 : o.step;
						o.i = o.frame[o.step];
						o.redraw ();
					}
				}

				o.tick = function ()
				{
					o.next ();
				}

			return o;
		},

		box: function (_)
		{
			let o = game.create.object (_);
				o.color = _.color || '#000';
				o.z = _.z || 0;

				o.clear = function ()
				{
					for (let id in game.object)
					{
						if (o.id != id)
						{
							let object = game.object[id];
							if (game.get.inring (o, object))
							{
								if (o.z > object.z)
								{
									back = true;
									object.draw ();
									o.zup (object);
								}
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
					o.zen (o);
				}

				o.redraw = function ()
				{
					o.draw ();
					o.zen (o);
				}

				o.zen = function (O)
				{
					for (let id in game.object)
					{
						if (O.id != id)
						{
							let object = game.object[id];
							if (game.get.inbox (O, object))
							{
								if ((O.z < object.z) || ((game.get.Y (O) < game.get.Y (object) && O.z == object.z)))
								{
									object.draw ();
									O.zen (object);
								}
							}
						}
					}
				}

				o.zup = function (O)
				{
					for (let id in game.object)
					{
						if (O.id != id)
						{
							let object = game.object[id];
							if (!object.moved)
							{
								if (game.get.inbox (O, object))
								{
									if (O.z < object.z)
									{
										object.draw ();
										O.zen (object);
									}
								}
							}
						}
					}
				}

			return o;
		},

		button: function (_)
		{
			let o = game.create.sprite (_);
				o.a = _.a || function () {};
				o.ia = _.ia || _.i;
				o.iin = _.iin || _.i;
				o.iout = _.iout || _.i;
				o.in = _.in || function () {};
				o.mousein = false;
				o.out = _.out || function () {};

				o.active = function (e)
				{
					if (!o.mousein)
					{
						if (game.get.pinbox ({ x: e.x, y: e.y },  o))
						{
							o.mousein = true;
							o.i = o.iin;
							o.redraw ();
							window.document.body.style.cursor = 'pointer';
							o.in ();
						}
					} else {
						if (!game.get.pinbox ({ x: e.x, y: e.y },  o))
						{
							o.mousein = false;
							o.i = o.iout;
							o.redraw ();
							window.document.body.style.cursor = 'default';
							o.out ();
						}
					}
				}

				o.mousedown = function (e)
				{
					if (game.get.pinbox ({ x: e.x, y: e.y },  o))
					{
						o.i = o.ia;
						o.draw ();
						o.zen (o);
						o.a ();
					}
				}

				o.mouseup = function (e)
				{
					o.mousein = false;
					o.active (e);
				}

				o.mousemove = function (e)
				{
					o.active (e);
				}

			return o;
		},

		element: function (_)
		{
			let o = game.create.button (_);
				o.name = _.name || 'Element';
				o.number = _.number || 0;
				o.shortname = _.shortname || 'El';
				o.type = _.type || 'metal';

				o.draw = function ()
				{
					game.canvas.context.fillText = (o.shortname, o.x, o.y);
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
		},

		sprite: function (_)
		{
			let o = game.create.box (_);
				o.i = _.i;

				o.draw = function ()
				{
					let hwxy = game.get.hwxy (o);
					game.canvas.context.imageSmoothingEnabled = false;
					game.canvas.context.drawImage (o.i, hwxy.x, hwxy.y, hwxy.w, hwxy.h);
				}

			return o;
		},

		unit: function (_)
		{
			let o = game.create.sprite (_);
				o.hp = _.hp || 1;
				o.i = _.i;
				o.manage = _.manage || '';
				o.speed = _.speed || 5;
				o.time = { walk: 0 };
				o.vx = _.vx || o.x;
				o.vy = _.vy || o.y;

				o.mousedown = function (e)
				{
					o.walkto (e)
				}

				o.tick = function ()
				{
					o.walk ();
				}

				o.walk = function ()
				{
					if (o.vr > o.speed)
					{
						let dot = game.get.rab (o.x * game.canvas.width, o.y * game.canvas.height, o.vx * game.canvas.width, o.vy * game.canvas.height, o.speed);
						o.x = dot.x / game.canvas.width;
						o.y = dot.y / game.canvas.height;
						o.move (o.x, o.y);
						o.vr = game.get.ab (o.x * game.canvas.width, o.y * game.canvas.height, o.vx * game.canvas.width, o.vy * game.canvas.height);
					}
				}

				o.walkto = function (e)
				{
					if (o.manage == 'mouse')
					{
						o.vx = e.x / game.canvas.width;
						o.vy = e.y / game.canvas.height;
						o.vr = game.get.ab (o.x * game.canvas.width, o.y * game.canvas.height, o.vx * game.canvas.width, o.vy * game.canvas.height);
					}
				}

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

				if (!swaped) { break; }
			}

			for (let z in layer)
			{
				let o = layer[z];
				o.draw ();
			}
		}
	},

	event:
	{
		load: function ()
		{
			window.onmousedown = game.event.update;
			window.onmousemove = game.event.update;
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
		ab: function (x0, y0, x1, y1)
		{
			return Math.sqrt (Math.pow (x0 - x1, 2) + Math.pow (y0 - y1, 2));
		},

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

		set i (list)
		{
			for (let name of list)
			{
				let image = new Image ();
					image.src = 'data/' + name + '.png';
				game.i[name] = image;
			}
		},

		inbox: function (A, B)
		{
			let a = game.get.hwxy (A);
			let b = game.get.hwxy (B);
			return ((Math.abs (a.x - b.x + 0.5 * (a.w - b.w)) <= 0.5 * Math.abs (a.w + b.w)) &&
								(Math.abs (a.y - b.y + 0.5 * (a.h - b.h)) <= 0.5 * Math.abs (a.h + b.h)));
		},

		inring: function (A, B)
		{
			let a = game.get.hwxy (A);
			let b = game.get.hwxy (B);
			let r = Math.sqrt (Math.pow (a.x - b.x, 2) + Math.pow (a.y - b.y, 2));
			let R = (a.h + a.w) / 1.5;
			return (r < R);
		},

		pinbox: function (A, B)
		{
			let x = game.get.x (A);
			let y = game.get.y (A);
			let b = game.get.hwxy (B);
			return ((x >= b.x) && (x <= b.x + b.w) && (y >= b.y) && (y <= b.y + b.h));
		},

		r: function (a, b, c)
		{
			let r = Math.random ();

			if (b)
			{
				r = Math.random () * (b - a) + a;
			}

			if (c)
			{
				r = Math.floor (Math.random () * (b - a + 1)) + a;
			}

			if (Array.isArray (a))
			{
				let i = Math.floor (Math.random () * (a.length));
				r = a[i];
			}

			return r;
		},

		rab: function (x0, y0, x1, y1, r0)
		{
			let r = game.get.ab (x0, y0, x1, y1);
			let r1 = r - r0;
			let k = r0 / r1;
			let x = (x0 + k * x1) / (1 + k);
			let y = (y0 + k * y1) / (1 + k);
			return { x: x, y: y };
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

		X: function (o)
		{
			return game.get.x (o) + game.get.w (o);
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

	i: {},

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

	time: 0,

	wipe: function ()
	{
		game.object = {};
		game.canvas.clear ();
		window.document.body.style.cursor = 'default';
	}
}

game.get.i = [ 'body', 'grass', 'grass2', 'head', 'head2', 'head3', 'play', 'setred', 'start', 'start2', 'stone' ];

window.onload = game.run;

game.scene.start = function ()
{
	game.wipe ();

	game.create.sprite
	({
		h: 0.075,
		i: game.i.setred,
		wk: 1,
		x: 0.5, xk: -0.15,
		y: 0.41, yk: 0.5,
		z: 1
	}).load ();

	game.create.button
	({
		a: function ()
		{
			game.scene.test ();
		},
		h: 0.1,
		ia: game.i.head3,
		i: game.i.head,
		iin: game.i.head2,
		wk: 1,
		x: 0.3,
		y: 0.3,
		z: 1
	}).load ();

	game.create.button
	({
		a: function ()
		{
			game.scene.test ();
		},
		h: 0.1,
		ia: game.i.play,
		i: game.i.play,
		iin: game.i.play,
		wk: 3.75,
		x: 0.5,
		xk: 0.5,
		y: 0.5,
		yk: 0.5,
		z: 1
	}).load ();

	game.draw ();
}

game.scene.test = function ()
{
	game.wipe ();

	game.create.box
	({
		h: 0.1,
		movable: true,
		wk: 1,
		x: 0.55, xk: 0.5,
		y: 0.5, yk: 0.5,
		z: 1
	}).load ();

	game.create.box
	({
		color: '#f00',
		h: 0.15,
		wk: 1,
		x: 0.6, xk: 0.5,
		y: 0.6, yk: 0.5,
		z: 1
	}).load ();

	game.create.box
	({
		color: '#f0f',
		h: 0.15,
		wk: 1,
		x: 0.62, xk: 0.5,
		y: 0.64, yk: 0.5,
		z: 1
	}).load ();

	game.create.box
	({
		color: '#0ff',
		h: 0.15,
		wk: 1,
		x: 0.64, xk: 0.5,
		y: 0.66, yk: 0.5,
		z: 1
	}).load ();

	game.create.box
	({
		color: '#ff0',
		h: 0.15,
		wk: 1,
		x: 0.66, xk: 0.5,
		y: 0.68, yk: 0.5,
		z: 1
	}).load ();

	for (let i = 0; i < 10; i++)
	{
		for (let j = 0; j < 10; j++)
		{
			game.create.sprite
			({
				h: 50,
				i: game.get.r ([game.i.grass, game.i.grass2, game.i.stone]),
				w: 50,
				x: 400 + j * 50,
				y: 100 + i * 50
			}).load ();
		}
	}

	game.create.unit
	({
		h: 0.1,
		i: game.i.head,
		manage: 'mouse',
		speed: 5,
		wk: 1,
		x: 0.3,
		xk: 0.5,
		y: 0.5,
		yk: 1,
		z: 1
	}).load ();

	game.create.button
	({
		a: function ()
		{
			game.scene.start ();
		},
		h: 0.1,
		ia: game.i.head3,
		i: game.i.head,
		iin: game.i.head2,
		wk: 1,
		x: 0.5,
		y: 0.5,
		z: 1
	}).load ();

	game.create.a
	({
		delay: 200,
		frame: [game.i.head, game.i.head2, game.i.head3],
		h: 0.1,
		i: game.i.head,
		wk: 1,
		x: 0.58,
		xk: 0.5,
		y: 0.7,
		yk: 1,
		z: 1
	}).load ();

	game.draw ();
}
