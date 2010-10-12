/*
---
description: displays "popup" that can be modal and/or have arrows with easy placement targeting the window or an element

license: MIT-style

authors:
- Truman Leung

requires:
- core/1.3: '*'
- more/1.2.4: Fx.Elements

provides: Ascribe Dialog

version: 0.3

...
*/
var AscDialog = new Class({
	Implements: [Options,Events], 
	options: {
		strs: {
			'close': 'Click to close'
		},
		speed: 500,
		maskOpacity: 0.3,
		maskColor: '#000000',
		z_index:10000,
		isModal: false,
		useArrows: false,
		addCloseBtn: true,
		popOpacity: 1,
		cornerRadius: 10,
		classPrefix: 'Asc',
		place: {
			'ss': { target:'window', io:1, align:'n', offset:0, margin:0 }, // show start
			'se': { trans:'fly', target:'window', io:-1, align:'c', offset:0, margin:0 }, // show end
			'he': { trans:'fly', target:'window', io:1, align:'n', offset:0, margin:0 } // hide end
		},
		posRelative: null,
		onHide: Class.empty,
		onShow: Class.empty,
		onFirstShow: Class.empty,
		transition: Fx.Transitions.Quad.easeInOut
	},
	initialize: function(options){
		this.setOptions(options);
		this.isShowing = false;
		this.shownOnce = false;
		this.mask = false;
		this.pop = false;
		this.event = window.event;

		this.isIE6 = false;
		if (Browser.ie && (Browser.version<=6)) {
			this.isIE6 = true;
		}
//		if (Browser.ie && Browser.Platform.win) {
//			this.options.useArrows = false;
//		}		

		this.fx_dir = 0; // track whether showing/hiding
		this.fx_in_process = false;
		
		window.addEvents({
			'keyup': this.esc.bind(this),
			'resize': function(e){ 
				this.update(e);
				if(this.isShowing){
					this.isShowing = false;
					this.show();
				}
			}.bind(this),
			'scroll': this.update.bind(this)
		});
		this.init();
	},
	init: function(){
		if (this.pop) {
			this.pop.destroy();
		}
		this.add_pop();
		var fxels = [this.pop];

		if (this.options.isModal) {
			this.add_mask();
			fxels[1] = this.mask;
		} else if (this.isIE6) {
			this.options.maskColor = '#FFF';
			this.add_mask();
		}
		this.fx = new Fx.Elements(fxels, {
			wait: false, 
			duration: this.options.speed, 
			transition: this.options.transition,
			onStart: function() {
				this.fx_in_process = true;
			}.bind(this), 
			onComplete: function() {
				switch (this.fx_dir) {
					case 1:
						if (!this.shownOnce) {
							this.shownOnce = true;
							this.fireEvent('firstShow');
						}
						this.isShowing = true;
						if (this.options.isModal) {
							this.pop.fireEvent('focus', '', 200); // to activate pop close by ESC, the ESC keydown for window doesn't work in IE
						}
						this.fireEvent('show');
						break;
					case 0:
						this.isShowing = false;
						this.pop.setStyles({
							'visibility':'hidden',
							'display': 'none'
						});
						if (this.options.isModal) {
							this.mask.setStyle('display', 'none');
						}
						if (!this.options.isModal && this.mask) {
							this.mask.set('opacity',0);
						}
						this.fireEvent('hide');
						break;				
				}
				this.fx_in_process = false;
			}.bind(this)
		});
	},
	add_mask: function(){
		if (!this.mask)	{
			var mask_styles = {
				'position':'absolute',
				'top': 0,
				'left': 0,
				'opacity': 0,
				'z-index': (this.options.z_index - 1),
				'background-color':this.options.maskColor,
				'display': 'none'
			};
			if (this.isIE6){
				// need to use IFRAME for IE in order to cover SELECT elements
				this.mask = new Element('iframe', {
					'class':this.options.classPrefix+'Mask',
					'src':"about:blank",
					'frameborder':0,
					'src':"about:blank",
					styles: mask_styles
				}).inject(document.body);
			} else {
				// make mask a div for other browsers
				this.mask = new Element('div', {
					'class':this.options.classPrefix+'Mask',
					styles: mask_styles
				}).inject(document.body);
			}
		}
	},
	add_pop: function(){

		/*
		<div class="Pop">			
			<TABLE class="grid">
				<TR>
					<TD class="nw"></TD>
					<TD class="north"></TD>
					<TD class="ne"></TD>
				</TR>
				<TR>
					<TD class="sw"></TD>
					<TD class="s"></TD>
					<TD class="se"></TD>
				</TR>
			</TABLE>
		</div>
		*/

		this.pop = new Element('div', {
			'class':this.options.classPrefix+'Pop',
			'styles':{
				'position': 'absolute',
				'visibility': 'hidden',
				'top': -1000,
				'left': 0,
				'z-index': this.options.z_index,
				'display': 'none'
			}
		}).inject(document.body, 'bottom');

		this.pop.addEvent('keydown', function(e){ 
			this.esc(e);
		}.bind(this));

		// add table for pop with border graphics
		this.poptbl = new Element('table',{ 'class':'grid' }).inject(this.pop);
		this.poptbody = new Element('tbody').inject(this.poptbl);

		[['nw', 'north', 'ne'],['sw', 's', 'se']].each(function(tds) {
			this.insertPopTblRow(tds, this.poptbody);
		}.bind(this));

		// assign td class "north" as contents block of pop
		this.popc = this.poptbl.getElement('td[class=north]');

		if (this.options.useArrows)	{
			this.addPopArrows();
		} 
		
		if (this.options.addCloseBtn) {
			this.close = new Element('div',{
				'class':this.options.classPrefix+'Close'
			}).inject(this.pop);
			var close_a = new Element('a', {
				'href':'#',
				'title':this.options.strs.close,
				'events':{
					'click':this.hide.bind(this)
				}
			}).inject(this.close);
			close_a.addEvent('click', function(e){ 
				if(e) e = new Event(e).stop();
				this.hide();
			}.bind(this));	
		}
	},
	cursor_pos: function(e) {
		if (!e) {e = window.event;}
		return {'x':e.page.x, 'y':e.page.y};
		return cursor;	
	},
	insertPopTblRow: function(tds, tbody){
		var tr = new Element('tr').inject(tbody);
		tds.each(function(cls) {
			var td = new Element('td',{ 'class':cls }).inject(tr);
		});
	},
	addPopArrows: function(){
		// insert pop arrows into pop if they don't already exist
		var an = this.pop.getElement('div[class$=p]');
		if (!an) {
			
			this.arrow_sizes = {
				'n':{'h':0,'w':0},
				's':{'h':0,'w':0},
				'e':{'h':0,'w':0},
				'w':{'h':0,'w':0}
			};
			
			var pop_padding = {};

			['n','s','e','w'].each(function(d) {
				var arrw = new Element('div',{ 
					'class':'a'+d+' p', 
					'z-index': (this.options.z_index + 1),
					'styles': { 'visibility':'hidden'} 
				}).inject(this.pop);
				var styles = {};
				
				var h = arrw.getStyle('height');
				if (h) h = h.toInt();
				this.arrow_sizes[d].h = h;
				
				var w = arrw.getStyle('width');
				if (w) w = w.toInt();
				this.arrow_sizes[d].w = w;

				switch (d) {
					case 'n':
						styles.top='auto';
						if (typeOf(h)=='number') {
							styles.bottom = 0;
							pop_padding['padding-top'] = h - 1;
						}
						break;
					case 's':
						if (typeOf(h)=='number') {
							styles.top = 0;
							pop_padding['padding-bottom'] = h - 1;
						}
						break;
					case 'e':
						if (typeOf(w)=='number') {
							styles.left = 0;
							pop_padding['padding-right'] = w - 1;
						}
						break;
					case 'w':
						if (typeOf(w)=='number') {
							styles.right = 0;
							pop_padding['padding-left'] = w - 1;
						}
						break;				
				}
				arrw.setStyles(styles);
			}.bind(this));
			
			// add padding to this.pop so that the arrows can fit within
			this.pop.setStyles(pop_padding);
		}
	},
	show_arrow: function(io, align, tdim) {

		var arrw,p={top:0,left:0},a={},nsew='';

		switch (io) {
			case 1:
				// outer targetting, use the first letter of "align"
				nsew = align.substr(0,1);
				break;
			case -1:	
				// inner targetting			
				switch (align) {
					case 'n':
						nsew = 's';
						break;
					case 'w':
						nsew = 'e';
						break;
					case 'e':
						nsew = 'w';
						break;
					case 's':
						nsew = 'n';
						break;				
				}
				break;
		}
		// get all arrows and hide others but show the one we want
		this.pop.getElements('div[class$=p]').each(function(el) {
			if (el.hasClass('a'+nsew)) {
				el.set('opacity',1);
				el.setStyle('z-index',(this.options.z_index + 1));
				// set the visible arrow to arrw
				arrw = el;
			} else {
				el.set('opacity',0);
			}
		}.bind(this));

		if (arrw) {

			var axy = {
				'x':this.arrow_sizes[nsew].w,
				'y':this.arrow_sizes[nsew].h
			};

			switch (io) {
				case 1:
					// outside 
					switch (align) {
						case 'nw': 
						case 'sw':
							a = {
								'left': this.options.cornerRadius,
								'right': 'auto'
							};
							// move arrow right to account for width of west arrow which is hidden
							a.left += this.arrow_sizes.w.w;

							// the pop is wider than the target element so ignore the this.options.cornerRadius setting move the the arrow a bit to the right
							if (tdim.x < this.popsize.x) {
								if ((tdim.x/2) > (axy.x/2)) {
									a.left = this.arrow_sizes.w.w + ((tdim.x/2) - (axy.x/2));
								} else {
									a.left = this.arrow_sizes.w.w + axy.x/2;
								}
							}
							break;
						case 'n':
						case 's':
							a = {
								'left': this.popsize.x/2 - axy.x/2,
								'right': 'auto'
							};
							break;
						case 'ne':
						case 'se':
							a = {
								'left': 'auto',
								'right': this.options.cornerRadius + axy.x
							};
							// move arrow right to account for width of east arrow which is hidden
							a.right += this.arrow_sizes.e.w;

							// the pop is wider than the target element so ignore the this.options.cornerRadius setting move the the arrow a bit to the left
							if (tdim.x < this.popsize.x) {
								if ((tdim.x/2) > (axy.x/2)) {
									a.right = this.arrow_sizes.e.w + ((tdim.x/2) - (axy.x/2));
								} else {
									a.right = this.arrow_sizes.e.w + axy.x/2;
								}
							}
							break;
						case 'wn':
						case 'en':
							a = {
								'top': this.options.cornerRadius + axy.y,
								'bottom': 'auto'
							};
							// move arrow down to account for height of north arrow which is hidden
							a.top += this.arrow_sizes.n.h;

							// the pop is higher than the target element so move the the arrow a bit down
							if (tdim.y < this.popsize.y) {
								if ((tdim.y/2) > (axy.y/2)) {
									a.top = this.arrow_sizes.n.h + ((tdim.y/2) - (axy.y/2));
								} else {
									a.top = this.arrow_sizes.n.h + axy.y/2;
								}
							}
							break;
						case 'w':
						case 'e':
							a = {
								'top': this.popsize.y/2 - axy.y/2,
								'bottom': 'auto'
							};
							break;
						case 'ws':
						case 'es':
							a = {
								'top': 'auto',
								'bottom': this.options.cornerRadius + axy.y
							};
							// move arrow up to account for height of south arrow which is hidden
							a.bottom += this.arrow_sizes.s.h;
							
							// the pop is higher than the target element so move the the arrow a bit up
							if (tdim.y < this.popsize.y) {
								a.bottom += axy.x/2;
							}
							break;			
					}
					
					switch (align) {
						case 'nw': 
						case 'n':
						case 'ne':
							p.top = -axy.y;
							break;
						case 'wn':
						case 'w':
						case 'ws':
							p.left = -axy.x;
							break;
						case 'en':
						case 'e':
						case 'es':
							p.left = axy.x;
							break;
						case 'sw':
						case 's':
						case 'se':
							p.top = axy.y;
							break;		
					}
					break;
				case -1:
					// inside 
					switch (align) {
						case 'n':
						case 's':
							a = {
								'left': this.popsize.x/2 - axy.x/2,
								'right': 'auto'
							};
							break;
						case 'w':
						case 'e':
							a = {
								'top': this.popsize.y/2 - axy.y/2,
								'bottom': 'auto'
							};
							break;
					}					
					switch (align) {
						case 'n':
							p.top = axy.y;
							break;
						case 'w':
							p.left = axy.x;
							break;
						case 'e':
							p.left = -axy.x;
							break;
						case 's':
							p.top = -axy.y;
							break;				
					}						
					break;
			}

			arrw.setStyles(a);

			return axy;
		}
	},
	set_contents: function(msg, cls, width) {
		this.shownOnce = false;

//		if ((typeOf(cls)=='undefined') || (cls=='')) {
//			cls = 'n';
//		}
		if (this.popc) {
			this.popc.className = 'north ' + cls;
		}
		if (this.popc) {
			this.popc.empty();
			if (cls != '')	{
				var tipnote = new Element('div',{'class':'mi'}).inject(this.popc);

				switch(typeOf(msg)) {
					case 'element':
						var msg_cl = msg.clone(true,true).cloneEvents(msg).inject(tipnote);
						break;
					case 'string':
						tipnote.set('html',msg);
						break;
				}
			} else {
				switch(typeOf(msg)) {
					case 'element':
						var msg_cl = msg.clone(true,true).cloneEvents(msg).inject(this.popc);
						break;
					case 'string':
						this.popc.set('html',msg);
						break;
				}
			}
		}
		if (width) {
			if ((width != 'auto') && (width>0)) {
				width = width.toInt();
			}
			if (width) {
				this.poptbl.setStyle('width',width);
			}
		}

		// determine the width/height of the pop after adding new content to pop

		var was_dn = false;
		if (this.pop.getStyle('display') == 'none') {
			was_dn = true;
			this.pop.setStyle('display', 'block');
			this.pop.setStyle('visibility', 'visible');
		}
		
		// customize the size of the this.pop based on the contents
		var poptblsize = this.poptbl.getSize();
		
		this.pop.setStyle('height', poptblsize.y);
		this.pop.setStyle('width', poptblsize.x);
			
		this.popsize = this.pop.getSize();

		if (width && (this.popsize.x < width)) {
			this.popsize.x = width;
		}
		if (was_dn) {
			this.pop.setStyle('display', 'none');
		}
	},
	esc: function(e){
		if (this.isShowing && (e.key == 'esc'))	{
			this.hide();
		}
	},
	show: function() {
		if(!this.isShowing){

			// set the starting position of the pop
			var start = {
				'visibility':'visible',
				'display': 'block',
				'opacity': 0
			};

			// both fade and fly trans fades in
			var fx = {
				'0': { 
					'opacity': this.options.popOpacity
				}
			};

			var se = this.options.place.se;
			var ss = this.options.place.ss;

			var end_xy = this.coord(se.target, se.io, se.align, se.offset, true);

			if ((se.trans == 'fly')) {

				fx['0'].top = end_xy.top;
				fx['0'].left = end_xy.left;
				fx['0'].margin = se.margin;

				if ((typeOf(ss) == 'object') && (ss.target !=='')) {

					var start_xy = this.coord(ss.target, ss.io, ss.align, ss.offset, false);
					if (start_xy) {
						fx['0'].top = [start_xy.top,end_xy.top];
						fx['0'].left = [start_xy.left,end_xy.left];
					}
				}


			} else {
				// just fade into the end coords
				start.top = end_xy.top;
				start.left = end_xy.left;
			}
			this.pop.setStyles(start);

			// show fx for pop

			if (this.options.isModal) {
				this.add_mask(); // only adds one if it doesn't exist
				this.mask.setStyles({
					'height': window.getScrollHeight(),
					'width': window.getScrollWidth(),
					'display': 'block'
				});
				// fx for mask
				fx['1'] = { 'opacity': this.options.maskOpacity };
			} else {
				if (!this.options.isModal && this.isIE6) {
					this.mask.setStyles({
						'height': this.popsize.y,
						'width': this.popsize.x,
						'display': 'block',
						'visibility':'visible',
						'top': end_xy.top,
						'left':end_xy.left
					});
				}
			}
			this.fx_dir = 1;
			this.fx.start(fx);
		}
	},
	hide: function(e) {
		if(this.pop.getStyle('opacity')>0) {
			this.fx.cancel();
			this.fx_dir = 0;
			// fx for pop
			var fx = {
				'0': { 
					'opacity': 0
				}
			};
			var he = this.options.place.he;

			if (he.trans == 'fly') {

				var se = this.options.place.se;
				var start_xy = this.coord(se.target, se.io, se.align, se.offset, false);

				var end_xy = this.coord(he.target, he.io, he.align, he.offset, false);

				fx['0'].top = [start_xy.top,end_xy.top];
				fx['0'].left = [start_xy.left,end_xy.left];
				fx['0'].margin = he.margin;
			}
			if (this.options.isModal) {
				// fx for mask
				fx['1'] = { 'opacity': 0 };
			}
		
			this.fx.start(fx);
		}
	},
	update: function(e) {
//		if(e) e = new Event(e).stop();
		if (this.isShowing) {
			if (this.options.isModal) {
				// resize the mask to the new size of the window
				var size = window.getSize();
				var scrollSize = window.getScrollSize();
				this.mask.setStyles({
					'height': (size.y > scrollSize.y)?size.y:scrollSize.y,
					'width': size.x
				});
			}
			var se = this.options.place.se;
			if ((se.target == 'window') && (se.io==-1)) {
				// if the pop is inside the window
				this.fx.cancel();

				var coord = this.coord('window', -1, se.align, se.offset, false);

				// move pop to the center of visible screen
				this.fx.start({
					'0': { 
						'top': coord.top,
						'left': coord.left,
						'margin': se.margin
					}
				});
			}
		}
	},
	movePop: function(target, io, align, offset, margin) {
		var coord = this.coord(target, io, align, offset, true);
		if (coord)
		{
			this.pop.setStyles({
				'top': coord.top,
				'left': coord.left,
				'margin': margin
			});
		}
	},
	max: function(obj) {
		var max;
		for (var z in obj){
			if (max) {
				if (obj[z] > obj[max]) {
					max = z;
				}
			} else {
				max = z;
			}
		};
		return max;
	},
	auto_align: function(el, default_align) {

		// auto target best align for display of tip depending on scroll, window size, target size, and pop size
		var win = {'x': window.getWidth(), 'y': window.getHeight()};
		var scroll = {'x': window.getScrollLeft(), 'y': window.getScrollTop()};
		var elpos = el.getPosition();
		var eldim = { 'x':el.offsetWidth, 'y':el.offsetHeight };
		var popdim = { 'x':this.pop.offsetWidth, 'y':this.pop.offsetHeight };
		var align='';

		// determine which side has the most visible space
		// visible space

		var vs = {
			'top': elpos.y - scroll.y,
			'right': (win.x + scroll.x) - (elpos.x + eldim.x),
			'bottom': (win.y + scroll.y) - (elpos.y + eldim.y),
			'left': elpos.x - scroll.x
		};
		var vista = this.max(vs);

		if ((typeof(default_align)!='undefined') && (default_align != 'auto') && (default_align!='')) {
			// if there was a default, check to see if it will work
			align = default_align;
			var nesw = align.substr(0,1);
			switch (nesw) {
				case 'n':
					if (vs.top < this.popsize.y) {
						align='';
					}
					break;
				case 'e':
					if (vs.right < this.popsize.w) {
						align='';
					}
					break;
				case 's':
					if (vs.bottom < this.popsize.y) {
						align='';
					}
					break;
				case 'w':
					if (vs.left < this.popsize.w) {
						align='';
					}
					break;
			
			}
		}
		
		if (align == '') {

			// by determining the side on which the mouse entered, we know that there is space on that side

			if ((vista=='top')||(vista=='bottom')) {
				switch (vista) {
					case 'top':
						align = 'n';
						break;
					case 'bottom':
						align = 's';
						break;
				}
				if ((vs.right < 0) && (vs.left < 0)) {
					// both sides are covered
					if (vs.right > vs.left)	{
						// right side covered less
						align += 'e';
//						op.se.margin = '0 ' + (-vs.right + op.se.offset) + 'px 0 0';
					} else {
						// left side covered less
						align += 'w';
//						op.se.margin = '0 0 0 ' + (-vs.left + op.se.offset) + 'px';
					}
				} else if (vs.right < 0) {
					// right side is covered, but not left
					align += 'w';
				} else if (vs.left < 0) {
					// left side is covered, but not right
					align += 'e';
				}
			} else {
				switch (vista) {
					case 'right':
						align = 'e';
						break;
					case 'left':
						align = 'w';
						break;
				}
				if ((vs.top < 0) && (vs.bottom < 0)) {
					// both top & bottom are covered
					if (vs.top > vs.bottom)	{
						// top side covered less
						align += 'n';
//						op.se.margin = (-vs.right + op.se.offset) + 'px 0 0 0';
					} else {
						// bottom side covered less
						align += 's';
//						op.se.margin = '0 0 ' + (-vs.left + op.se.offset) + 'px 0';
					}
				} else if (vs.top < 0) {
					// top side is covered, but not bottom
					align += 's';
				} else if (vs.bottom < 0) {
					// bottom side is covered, but not top
					align += 'n';
				}
			}
		}
		return align;
	},
	coord: function(target, io, align, offset, arr_mode) {
		var top=0,left=0,tdim=0;
		
		this.fireEvent('beforeCoord');
		
		if (target == 'window') {
			top = window.getScrollTop();
			left = window.getScrollLeft();
			tdim = { 'x':window.getWidth(), 'y':window.getHeight() };
		} else {
			if (typeOf(target)=='string') {
				var t = $(target);
			} else {
				var t = target;
			}
			if (t) {
				// figure out if the element is in the same window as the dialog
				var tpos = t.getPosition();
				if (!tpos && (t.getStyle('display')=='inline')) {
					var tpos = this.cursor_pos(this.event);
					top = tpos.y;
					left = tpos.x;
					tdim = { 'x':1, 'y':1 };
				} else {
					var tpos = t.getPosition();
					if (tpos) {
						top = tpos.y;
						left = tpos.x;
						tdim = { 'x':t.offsetWidth, 'y':t.offsetHeight };
					}
				}
				if (align == null) {
					align = this.auto_align(t,'auto');
				}
			}
		}
		if (tdim) {

			if ((arr_mode===true) && this.options.useArrows) {
				var axy = this.show_arrow(io, align, tdim);
			}

			var nesw = align.substr(0,1);
			switch (io) {
				case 1:
					// outside 
					switch (nesw) {
						case 'n':
							top -= (this.popsize.y + offset);
							break;
						case 'e':
							left += (tdim.x + offset);
							break;
						case 's':
							top += (tdim.y + offset);
							break;
						case 'w':
							left -= (this.popsize.x + offset);
							break;					
					}

					// move pop if the size of pop is bigger than the target
					switch (align) {
						case 'nw':
						case 'sw':
							if ((tdim.x < this.popsize.x) && axy) {
								left -= axy.x/2;
							}
							break;
						case 'ne':
						case 'se':
							if ((tdim.x < this.popsize.x) && axy) {
								left += axy.x/2;
							}
							break;
						case 'en':
						case 'wn':
							if ((tdim.y < this.popsize.y) && axy) {
								top -= axy.y/2;
							}
							break;
						case 'es':
						case 'ws':
							if ((tdim.y < this.popsize.y) && axy) {
								top += axy.y/2;
							}
							break;
					}

					switch (align) {
						case 'n': // above target, centered
							left += (tdim.x/2 - this.popsize.x/2);
							break;
						case 'ne': // above target, right aligned
							left += (tdim.x - this.popsize.x);
							break;
						case 'w': // left of target, middle aligned
							top += (tdim.y/2 - this.popsize.y/2);
							break;
						case 'ws': // left of target, bottom aligned
							top += (tdim.y - this.popsize.y);
							break;
						case 'e': // right of target, middle aligned
							top += (tdim.y/2 - this.popsize.y/2);
							break;
						case 'es': // right of target, bottom aligned
							top += (tdim.y - this.popsize.y);
							break;
						case 's': // below target, middle aligned
							left += (tdim.x/2 - this.popsize.x/2);
							break;				
						case 'se': // below target, right aligned
							left += (tdim.x - this.popsize.x);
							break;				
					}
					break;
				case -1:
					// inside 
					switch (nesw) {
						case 'n':
							top += offset;
							break;
						case 's':
							top += (tdim.y - this.popsize.y - offset);
							break;
					}
					switch (align) {
						case 'nw':
							left += offset;
							break;
						case 'n':
							left += (tdim.x/2 - this.popsize.x/2);
							break;
						case 'ne':
							left += (tdim.x - this.popsize.x - offset);
							break;
						case 'w':
							top += (tdim.y/2 - this.popsize.y/2);
							left += offset;
							break;
						case 'c':
							top += (tdim.y/2 - this.popsize.y/2);
							left += (tdim.x/2 - this.popsize.x/2);
							break;
						case 'e':
							top += (tdim.y/2 - this.popsize.y/2);
							left += (tdim.x - this.popsize.x - offset);
							break;
						case 'sw':
							left += offset;
							break;				
						case 's':
							left += (tdim.x/2 - this.popsize.x/2);
							break;				
						case 'se':
							left += (tdim.x - this.popsize.x - offset);
							break;				
					}
					break;

			}

			if (this.posRelative) {
				top += this.posRelative.y;
				left += this.posRelative.x;
			}
			return { 'top': top, 'left': left };
		}
		return false
	},
	destroy: function() {
		if (this.mask) {
			this.mask.remove();
		}
		this.pop.remove();
	}

});
var AscModal = new Class({
	Implements: [Options,Events], 
    Extends: AscDialog,
 	options: {
		isModal: true,
		addCloseBtn: true,
		popOpacity: 1,
		classPrefix: 'Modal',
		place: {
			'ss': { target:'window', io:1, align:'n'}, // show start
			'se': { trans:'fly', target:'window', io:-1, align:'c'}, // show end
			'he': { trans:'fly', target:'window', io:1, align:'n'} // hide end
		}
	},
	initialize: function(msg, cls, options){
		this.setOptions(options);
        this.parent(options); 
		this.set_contents(msg, cls);
    }
});
var AscTip = new Class({
	Implements: [Options,Events], 
    Extends: AscDialog,
 	options: {
		addCloseBtn: false,
		speed: 200,
		useArrows: true,
		popOpacity: 1,
		actionDelay: 50,
		showDelay: 0,
		hideDelay: 0,
		default_align:'auto',
		classPrefix: 'Asc',
		place: {
			'ss': { 'io':1, offset:16 }, // show start
			'se': { 'io':1, offset:6 }, // show end
			'he': { trans:'fade' } // hide end
		}
	},
	initialize: function(el, msg, cls, options, width){
        this.parent(options);
		this.current_el;
		this.mousein = false;

		if (typeOf(el)=='element') {
			this.enable_tip(el, msg, cls, width);
		} 
    },
	enable_tip: function(el, msg, cls, width, align) {
		if (el) {
			el.addEvents({
				'mouseenter': function(e) {
					this.event = e;
					this.current_el = el;
					this.mousein = true;
					clearTimeout(this.timer);
					this.timer = this.do_show.delay(this.options.showDelay, this, [el, msg, cls, width, align]);

				}.bind(this),	 
				'mouseleave': function(e) {
					this.mousein = false;
					clearTimeout(this.timer);
					if (this.current_el == el) {
						this.current_el = '';
					}
					if (this.fx_in_process && (this.fx_dir == 1)) {
						this.isShowing = true;
						this.hide();
					} else {						
						this.timer = this.hide.delay(this.options.hideDelay, this);
					}
				}.bind(this),	 
				'outerClick': function() {
					this.mousein = false;
					this.hide();
				}.bind(this)
			});
		}
		return false;
	},
	do_show: function(el, msg, cls, width, align) {
		if (this.mousein && (this.current_el == el)) {

			this.set_contents(msg, cls, width);

			if (align==null) {
				align = this.options.default_align;
			}

			var settings = {
				'target':el,
				'align':this.auto_align(el, align)
			};

			if (this.options.place.se.trans=='fly')	{
				Object.append(this.options.place.ss, settings);
				this.options.place.ss.offset = 25;
			}
			if (this.isShowing || this.fx_in_process) {
				if (this.fx_in_process) {
					this.fx.cancel();
				}
				this.options.place.ss.target = '';
			}
			this.isShowing = false;
			Object.append(this.options.place.se, settings);
			Object.append(this.options.place.he, settings);

			this.show();
		}
	}
});
var AscTips = new Class({
	Implements: [Options,Events], 
    Extends: AscTip,
 	initialize: function(els, options){
        this.parent('', '', '', options);
		if (typeOf(els)=='array') {
			var i, ct=els.length,t;
			els.each(function(param,i) {
				if (param.id != null) {
					var el =  $(param.id);
					if (el != null) {
						var this_align = this.options.default_align;
						if ((param.align != null) && (param.align != '')) {
							this_align = param.align;
						}
						this.enable_tip(el, param.msg, param.cls, param.width, this_align);
					}
				}
			}.bind(this));
		}
    }
});

