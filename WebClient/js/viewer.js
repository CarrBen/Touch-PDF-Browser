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
	this.create_images(this.data);
	this.show_hide_page_buttons();
	this.change_page(this.current_page);
	this.setup_hammer();
}

DocumentViewer.create_images = function(data_model){
	this.pages = {};
	for(var i = 0; i < data_model.pages.length; i ++){
		var img = document.createElement('img');
		img.src = data_model['pages'][i];
		img.className = 'document_page';
		img.onload = this.image_loaded(i);
		this.pages[i] = img;
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
		img.removeAttribute('height');
		img.width = window.innerWidth - 24;
		
		img.scale = ratio;
		img.minScale = ratio;
		
		img.verticalLimit = window.innerHeight - img.naturalHeight * img.scale;
		img.horizontalLimit = 24
		
		var left = 12;
		var top = (window.innerHeight - (img.naturalHeight*img.scale))/2;
		this.set_image_pos(index, left, top);
	}else{
		var ratio = (window.innerHeight - 24)/img.naturalHeight;
		img.removeAttribute('width');
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
	this.reset_image_scale(this.current_page);
	this.current_page += 1;
	this.show_hide_page_buttons();
	this.change_page(this.current_page);
}

DocumentViewer.prev_page = function(){
	this.reset_image_scale(this.current_page);
	this.current_page -= 1;
	this.show_hide_page_buttons();
	this.change_page(this.current_page);
}

DocumentViewer.change_page = function(new_index){
	this.scroller.css('left', -new_index * window.innerWidth);
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
	
	//NOT TESTED
	this.stage_hammer.on('pinchmove', this.hammer_pinchmove());
}

DocumentViewer.hammer_doubletap = function(){
	var that = this;
	return function(ev){
		that.hammer_pinchstart()(ev);
		$({n:0}).animate({n:1}, {progress:
			function(animate, n, ms){
				obj = {
					center:{x:ev.center.x, y:ev.center.y},
					scale: 1 + n
				}
				that.hammer_pinch()(obj);
			},
		duration: 200,
		easing: 'linear'});
	}
}

DocumentViewer.hammer_panstart = function(){
	var that = this;
	return function(ev){
		var pos = that.get_image_pos(that.current_page);

		that.startTop = pos.top;
		that.startLeft = pos.left;
	}
}

DocumentViewer.hammer_pan = function(){
	var that = this;
	return function(ev){
		var img = that.pages[that.current_page];

		var top = that.startTop + ev.deltaY;
		top = Math.min(top, img.verticalLimit);
		top = Math.max(top, -img.verticalLimit + window.innerHeight - img.scale * img.naturalHeight)
		
		var left = that.startLeft + ev.deltaX;
		left = Math.min(left, img.horizontalLimit);
		left = Math.max(left, -img.horizontalLimit + window.innerWidth - img.scale * img.naturalWidth);
		
		that.set_image_pos(that.current_page, left, top);
	}
}

DocumentViewer.hammer_pinchstart = function(){
	var that = this;
	return function(ev){
		var img = that.pages[that.current_page];
		img.startScale = img.scale;
		
		var pos = that.get_image_pos(that.current_page);
		that.startTop = pos.top;
		that.startLeft = pos.left;
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

		var topDiff = (ev.center.y - that.startTop) * img.scale / img.startScale;
		var top = ev.center.y - topDiff;
		top = Math.min(top, img.verticalLimit);
		top = Math.max(top, -img.verticalLimit + window.innerHeight - img.scale * img.naturalHeight)
		
		var leftDiff = (ev.center.x - that.startLeft) * img.scale / img.startScale;
		var left = ev.center.x - leftDiff;
		left = Math.min(left, img.horizontalLimit);
		left = Math.max(left, -img.horizontalLimit + window.innerWidth - img.scale * img.naturalWidth)

		that.set_image_pos(that.current_page, left, top);
	}
}

//NOT TESTED
DocumentViewer.hammer_pinchmove = function(){
	var that = this;
	return function(ev){
		that.hammer_pan()(ev);
		that.hammer_pinch()(ev);
	}
}