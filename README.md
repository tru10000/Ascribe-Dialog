Ascribe Dialog
===========

This set of classes allows you to add in-browser popups, tooltips or dialogs (modal or non-modal) that can be animated to either fly or fade in. Tooltips can be targeted to point with an arrow to specific elements. 

How to use
----------

The following examples shows you how to create dialogs and tooltips. 

Simple modal dialog targetted to the center of the user's screen.

	var modal = new AscModal('Enter a message for the modal here', 'i');
	modal.show();

The second argument is for a css class which you wish to assign to the modal dialog. The class comes with five modal css classes uses different icons. You can customize as you wish. 

	f - alert icon with an exclamation mark
	n - clock
	i - info
	enc - lock (for security)
	ok - green checkmark

Alert modal dialog

	var modalac = new AscModalAlertConfirm();	
	modalac.show_alert('Enter Header Text', "Text of your message goes here. All browsers except Internet Explorer can accept HTML in here.", false);

Alert modal dialog to appear upon page load

	var modalac = new AscModalAlertConfirm({
		'strs': { 
			'on_start_hdr': 'Welcome to the demo',
			'on_start_msg': 'Thanks for checking out this Ascribe Dialog Mootools class!'
		}
	});	

Confirm modal dialog

	var modalac = new AscModalAlertConfirm();	
	modalac.show_confirm('i', '', 'Enter Header Text', "Text of your message goes here", "text to display on confirmation button", 'i16 ok16', function(e) { 
		// define what action to take when the confirmation button is clicked
	});

Individual tool tips

	var tooltip = new AscTip($('id_of_element_to_target'), 'Text of tooltip goes here');

By default, the tooltips will use a CSS class called "AscPop". But you can customize the class or use multiple styles of tooltips on the same page. To use a CSS class called "YourPop", use the classPrefix option when instantiated the AscTip class. 

	var tooltipiwthyourcss = new AscTip($('id_of_element_to_target'), 'Text of tooltip goes here', 'n', {classPrefix: 'Your'});

To add multiple tooltips at a time, use the AscTips class. 

	var asc_tooltips = new AscTips([
		{ id:"id_of_element_to_target", msg:"Tooltip message", align:'nw },
		{ id:"id_of_element_to_target", msg:"Tooltip message", align:'nw },
		{ id:"id_of_element_to_target", msg:"Tooltip message", align:'nw }
	]); 

To customize how you wish the tooltip to be aligned to the target element use the following values:

When the tooltip is to align itself outside the target:

	nw - northwest
	n - north
	ne - northeast
	en - east north
	e - east
	es - east south
	se - south east
	s - south
	sw - southwest
	ws - westsouth
	w  -west
	wn - west north

If the tooltip is to position itself within a target: 

	nw - northwest
	n - north
	ne - northeast
	e - east
	se - south east
	s - south
	sw - southwest
	w  -west

Advanced usage

The base class is called AscDialog. You can use it directly if you wish to do something complex. One example of complex usage might be having tooltips appear targetting fields that failed form validation and have the tips automatically disappear when the user fixes the field content so that it now meets your validation rules.  

Screenshots
-----------

![Screenshot 1](http://www.ascribedata.com/moo/dialog/asc-dialog-confirm-modal.png)
![Screenshot 2](http://www.ascribedata.com/moo/dialog/asc-dialog-tooltip.png)

