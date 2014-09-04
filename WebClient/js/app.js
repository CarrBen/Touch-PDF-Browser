App = Ember.Application.create();

IMG_ROOT = '../JPGs/'
jsonIndexPath = function(params){
	var url = IMG_ROOT;
	for(param in params){
		if(param == 'type' || param =='page'){
			continue;
		}
		url += params[param];
		url += '/';
	}
	url += 'index.json';
	return url;
}

openInfoModal = function(){
	$('.modal.info').modal('show');
};
$(document).on('click', '.ui.button#info', openInfoModal);

openHelpModal = function(){
	$('.modal.help').modal('show');
}
$(document).on('click', '.ui.button#help', openHelpModal);

App.Router.map(function() {
	this.resource('browse', {path:'/browse'});
	this.resource('search', {path:'/search'}, function(){
		this.resource('results', {path:'/results'});
	});
	this.resource('year', {path: '/year'});
	this.resource('month', {path: '/month'});
	this.resource('issue', {path: '/issue'});
	this.resource('view', {path: '/view'});
});

App.BrowseRoute = Ember.Route.extend({
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

App.BrowseController = Ember.ArrayController.extend({
	'backButton':true,
	actions:{
		back:function(){
			this.transitionToRoute('/')
		}
	}
});

App.SearchRoute = Ember.Route.extend({
	queryParams:{
		query:{
			refreshModel: true
		}
	},
	beforeModel:function(trans){
		if('query' in trans.queryParams){
			this.controllerFor('search').set('searchQuery', trans.queryParams['query']);
		}
	}
});

App.SearchController = Ember.Controller.extend({
	'backButton':true,
	actions:{
		back:function(){
			this.transitionToRoute('/');
		},
		doSearch:function(){
			if(this.searchQuery != undefined){
				var queryParams = {'queryParams':{'query':this.searchQuery}};
				this.transitionToRoute('results', queryParams);
			}
		}
	}
});

App.ResultsRoute = Ember.Route.extend({
	queryParams:{
		query:{
			refreshModel: true,
		}
	},
	beforeModel:function(trans){
		if(!('query' in trans.queryParams)){
			this.transitionTo('/search');
		}
	},
	model:function(params){
		console.log(params);
	},
	resetController: function(controller, exiting, trans){
		if(exiting){
			controller.set('query', null);
		}
	}
});

App.ResultsView = Ember.View.extend({
	didInsertElement: function(trans, queryparams){
		var header = document.getElementById('logoHeader');
		header.style.fontSize = '4vmin';
		header.style.marginBottom = '1em';
		header.style.marginTop = '1em';
		var input = document.getElementById('searchInput');
		input.style.fontSize = '2vmin';
		var results = document.getElementById('searchResults');
		setTimeout(function(){
			results.style.top = '25vmin';
		}, 50);
	}
});

App.ResultsController = Ember.ArrayController.extend({
	queryParams:['query'],
	query:null
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
		return $.getJSON(jsonIndexPath(params)).then(function(body){
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
	type:'browse',
	actions:{
		back:function(){
			var queryParams = {'pub':this.pub, 'type':this.type}
			this.transitionToRoute('browse');
		}
	}
});

App.MonthRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('year' in trans.queryParams)){
			this.transitionTo('year', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return $.getJSON(jsonIndexPath(params)).then(function(body){
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
	type: 'browse',
	actions:{
		back:function(){
			var queryParams = {'pub':this.pub, 'year':this.year, 'type':this.type}
			this.transitionToRoute('year', {queryParams:queryParams});
		}
	}
});

App.IssueRoute = Ember.Route.extend({
	backButton: true,
	beforeModel: function(trans){
		if(!('month' in trans.queryParams)){
			this.transitionTo('month', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return $.getJSON(jsonIndexPath(params)).then(function(body){
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
					delete trans.queryParams['month']
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
	type: 'browse',
	actions:{
		back:function(){
			var queryParams = {'pub':this.pub, 'year':this.year, 'month':this.month, 'type':this.type}
			this.transitionToRoute('month', {queryParams:queryParams});
		}
	}
});

App.ViewRoute = Ember.Route.extend({
	queryParams: {
		page: {
			refreshModel: true
		}
	},
	backButton: true,
	beforeModel: function(trans){
		if(!('issue' in trans.queryParams)){
			this.transitionTo('issue', {queryParams: trans.queryParams});
		}
	},
	model: function(params){
		return $.getJSON(jsonIndexPath(params)).then(function(body){
				return body['data'];
			});
		},
	renderTemplate: function(controller, model){
		this.render('view', {into: 'application'});
		DocumentViewer.set_data(model, controller.page);
	},
	resetController: function(controller, exiting, trans){
		if(exiting){
			controller.set('page', 0);
		}
	},
	willDestroy: function(){
		DocumentViewer.teardown();
	}
});

//WHYY
App.ViewView = Ember.View.extend({
	didInsertElement:function(){
		DocumentViewer.setup();
	}
});

App.ViewController = Ember.Controller.extend({
	backButton:true,
	queryParams:['pub', 'year', 'month', 'issue', 'page', 'type'],
	pub:null,
	year:null,
	month:null,
	issue:null,
	page:0,
	type:'browse',
	actions:{
		back:function(){
			var queryParams = {'pub':this.pub, 'year':this.year, 'month':this.month, 'issue':this.issue, 'page':this.page, 'type':this.type}
			this.transitionToRoute('issue', {queryParams:queryParams});
		},
		next:function(){
			var queryParams = {'pub':this.pub, 'year':this.year, 'month':this.month, 'issue':this.issue, 'page':this.page, 'type':this.type}
			queryParams['page'] = DocumentViewer.current_page + 1;
			this.replaceRoute('view', {queryParams:queryParams});
			DocumentViewer.next_page();
		},
		prev:function(){
			var queryParams = {'pub':this.pub, 'year':this.year, 'month':this.month, 'issue':this.issue, 'page':this.page, 'type':this.type}
			queryParams['page'] = DocumentViewer.current_page - 1;
			this.replaceRoute('view', {queryParams:queryParams});
			DocumentViewer.prev_page();
		}
	}
});
