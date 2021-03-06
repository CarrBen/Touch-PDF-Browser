var DocumentViewer = {};

DocumentViewer.set_data = function(data_model, page){
	this.data = data_model;
	this.page_count = this.data['pages'].length;
	this.current_page = page;
}

DocumentViewer.setup = function(){
	this.stage = $('#imageStage');
	this.scroller = $('#imageScroller');
	this.next = $('#next');
	this.prev = $('#prev');
	this.change_page_immediate(this.current_page);
	this.create_images(this.data);
	this.show_hide_page_buttons();
	this.scale_animated_page_index = this.current_page;
	this.setup_hammer();
	this.setup_mouse();
}

DocumentViewer.create_images = function(data_model){
	this.pages = {};
	for(var i = 0; i < data_model.pages.length; i++){
		var j = this.current_page + i;
		if(j < data_model.pages.length){
			var img = document.createElement('img');
			img.src = data_model['pages'][j];
			img.className = 'document_page';
			img.onload = this.image_loaded(j);
			img.ondragstart = function(){return false};
			this.pages[j] = img;
		}
		var j = this.current_page - i;
		if(j >= 0 && i > 0){
			var img = document.createElement('img');
			img.src = data_model['pages'][j];
			img.className = 'document_page';
			img.onload = this.image_loaded(j);
			img.ondragstart = function(){return false};
			this.pages[j] = img;
		}
	}
}

DocumentViewer.image_loaded = function(index){
	var that = this;
	return function(){
		that.reset_image_scale(index);
		that.scroller.append(that.pages[index]);
	}
}

DocumentViewer.reset_image_scale = function(index){
	var img = this.pages[index];
	var widthRatio = img.naturalWidth / window.innerWidth;
	var heightRatio = img.naturalHeight / window.innerHeight;
	
	if(widthRatio >= heightRatio){
		var ratio = (window.innerWidth - 24)/img.naturalWidth;
		img.width = window.innerWidth - 24;
		img.height = img.naturalHeight * ratio;
		
		img.scale = ratio;
		img.minScale = ratio;
		
		img.verticalLimit = window.innerHeight - img.naturalHeight * img.scale;
		img.horizontalLimit = 24
		
		var left = 12;
		var top = (window.innerHeight - (img.naturalHeight*img.scale))/2;
		this.set_image_pos(index, left, top);
	}else{
		var ratio = (window.innerHeight - 24)/img.naturalHeight;
		img.width = img.naturalWidth * ratio;
		img.height = window.innerHeight - 24;
		
		img.scale = ratio;
		img.minScale = ratio;
		
		img.verticalLimit = 24;
		img.horizontalLimit = window.innerWidth - img.naturalWidth * img.scale;
		
		var left = (window.innerWidth - (img.naturalWidth*img.scale))/2;
		var top = 12;
		this.set_image_pos(index, left, top);
	}
}

DocumentViewer.set_image_pos = function(index, rel_left, rel_top){
	var left = rel_left + index * window.innerWidth;
	var top = rel_top;

	var img = this.pages[index];
	img.style.left = left + 'px';
	img.style.top = top + 'px';
}

DocumentViewer.get_image_pos = function(index){
	var img = this.pages[index];
	var rel_left = parseInt(img.style.left.replace('px',''))
	var rel_top = parseInt(img.style.top.replace('px',''))
	
	return {top:rel_top, left:rel_left - index * window.innerWidth};
}

DocumentViewer.show_hide_page_buttons = function(){
	var next_vis = 'hidden';
	var prev_vis = 'hidden';
	if(this.current_page < this.page_count - 1){
		next_vis = 'visible';
	}
	if(this.current_page > 0){
		prev_vis = 'visible';
	}
	this.next.css('visibility', next_vis);
	this.prev.css('visibility', prev_vis);
}

DocumentViewer.next_page = function(){
	this.enable_scale_animation(this.current_page, '300ms');
	this.reset_image_scale(this.current_page);
	this.current_page += 1;
	this.change_page(this.current_page);
}

DocumentViewer.prev_page = function(){
	this.enable_scale_animation(this.current_page, '300ms');
	this.reset_image_scale(this.current_page);
	this.current_page -= 1;
	this.change_page(this.current_page);
}

