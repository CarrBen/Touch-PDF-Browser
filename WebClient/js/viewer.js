var viewImageJQ = $('#viewImage')
var viewImage = viewImageJQ[0]
viewImage.JQ = viewImageJQ;
var hammertime = Hammer(viewImage, {})

var winWidth = window.innerWidth;
var winHeight = window.innerHeight;

var widthRatio = viewImage.naturalWidth / winWidth;
var heightRatio = viewImage.naturalHeight / winHeight;

if(widthRatio >= heightRatio){
	var ratio = (winWidth - 24)/viewImage.width;
	viewImage.width = winWidth - 24;
	viewImage.removeAttribute('height');
	
	viewImage.scale = ratio;
	viewImageJQ.css('top', (winHeight - (viewImage.height*ratio))/2);
	viewImageJQ.css('left', 12)
}else{
	viewImage.removeAttribute('width');
	var ratio = (winHeight - 24)/viewImage.height;
	viewImage.height = winHeight - 24;
	
	viewImage.scale = ratio;
	viewImageJQ.css('top', 12);
	viewImageJQ.css('left', (winWidth - (viewImage.width*ratio))/2);
}

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
		that.JQ.css('top', that.startTop + ev.deltaY);
		that.JQ.css('left', that.startLeft + ev.deltaX);
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
		
		that.scale = Math.max(that.scale, 0.2); //TODO Calculate these base on image size
		that.scale = Math.min(that.scale, 4);
		
		that.height = that.scale * that.naturalHeight;
		that.width = that.scale * that.naturalWidth;

		var leftDiff = (ev.center.x - that.startLeft) * that.scale / that.startScale;
		that.JQ.css('left', ev.center.x - leftDiff);
		
		var topDiff = (ev.center.y - that.startTop) * that.scale / that.startScale;
		that.JQ.css('top', ev.center.y - topDiff);
	}
}

hammertime.on('pinch', viewImage.pinch());