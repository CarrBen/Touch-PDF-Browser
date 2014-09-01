setupViewer = function(){
var viewImageJQ = $('#viewImage')
var viewImage = viewImageJQ[0]
viewImage.JQ = viewImageJQ;
var hammertime = Hammer(viewImage, {})

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var widthRatio = viewImage.naturalWidth / winWidth;
var heightRatio = viewImage.naturalHeight / winHeight;


if(widthRatio >= heightRatio){
	var ratio = (winWidth - 24)/viewImage.naturalWidth;
	viewImage.width = winWidth - 24;
	viewImage.removeAttribute('height');
	
	viewImage.scale = ratio;
	viewImage.minScale = ratio;
	viewImageJQ.css('top', (winHeight - (viewImage.naturalHeight*ratio))/2);
	viewImageJQ.css('left', 12)
	
	viewImage.verticalLimit = winHeight - viewImage.naturalHeight*viewImage.scale;
	viewImage.horizontalLimit = 24;
}else{
	viewImage.removeAttribute('width');
	var ratio = (winHeight - 24)/viewImage.naturalHeight;
	viewImage.height = winHeight - 24;
	
	viewImage.scale = ratio;
	viewImage.minScale = ratio;
	viewImageJQ.css('top', 12);
	viewImageJQ.css('left', (winWidth - (viewImage.naturalWidth*ratio))/2);
	
	viewImage.verticalLimit = 24;
	viewImage.horizontalLimit = winWidth - viewImage.naturalWidth*viewImage.scale;
}

viewImage.doubletap = function(){
	var that = this;
	return function(ev){
		that.pinchstart()(ev);
		$({n:0}).animate({n:1}, {progress:
			function(animate, n, ms){
				obj = {
					center:{x:ev.center.x, y:ev.center.y},
					scale: 1 + n
				}
				console.log(obj)
				that.pinch()(obj);
			},
		duration: 200,
		easing: 'linear'});
	}
}

hammertime.on('doubletap', viewImage.doubletap());

hammertime.get('pan').set({direction: Hammer.DIRECTION_ALL});
hammertime.get('pinch').set({enable: true});

viewImage.panstart = function(){
	var that = this;
	return function(ev){
		that.startTop = parseInt(that.JQ.css('top'));
		that.startLeft = parseInt(that.JQ.css('left'));
	}
}

hammertime.on('panstart', viewImage.panstart());

viewImage.pan = function(){
	var that = this;
	return function(ev){
		var top = that.startTop + ev.deltaY;
		top = Math.min(top, that.verticalLimit);
		top = Math.max(top, -that.verticalLimit + winHeight - that.scale * that.naturalHeight)
		
		var left = that.startLeft + ev.deltaX;
		left = Math.min(left, that.horizontalLimit);
		left = Math.max(left, -that.horizontalLimit + winWidth - that.scale * that.naturalWidth)
		
		that.JQ.css('top', top);
		that.JQ.css('left', left);
	}
}

hammertime.on('pan', viewImage.pan());

viewImage.pinchstart = function(){
	var that = this;
	return function(ev){
		that.startScale = that.scale;
		that.startTop = parseInt(that.JQ.css('top'));
		that.startLeft = parseInt(that.JQ.css('left'));
	}
}

hammertime.on('pinchstart', viewImage.pinchstart());

viewImage.pinch = function(){
	var that = this;
	return function(ev){
		that.scale = that.startScale * ev.scale;
		
		that.scale = Math.max(that.scale, that.minScale); 
		that.scale = Math.min(that.scale, 3);
		
		that.height = that.scale * that.naturalHeight;
		that.width = that.scale * that.naturalWidth;

		var topDiff = (ev.center.y - that.startTop) * that.scale / that.startScale;
		var top = ev.center.y - topDiff;
		top = Math.min(top, that.verticalLimit);
		top = Math.max(top, -that.verticalLimit + winHeight - that.scale * that.naturalHeight)
		that.JQ.css('top', top);
		
		var leftDiff = (ev.center.x - that.startLeft) * that.scale / that.startScale;
		var left = ev.center.x - leftDiff;
		left = Math.min(left, that.horizontalLimit);
		left = Math.max(left, -that.horizontalLimit + winWidth - that.scale * that.naturalWidth)
		that.JQ.css('left', left);
	}
}

hammertime.on('pinch', viewImage.pinch());

//This has not been tested at all
viewImage.pinchmove = function(){
	var that = this;
	return function(ev){
		that.pan()(ev);
		that.pinch()(ev);
	}
}

hammertime.on('pinchmove', viewImage.pinchmove());
} //End of setupViewer function