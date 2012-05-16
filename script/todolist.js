window.onload =function() {
    var todo = Backbone.Model.extend({
	
	defaults: {
	    id : "random",
	    content:"blank",
	    geolocation:{latitude:0,longitude:0},
	    done: false
	},
	initialize:function(){
	    if (!this.get("geolocation")) {
		this.set({"geolocation": this.defaults.geolocation});
	    }
	},
	toggle:function(){
	    this.set({done: !this.get("done")})
	},
	clear: function() {
	    this.destroy();
	},
	store:function(){	    
	}
    })
    var todolist = Backbone.Collection.extend({
	model:todo,
	localStorage: new Backbone.LocalStorage("todolist"),
	initialize:function(){
	    
	},
	done: function() {
	    return this.filter(function(todo){ return todo.get('done'); });
	},
	remaining: function() {
	    return this.without.apply(this, this.done());
	},
	nextOrder: function() {
	    if (!this.length) return 1;
	    return this.last().get('id') + 1;
	},
	comparator: function(todo) {
	    return todo.get('id');
	} 
    })
    //instanciar a coleção para puder ser usada no view
    var Todolist = new todolist;
    var geo;
    var todoview = Backbone.View.extend({
	tagName: 'li',
	//template: _.template($('#item-template').html()),
	events: {
	    "click .check" : "toggleDone"},
	initialize: function(){
	    //observers do view no mode, quando model remove, o view tambem vai remover
	    _.bindAll(this, 'render', 'close', 'clear');
	    this.model.on('destroy', this.clear);
	},
	render: function() {
	    var template= _.template($('#item-template').html());
	    this.$el.html(template(this.model.toJSON()));
	    //this.input = this.$('.todo-input');
	    return this
	},
	close: function() {
	    this.model.save({content: this.input.val()});	
	},
	toggleDone: function() {
	    this.model.clear();
	},
	edit : function(){
	    this.input.focus();
	},
	clear:function(){
	    this.remove();
	    this.unbind();
	}
    })
    var Appview = Backbone.View.extend({
	el:$("#todo-app"),
	events:{
	    "keypress #todo-input" : "createOnEnter",
	    "click #plus": "createOnClick"},
	initialize:function(){
	    //observers do view principal ao model
	    _.bindAll(this, 'addOne','addAll');
	    Todolist.on('reset',   this.addAll);
	    Todolist.on('add',this.addOne);
	    Todolist.fetch();
	},
	createOnEnter:function(e){
	    if (e.keyCode != 13) return;
	    this.createtodo(this.$("#todo-input").val());
	},
	createOnClick:function(){
	    this.createtodo(this.$("#todo-input").val());
	},
	getstats:function(){
	    var id = Todolist.nextOrder();
	    var content = this.$("#todo-input").val();
	    done = false
	    return {id:id,geolocation:window.geo,content:content};
	},
	addOne: function(todo) {
	    var view = new todoview({model: todo});
	    this.$("#todo-list").append(view.render().el);
	},
	addAll:function(){
	    Todolist.each(this.addOne);
	},
	createtodo:function(content){
	    if (content==""){return};
	    var inputdata = {id: Todolist.nextOrder(),content:content,geolocation:window.geo}
	    Todolist.create(inputdata);
	    this.$("#todo-input").val("");
	}	
    })
    var App;   
    //obter coordenadas do browser
    navigator.geolocation.getCurrentPosition(function(loc){window.geo ={'latitude':loc.coords.latitude,'longitude':loc.coords.longitude}});
    
    App = new Appview({el:$("#todo-app")});
    
    //router da aplicação
    var appRouter = Backbone.Router.extend({
	routes: {"add/:query": "addTodo"},
	addTodo:function(query){
	    App.createtodo(query);
	}

    })
    var approutes = new appRouter;
    Backbone.history.start() 
};