DocumentViewer.change_page = function(new_index){
	var that = this;
	that.show_hide_page_buttons();
	setTimeout(function(){
		that.scroller.css('left', -new_index * window.innerWidth);
	}, 150);
	setTimeout(function(){
		that.disable_scale_animation();
	}, 750);
}

DocumentViewer.change_page_immediate = function(new_index){
	var that = this;
	that.show_hide_page_buttons();
	that.scroller.css('left', -new_index * window.innerWidth);
}

DocumentViewer.enable_scale_animation = function(index, time){
	//TODO: Perhaps check if already set?
	this.scale_animated_page_index = index;
	var img = this.pages[index];
	img.style.webkitTransition = 'left '+time+', top '+time+', width '+time+', height '+time;
}

DocumentViewer.disable_scale_animation = function(){
	//TODO: Check if actually set
	var img = this.pages[this.scale_animated_page_index]
	img.style.webkitTransition = '';
	this.scale_animated_page_index = null;
}

DocumentViewer.setup_hammer = function(){
	this.stage_hammer = Hammer(this.stage[0]);

	this.stage_hammer.get('pan').set({direction: Hammer.DIRECTION_ALL});
	this.stage_hammer.get('pinch').set({enable: true});
	
	this.stage_hammer.on('doubletap', this.hammer_doubletap());

	this.stage_hammer.on('panstart', this.hammer_panstart());
	this.stage_hammer.on('pan', this.hammer_pan());
	
	this.stage_hammer.on('pinchstart', this.hammer_pinchstart());
	this.stage_hammer.on('pinch', this.hammer_pinch());
	this.stage_hammer.on('pinchend', this.hammer_pinchend());
	
	//NOT TESTED
	this.stage_hammer.on('pinchmove', this.hammer_pinchmove());
}

DocumentViewer.hammer_doubletap = function(){
	var that = this;
	return function(ev){
		that.enable_scale_animation(that.current_page, '750ms');
		that.hammer_pinchstart()(ev);
		obj = {
			center:{x:ev.center.x, y:ev.center.y},
			deltaX:0,
			deltaY:0,
			scale: 2
		}
		that.hammer_pinch()(obj);
		setTimeout(function(){
			that.disable_scale_animation();
		}, 750);
		return false;
	}
}

DocumentViewer.hammer_panstart = function(){
	var that = this;
	return function(ev){
		var pos = that.get_image_pos(that.current_page);

		that.startTop = pos.top;
		that.startLeft = pos.left;
		return false;
	}
}

DocumentViewer.hammer_pan = function(){
	var that = this;
	return function(ev){
		if(that.is_pinching){
			return false;
		}
		var img = that.pages[that.current_page];

		var top = that.startTop + ev.deltaY;
		top = Math.min(top, img.verticalLimit);
		top = Math.max(top, -img.verticalLimit + window.innerHeight - img.scale * img.naturalHeight)
		
		var left = that.startLeft + ev.deltaX;
		left = Math.min(left, img.horizontalLimit);
		left = Math.max(left, -img.horizontalLimit + window.innerWidth - img.scale * img.naturalWidth);
		that.set_image_pos(that.current_page, left, top);
		return false;
	}
}

DocumentViewer.hammer_pinchstart = function(){
	var that = this;
	return function(ev){
		that.is_pinching = true;
		var img = that.pages[that.current_page];
		img.startScale = img.scale;
		
		var pos = that.get_image_pos(that.current_page);
		that.startPinchTop = pos.top;
		that.startPinchLeft = pos.left;
		return false;
	}
}

DocumentViewer.hammer_pinch = function(){
	var that = this;
	return function(ev){
		var img = that.pages[that.current_page];
		img.scale = img.startScale * ev.scale;
		
		img.scale = Math.max(img.scale, img.minScale); 
		img.scale = Math.min(img.scale, 2.5);
		
		img.height = img.scale * img.naturalHeight;
		img.width = img.scale * img.naturalWidth;

		var topDiff = (ev.center.y - ev.deltaY - that.startPinchTop) * img.scale / img.startScale;
		var top = ev.center.y - topDiff;
		top = Math.min(top, img.verticalLimit);
		top = Math.max(top, -img.verticalLimit + window.innerHeight - img.scale * img.naturalHeight)
		
		var leftDiff = (ev.center.x - ev.deltaX - that.startPinchLeft) * img.scale / img.startScale;
		var left = ev.center.x - leftDiff;
		left = Math.min(left, img.horizontalLimit);
		left = Math.max(left, -img.horizontalLimit + window.innerWidth - img.scale * img.naturalWidth)
		
		that.startLeft = left;
		that.startTop = top;

		that.set_image_pos(that.current_page, left, top);
		return false;
	}
}

