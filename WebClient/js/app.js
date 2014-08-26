App = Ember.Application.create();

IMG_ROOT = '../JPGs/'

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
			'pub_id':'jog'
			},{
			'name':'Carolynne',
			'pub_id':'carol'
			},{
			'name':'STEPS',
			'pub_id':'steps'
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
		return $.getJSON(IMG_ROOT+params.pub+'/index.json').then(function(body){
			var data = body['data'];
			while(data.length % 5 != 0){
				data.push({'id':0, 'invisible':true})
			}	
			return data;
		});
	}
});

App.YearController = Ember.ArrayController.extend({
	backButton: true,
	queryParams:['pub', 'type'],
	pub:null,
	type:'browse'
});

App.MonthRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('year' in trans.queryParams)){
			this.transitionTo('year', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return $.getJSON(IMG_ROOT+params.pub+'/'+params.year+'/index.json').then(function(body){
				var data = body['data'].sort(function(a,b){
					return a.order > b.order;
				});
				while(data.length % 5 != 0){
					data.push({'id':0, 'invisible':true})
				}	
				return data;
			});
		}
});

App.MonthController = Ember.ArrayController.extend({
	backButton:true,
	queryParams:['pub', 'year', 'type'],
	pub: null,
	year: null,
	type: 'browse'
});

App.IssueRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('month' in trans.queryParams)){
			this.transitionTo('month', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return $.getJSON(IMG_ROOT+params.pub+'/'+params.year+'/'+params.month+'/index.json').then(function(body){
				return body['data'];
			});
		},
	afterModel: function(model, trans, params){
			if(trans.router.oldState){
				if(trans.router.state.handlerInfos[1].name == 'month' && model.length == 1){
					trans.queryParams['issue'] = model[0]['issue_id'];
					this.transitionTo('view', {queryParams: trans.queryParams});
				}
				if(trans.router.state.handlerInfos[1].name == 'view' && model.length == 1){
					trans.queryParams.remove('month');
					this.transitionTo('month', {queryParams: trans.queryParams});
				}
			}
		}
});

App.IssueController = Ember.ArrayController.extend({
	backButton:true,
	queryParams:['pub', 'year', 'month', 'type'],
	pub:null,
	year:null,
	month:null,
	type: 'browse'
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
	queryParams:['pub', 'year', 'month', 'issue', 'page', 'type'],
	pub:null,
	year:null,
	month:null,
	issue:null,
	page:1,
	type:'browse',
	actions:{
		back:function(){
			this.transitionToRoute('issue')
		}
	}
});


function startViewerSetup(ev){
	window.requestAnimationFrame(waitViewerSetup);
}

function waitViewerSetup(ev){
	window.requestAnimationFrame(doViewerSetup);
}

function doViewerSetup(ev){
	setupViewer();
	$('#viewImage').css('visibility', 'visible');
}

