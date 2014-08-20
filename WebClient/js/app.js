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
	this.resource('year', {path: '/pub/:pub_initials'});
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