var AscModalAlertConfirm = new Class({
    Extends: AscModal,
	Implements: [Options,Events], 
	options: {
		strs: {
			'ok': 'OK',
			'or': 'or',
			'cancel': 'cancel',
			'on_start_hdr': '',
			'on_start_msg': ''
		},
		addCloseBtn: false, 
		speed: 300,
		place: {
			'ss': { target:'window', io:1, align:'n', offset:0, margin:0 }, // show start
			'se': { trans:'fly', target:'window', io:-1, align:'n', offset:70, margin:0 }, // show end
			'he': { trans:'fade', target:'window', io:1, align:'n', offset:0, margin:0 } // hide end
		},
		osme: false,
		os_show_fn: function(){},
		os_hide_fn: function(){},
		os_modal_cls: 'i'
	},
	initialize: function(options){
		this.setOptions(options);
        this.parent(options); 

		if (this.options.strs.on_start_msg != '') {
			this.show_alert(this.options.strs.on_start_hdr, this.options.strs.on_start_msg, this.options.osme, this.options.os_show_fn, this.options.os_hide_fn, this.options.os_modal_cls);
		}
		
	},
	save_cancel_tbl: function(extra_td, save_str, save_cls){
		if (!typeOf(save_str) || (save_str=='')) { save_str = this.options.strs.save; }
		if (!typeOf(save_cls) || (save_cls=='')) { save_cls = 'i16 save16'; }
		var tbl = new Element('table', {'class':'btn-tbl'});
		var tbody = new Element('tbody').inject(tbl);
		var tr = new Element('tr').inject(tbody);
		var td2 = new Element('td', {'class':'save-btn-td'} ).inject(tr);
		var ok = this.gen_btn('form confirm_btn', save_str, '', '#', save_cls).inject(td2);
		var td3 = new Element('td', {'class':'or'} ).set('html',this.options.strs.or).inject(tr);
		var td4 = new Element('td', {'class':'cancel'} ).inject(tr);
		if (typeOf(extra_td)=='element') extra_td.inject(tr);
		var cancel_a = new Element('a', {'href':'#', 'class': 'cancel'}).set('html',this.options.strs.cancel).inject(td4);
		return tbl;
	},
	gen_btn: function(btn_class, str,id, href, div_cls){
		if (!href) {
			href = '#';
		}
		var obj = { 'class':btn_class, 'href':href };
		if (typeOf(id)=='string') {
			obj.id = id;
		}
		var anchor = new Element('a', obj);
		var s1 = new Element('span').inject(anchor);
		var s2 = new Element('span').inject(s1);
		var s3 = new Element('span').inject(s2);
		var d4 = new Element('div', {'html':str}).inject(s3);
		if (div_cls) {
			d4.addClass(div_cls);
		}
		return anchor;
	},
	modal_contents: function(msg_cls, hdr, msg){
		var c = new Element('div',{'class':'eregmodal'});
		if (hdr) {
			var h2 = new Element('h2',{'html': hdr}).inject(c);
		}
		var p = new Element('p',{'class': msg_cls + ' med'}).inject(c);
		switch(typeOf(msg)) {
			case 'element':
				p.adopt(msg);
				break;
			case 'string':
				p.set('html', msg);
				break;
		}
		return c;
	},
	on_show_confirm: function(confirm_fn){
		var confirm_btn = this.pop.getElement('a[class*=confirm_btn]');
		if (confirm_btn) {
			confirm_btn.addEvent('click', function(e) {
				e = new Event(e).stop();
				if (confirm_fn!=null) confirm_fn.attempt('',this);
			}.bind(this));
		}

		var cancel_btn = this.pop.getElement('a[class=cancel]');
		if (cancel_btn) {
			cancel_btn.addEvent('click', function(e) {
				e = new Event(e).stop();
				this.hide();
			}.bind(this));
		}
	},
	show_confirm: function(modal_cls, msg_cls, hdr, msg, confirm_btn_str, confirm_btn_cls, confirm_fn){
		var c = this.modal_contents(msg_cls, hdr, msg);
		this.save_cancel_tbl('', confirm_btn_str, confirm_btn_cls).inject(c);		
		
		this.set_contents(c, modal_cls, 370);

		this.removeEvent('show', this.on_show_confirm);
		this.addEvent('show', this.on_show_confirm.bind(this, confirm_fn));
		this.show();		
	},
	show_alert: function(hdr, msg, err, show_fn, hide_fn, modal_cls, modal_width){
		if (modal_cls==null) modal_cls = 'ok';
		if (modal_width==null) modal_width = 370;
		var msg_cls = 'msg_pass';
		if (err) {
			modal_cls = 'f';
			msg_cls = 'msg_fail';
		}
		var c = this.modal_contents(msg_cls, hdr, msg);
		var ok = this.gen_btn('form', this.options.strs.ok, 'ok_btn').inject(c);
		this.set_contents(c, modal_cls, modal_width);

		$('ok_btn').addEvent('click', function(e) {
			e = new Event(e).stop();
			this.hide();
		}.bind(this));
		
		if (show_fn!=null) {
			this.removeEvent('show', show_fn);
			this.addEvent('show', show_fn);
		}
		if (hide_fn!=null) {
			this.removeEvent('hide', hide_fn);
			this.addEvent('hide', hide_fn);
		}
		this.show();
	}
});