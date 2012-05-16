window.onload = function() {
    //get browser coords
    navigator.geolocation.getCurrentPosition(function(loc) {
        window.geo = {
            'latitude': loc.coords.latitude,
            'longitude': loc.coords.longitude
        };
    });

    var Todo = Backbone.Model.extend({
	defaults: {
	    done: false,
            geolocation: window.geo
        },

	toggle: function() {
	    this.set({done: !this.get("done")});
	},

	clear: function() {
	    this.destroy();
	}
    });


    var TodoSet = Backbone.Collection.extend({
	model: Todo,

	localStorage: new Backbone.LocalStorage("todolist"),

	done: function() {
	    return this.filter(function(todo){ return todo.get('done'); });
	},

	comparator: function(todo) {
	    return todo.get('id');
	}
    });

    //collection needs to be instantiated to be used by view
    Todo.collection = new TodoSet;

    var TodoView = Backbone.View.extend({
	tagName: 'li',

	events: {
            "click .check" : "toggleDone"
        },

	initialize: function() {
	    //view observers on the model
	    _.bindAll(this, 'render', 'close', 'clear');
	    this.model.on('destroy', this.clear);
	},

	render: function() {
	    var template= _.template($('#item-template').html());
	    this.$el.html(template(this.model.toJSON()));
	    //this.input = this.$('.todo-input');
	    return this;
	},

	close: function() {
	    this.model.save({content: this.input.val()});
	},

	toggleDone: function() {
	    this.model.toggle();
	},

	edit: function() {
	    this.input.focus();
	},

	clear: function() {
	    this.remove();
	    this.unbind();
	}
    });


    var TodoList = Backbone.View.extend({
	el:$("#container"),

	events:{
	    "keypress #todo-input" : "createOnEnter",
	    "click #plus": "createOnClick",
	    "click #done .clearBtn": "clearDoneTasks"},

	initialize: function(){
	    //Appview observers to the collection
	    _.bindAll(this);
	    this.collection.on('reset', this.addAll);
	    this.collection.on('add',this.addOne);
	    this.collection.on('add',this.checkCompleted);
	    this.collection.on('remove',this.checkCompleted);
	    this.collection.on('change:done', this.checkCompleted);
	    this.collection.fetch();
            $(this.el).draggable();
	},

	createOnEnter: function(e) {
	    if (e.keyCode != 13) return;
	    this.createTodo(this.$("#todo-input").val());
	},

	createOnClick: function() {
	    this.createTodo(this.$("#todo-input").val());
	},

	addOne: function(model) {
	    var todo = new TodoView({model: model});
	    this.$("#todo-list").append(todo.render().el);
	    this.checkCompleted();
	},

	addAll: function(){
	    this.collection.each(this.addOne);
	},

	createTodo: function(content){
	    if (content == "")
                return;
	    this.collection.create({content: content});
	    this.$("#todo-input").val("");
	},

	checkCompleted: function(){
            var done = this.collection.done();
	    if (done.length >0){
                this.$('#done .count').html(done.length);
		this.$("#done").show();}
	    else
                this.$("#done").hide();
	},

	clearDoneTasks: function(){
	    _.each(this.collection.done(), function(todo){
                todo.clear();
            });
	}
    });

    var todoList = new TodoList({
        el:$("#todo-app"),
        collection: Todo.collection
    });

    //app router
    var appRouter = Backbone.Router.extend({
	routes: {"add/:query": "addTodo"},

	addTodo: function(query){
	    App.createtodo(query);
	}
    });

    var approutes = new appRouter;

    Backbone.history.start();
};