DocumentViewer.hammer_pinchend = function(){
	var that = this;
	return function(ev){
		that.is_pinching = false;
	}
}

//NOT TESTED
DocumentViewer.hammer_pinchmove = function(){
	var that = this;
	return function(ev){
		//console.log('pinchmove');
		//that.hammer_pan()(ev);
		//that.hammer_pinch()(ev);
		return false;
	}
}

DocumentViewer.setup_mouse = function(){
	var stage = this.stage[0];
	
	stage.addEventListener('wheel', this.mouse_scroll());
	
	stage.addEventListener('mousedown', this.mouse_mousedown(), true);
	stage.addEventListener('mousemove', this.mouse_mousemove(), true);
	stage.addEventListener('mouseup', this.mouse_mouseup(), true);
}

DocumentViewer.mouse_mousedown = function(){
	var that = this;
	return function(ev){
		that.mouse_startX = ev.pageX;
		that.mouse_startY = ev.pageY;

		that.mouse_ispressed = true;
		ev.cancelBubble = true;
		return false;
	}
}

DocumentViewer.mouse_mousemove = function(){
	var that = this;
	return function(ev){
		ev.cancelBubble = true;
		var x = ev.pageX;
		var y = ev.pageY;
		var dx = x - that.mouse_startX;
		var dy = y - that.mouse_startY;
		if(that.mouse_ispressed && dx*dx + dy*dy > 5 && !(that.mouse_isdragging)){
			that.mouse_isdragging = true;
			that.mouse_dragstart()(ev);
		}
		if(that.mouse_ispressed && that.mouse_isdragging){
			that.mouse_drag()(ev);
		}

		return false;
	}
}

DocumentViewer.mouse_mouseup = function(){
	var that = this;
	return function(ev){
		that.mouse_ispressed = false;
		that.mouse_isdragging = false;
		ev.cancelBubble = true;
		return false;
	}
}

DocumentViewer.mouse_dragstart = function(){
	var that = this;
	return function(ev){
		var x = ev.pageX;
		var y = ev.pageY;
		var dx = x - that.mouse_startX;
		var dy = y - that.mouse_startY;
		obj = {center: {x:x, y:y},
			deltaX: dx,
			deltaY: dy
		}
		that.hammer_panstart()(obj);
	}
}

DocumentViewer.mouse_drag = function(){
	var that = this;
	return function(ev){
		var x = ev.pageX;
		var y = ev.pageY;
		var dx = x - that.mouse_startX;
		var dy = y - that.mouse_startY;
		obj = {center: {x:x, y:y},
			deltaX: dx,
			deltaY: dy
		}
		that.hammer_pan()(obj);
	}
}

DocumentViewer.mouse_scroll = function(){
	var that = this;
	return function(ev){
		var s = 1;
		if(ev.wheelDeltaY > 0){
			s = 1.1;
		}else{
			s = 1/1.1;
		}
		obj = {
			center:{x:ev.pageX, y:ev.pageY},
			scale: s
		}
		that.hammer_pinchstart()(obj);
		that.hammer_pinch()(obj);
		if(that.mouse_isdragging){
			var img = that.pages[that.current_page];
			var leftDiff = (that.mouse_startX - that.startLeft) * img.scale / img.startScale;
			var topDiff = (that.mouse_startY - that.startTop) * img.scale / img.startScale;
			that.startLeft = that.mouse_startX - leftDiff;
			that.startTop = that.mouse_startY - topDiff;
		}
		return false;
	}
}

DocumentViewer.teardown = function(){
	this.stage[0].remove(this.scroller[0]);
	var n = this.pages.length;
	for(var i=0; i<n; i++){
		this.pages[i].src = "data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=";
		setTimeout(function(){
			this.pages[i] = null;
		},100);
	}
}
