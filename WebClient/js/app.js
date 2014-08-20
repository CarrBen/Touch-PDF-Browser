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
	this.resource('year');
});

