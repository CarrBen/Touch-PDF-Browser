App = Ember.Application.create();

openInfoModal = function(){
	$('.modal.info').modal('show');
};
$(document).on('click', '.ui.button#info', openInfoModal);

openHelpModal = function(){
	$('.modal.help').modal('show');
}
$(document).on('click', '.ui.button#help', openHelpModal);

App.Router.map(function() {
	this.resource('pub', {path:'/pub'});
	this.resource('year', {path: '/year'});
	this.resource('month', {path: '/month'});
	this.resource('issue', {path: '/issue'});
	this.resource('view', {path: '/view'});
});

App.PubRoute = Ember.Route.extend({
	'backButton':true,
	model: function(params){
		return [{
			'name':'John O Gauntlet',
			'pub_id':'JOG'
			},{
			'name':'Carolynne',
			'pub_id':'CAROL'
			},{
			'name':'STEPS',
			'pub_id':'STEPS'
			}]
	}
});

App.PubController = Ember.ArrayController.extend({
	'backButton':true,
	queryParams:['type'],
	type:null
});

App.YearRoute = Ember.Route.extend({
	'backButton': true,
	beforeModel: function(trans){
		if(!('pub' in trans.queryParams)){
			trans.queryParams.type = 'browse';
			this.transitionTo('pub', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		var data = [{
			'year_id':1965
			},{
			'year_id':1966
			},{
			'year_id':1967
			},{
			'year_id':1968
			},{
			'year_id':1969
			},{
			'year_id':1970
			},{
			'year_id':1971
			},{
			'year_id':1972
			}]
		while(data.length % 5 != 0){
			data.push({'id':0, 'invisible':true})
		}
		return data;
		}
});

App.YearController = Ember.ArrayController.extend({
	backButton: true,
	queryParams:['pub'],
	pub:null
});

App.MonthRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('year' in trans.queryParams)){
			this.transitionTo('year', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return [{'month_id':'jan',
				'name':'January'},
				{'month_id':'feb',
				'name':'February'},
				{'month_id':'mar',
				'name':'March'}
				]
		}
});

App.MonthController = Ember.ArrayController.extend({
	backButton:true,
	queryParams:['pub', 'year'],
	pub: null,
	year: null
});

App.IssueRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('month' in trans.queryParams)){
			this.transitionTo('month', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return [{'issue_id':'0',
				'name':'12th'},
				{'issue_id':'1',
				'name':'21st'},
				{'issue_id':'2',
				'name':'23rd'}
				]
		}
});

App.IssueController = Ember.ArrayController.extend({
	backButton:true,
	queryParams:['pub', 'year', 'month'],
	pub:null,
	year:null,
	month:null
});

App.ViewRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('issue' in trans.queryParams)){
			this.transitionTo('issue', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return {'img_src':'John O Gauntlet 03-0.jpg',
				'page_id':0,
				'page_next':1,
				'page_prev':null
			}
		},
	renderTemplate: function(cont, mod){
		this.render('view', {into: 'application'});
		$('#viewImage').ready(startViewerSetup)
	}
});

App.ViewController = Ember.Controller.extend({
	backButton:true,
	queryParams:['pub', 'year', 'month', 'issue', 'page'],
	pub:null,
	year:null,
	month:null,
	issue:null,
	page:1
});


function startViewerSetup(ev){
	window.requestAnimationFrame(waitViewerSetup);
}

function waitViewerSetup(ev){
	window.requestAnimationFrame(doViewerSetup);
}

function doViewerSetup(ev){
	setupViewer();
}

