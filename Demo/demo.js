window.addEvent('domready', function() {

	// using the AscModal class

	var modal = new AscModal('This is a Modal Dialog. Pressing <B>ESC</B> on your keyboard will dismiss this dialog by issuing the hide command. You can also click on the close graphic in the corner.', 'i');
	$('test_modal').addEvent('click', function(e) { 
		if(e) e = new Event(e).stop();
		modal.show();
	});
	
	// using the AscTipModal class
	
	var modalac = new AscModalAlertConfirm({
		'strs': { 
			'ok': 'Okay',
			'on_start_hdr': 'Welcome to the demo',
			'on_start_msg': 'Thanks for checking out this Ascribe Dialog Mootools class!'
		}
	});	
	$('test_modal_alert').addEvent('click', function(e) { 
		e.preventDefault();
		modalac.show_alert('Alert dialog', "Put 1 or true in the second argument for the show_modal function in the AscModalAlertConfirm class to make the text show red and to use the important alert icon. The string for the OK button can be set in class options.", true);
	});
	$('test_modal_confirm').addEvent('click', function(e) { 
		e.preventDefault();
		modalac.show_confirm('i', 'nopad', 'Confirm dialog', "Do you think this is a useful class?", "Yes, I agree", 'i16 ok16', function(e) { 
			modalac.show_alert('', "Thanks! I hope it is helpful to you.", false, null, null, 'ok');
		});
	});
	
	// simple tooltips
	
	var tooltip1 = new AscTip($('tip_example'), 'Tooltip text: Arrows are automatically added to the tooltip depending which side of the element has more visible space.', 'n', {classPrefix: 'Asc'});

	var flytooltip = new AscTip($('flytt'), 'Fly in animation', 'n', {
		classPrefix: 'Asc',
		default_align: 'nw',
		place: {
			'he': { trans:'fade' } // hide end
		}
	});
	var fadetooltip = new AscTip($('fadett'), 'Fade in animation', 'n', {
		classPrefix: 'Asc',
		default_align: 'sw',
		place: {
			'ss': { target:''},
			'se': { trans:'fade' },
			'he': { trans:'fade' }
		}
	});

	// multiple tooltips

	var asc_tip_array = [
		{ id:"tt1",msg:"Tooltip message" },
		{ id:"tt2",msg:"Tooltip message can have <b>bold</b>"},
		{ id:"tt3",msg:"These tips are targeted by element ID"},
		{ id:"tt4",msg:"Tooltip message"},
		{ id:"tt5",msg:"Tooltip message"},
		{ id:"tt6",msg:"Tooltip message"},
		{ id:"tt7",msg:"Tooltip message"},
		{ id:"tt8",msg:"Tooltip message"},
		{ id:"tt9",msg:"Tooltip message"},
		{ id:"tt10",msg:"Tooltip message"},
		{ id:"tt11",msg:"Tooltip message"},
		{ id:"tt12",msg:"This is the last 12th box"}
	]; 
	
	var asc_tooltips = new AscTips(asc_tip_array, {'default_align':'nw'}); 




	var popup = new AscDialog({
		isModal: false,
		useArrows: true,
		addCloseBtn: false,
		popOpacity: .9,
		classPrefix: 'Asc',
		place: {
			'ss': { target:'smplbox', io:1, align:'wn', offset:0, margin: -25 }, // show start
			'se': { trans:'fly', target:'smplbox', io:1, align:'wn', offset: 8, margin:0 }, // show end
			'he': { trans:'fly', target:'smplbox', io:1, align:'wn', offset: 0, margin:-25 } // hide end
		}			
	});
	popup.set_contents('simple popup simple popup simple popup simple popup simple popup simple popup ', 'n');

	$('show_popup').addEvent('click', function(e) { 
		if(e) e = new Event(e).stop();			
		popup.show();
	});			
	$('hide_popup').addEvent('click', function(e) { 
		if(e) e = new Event(e).stop();			
		popup.hide();
	});

	var reset_pop = function() {
		popup.isShowing = false;
		popup.set_contents('simple popup simple popup simple popup simple popup simple popup simple popup ', 'n');
		popup.show();
	}


	$('pop_ss_active').addEvent('change', function(e){ 
		var val = this.get('value').toInt();
		switch (val) {
			case 0:
				$('pop_ss_target').disabled = true;
				$('pop_ss_io').disabled = true;
				$('pop_ss_align_inside').disabled = true;
				$('pop_ss_align_outside').disabled = true;
				popup.options.place.ss.target = '';
				break;
			case 1:
				$('pop_ss_target').disabled = false;
				$('pop_ss_io').disabled = false;
				$('pop_ss_align_inside').disabled = false;
				$('pop_ss_align_outside').disabled = false;
				popup.options.place.ss = {
					target:$('pop_ss_target').get('value'), 
					io:$('pop_ss_io').value.toInt(), 
					align:'n', 
					offset:0
				};
				if (popup.options.place.ss.io) {
					popup.options.place.ss.align = $('pop_ss_align_outside').get('value');
				} else {
					popup.options.place.ss.align = $('pop_ss_align_inside').get('value');
				}
				break;			
		}
		reset_pop();
	});			

	$('pop_show_trans').addEvent('change', function(e){ 
		var val = this.get('value')
		switch (val) {
			case 'fly':
				$('pop_ss_target').disabled = false;
				$('pop_ss_io').disabled = false;
				$('pop_ss_align_inside').disabled = false;
				$('pop_ss_align_outside').disabled = false;
				break;
			case 'fade':
				$('pop_ss_target').disabled = true;
				$('pop_ss_io').disabled = true;
				$('pop_ss_align_inside').disabled = true;
				$('pop_ss_align_outside').disabled = true;
				break;			
		}
		popup.options.place.se.trans = val;
		reset_pop();
	});			
	$('pop_hide_trans').addEvent('change', function(e){ 
		var val = this.get('value')
		switch (val) {
			case 'fly':
				$('pop_he_target').disabled = false;
				$('pop_he_io').disabled = false;
				$('pop_he_align_inside').disabled = false;
				$('pop_he_align_outside').disabled = false;
				break;
			case 'fade':
				$('pop_he_target').disabled = true;
				$('pop_he_io').disabled = true;
				$('pop_he_align_inside').disabled = true;
				$('pop_he_align_outside').disabled = true;
				break;			
		}
		popup.options.place.he.trans = val;
		reset_pop();
	});

	$('pop_ss_target').addEvent('change', function(e){ 
		popup.options.place.ss.target = this.get('value');
		reset_pop();
	});
	$('pop_se_target').addEvent('change', function(e){ 
		popup.options.place.se.target = this.get('value');
		reset_pop();
	});
	$('pop_he_target').addEvent('change', function(e){ 
		popup.options.place.he.target = this.get('value');
		reset_pop();
	});

	$('pop_ss_io').addEvent('change', function(e){ 
		var val = this.value.toInt();
		switch (val) {
			case -1:
				$('pop_ss_align_inside').setStyle('display','');
				$('pop_ss_align_outside').setStyle('display','none');
				break;
			case 1:
				$('pop_ss_align_inside').setStyle('display','none');
				$('pop_ss_align_outside').setStyle('display','');
				break;			
		}
		popup.options.place.ss.io = val;
		reset_pop();
	});
	$('pop_he_io').addEvent('change', function(e){ 
		var val = this.value.toInt();
		switch (val) {
			case -1:
				$('pop_he_align_inside').setStyle('display','');
				$('pop_he_align_outside').setStyle('display','none');
				break;
			case 1:
				$('pop_he_align_inside').setStyle('display','none');
				$('pop_he_align_outside').setStyle('display','');
				break;			
		}
		popup.options.place.he.io = val;
		reset_pop();
	});
	$('pop_se_io').addEvent('change', function(e){ 
		var val = this.value.toInt();
		switch (val) {
			case -1:
				$('pop_se_align_inside').setStyle('display','');
				$('pop_se_align_outside').setStyle('display','none');
				break;
			case 1:
				$('pop_se_align_inside').setStyle('display','none');
				$('pop_se_align_outside').setStyle('display','');
				break;			
		}
		popup.options.place.se.io = val;
		reset_pop();
	});			

	$('pop_ss_align_inside').addEvent('change', function(e){ 
		popup.options.place.ss.align = this.get('value');
		reset_pop();
	});
	$('pop_ss_align_outside').addEvent('change', function(e){ 
		popup.options.place.ss.align = this.get('value');
		reset_pop();
	});
	$('pop_se_align_inside').addEvent('change', function(e){ 
		popup.options.place.se.align = this.get('value');
		reset_pop();
	});
	$('pop_se_align_outside').addEvent('change', function(e){ 
		popup.options.place.se.align = this.get('value');
		reset_pop();
	});

	$('useArrows').addEvent('click', function(e){ 
		popup.options.useArrows = this.checked;
		if (this.checked) {
			popup.init();
		}
		reset_pop();
	});
	$('isModal').addEvent('click', function(e){ 
		popup.options.isModal = this.checked;
		if (this.checked) {
			popup.init();
		}
		reset_pop();
	});


	var showhide_pop = function() {
	
		if (popup!=null) {
			if (popup.fx!=null) {
				popup.fx.cancel();
			}
			popup.pop.setStyles({
				'visibility':'visible',
				'display': 'block',
				'opacity': 1
			});
			popup.isShowing = true;
			popup.hide();
		}
	}

	$('pop_he_align_inside').addEvent('change', function(e){ 
		popup.options.place.he.align = this.get('value');
		showhide_pop();
	});
	$('pop_he_align_outside').addEvent('change', function(e){ 
		popup.options.place.he.align = this.get('value');
		showhide_pop();
	});

	var container = $('container');

	var move_pop = function() {
		if (popup.isShowing)
		{
			popup.movePop(popup.options.place.se.target, popup.options.place.se.io, popup.options.place.se.align, popup.options.place.se.offset, popup.options.place.se.margin);
		}
	}


	container.getElements('input[class=offsetmargin]').each(function(ipt){
		var id_pieces = ipt.id.split('_');
		var om = id_pieces[1];
		ipt.addEvents({
			'keyup': function(e) {
				e = new Event(e).stop();
				switch (id_pieces[0]) {
					case 'ss':
						popup.options.place.ss[om] = ipt.value;
						break;
					case 'se':
						popup.options.place.se[om] = ipt.value;
						break;
					case 'he':
						popup.options.place.he[om] = ipt.value;
						break;					
				}
				move_pop();
			}
		});
	});

});