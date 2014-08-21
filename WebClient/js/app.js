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
	this.resource('pub');
	this.resource('year', {path: '/pub/:pub_initials/year'}, function(){
		this.resource('month', {path: '/:year_num/month'}, function(){
			this.resource('issue', {path: '/:month_id/issue'}, function(){
				this.resource('view', {path: '/:issue_id/page'}, function(){
					this.resource('page', {path: '/:page_id'});
				});
			});
		});
	});
});

App.PubRoute = Ember.Route.extend({
	backButton:true,
	model: function(){
		return [{
			'name':'John O Gauntlet',
			'id':'JOG'
			},{
			'name':'Carolynne',
			'id':'CAROL'
			},{
			'name':'STEPS',
			'id':'STEPS'
			}]
	}
});

App.YearRoute = Ember.Route.extend({
	backButton: true,
	model: function(params){
		var data = [{
			'id':1965
			},{
			'id':1966
			},{
			'id':1967
			},{
			'id':1968
			},{
			'id':1969
			},{
			'id':1970
			},{
			'id':1971
			},{
			'id':1972
			}]
		while(data.length % 5 != 0){
			data.push({'id':0, 'invisible':true})
		}
		return data;
	}
});

App.MonthRoute = Ember.Route.extend({
	backButton: true,
	model: function(params){
		return [{'id':'jan',
				'name':'January'},
				{'id':'feb',
				'name':'February'},
				{'id':'mar',
				'name':'March'}
				]
		},
	renderTemplate: function(cont, mod){
		this.render('month', {into: 'application'});
	}
});

App.IssueRoute = Ember.Route.extend({
	backButton: true,
	model: function(params){
		return [{'id':'0',
				'name':'12th'},
				{'id':'1',
				'name':'21st'},
				{'id':'2',
				'name':'23rd'}
				]
		},
	renderTemplate: function(cont, mod){
		this.render('issue', {into: 'application'});
	}
});

App.ViewRoute = Ember.Route.extend({
	backButton: true,
	model: function(params){
		console.log(params);
		return {'src':'John O Gauntlet 03-0.jpg',
				'id':0,
				'next':1,
				'prev':null
			}
		},
	renderTemplate: function(cont, mod){
		this.render('view', {into: 'application'});
		$('#viewImage').ready(startViewerSetup)
	}
});

App.PageRoute = Ember.Route.extend({
	backButton: true,
	model: function(params){
		console.log(params);
		return {'src':'John O Gauntlet 04-4.jpg',
				'id':1,
				'next':2,
				'prev':1
			}
		},
	renderTemplate: function(cont, mod){
		this.render('view', {into: 'application'});
		$('#viewImage').ready(startViewerSetup)
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
}

