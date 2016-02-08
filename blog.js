var Blogs = new Mongo.Collection("blogs");
var startTime = new Date();

if (Meteor.isClient) {
    Template.body.helpers({
        blogs: function () {
            return Blogs.find({}, {sort: {datetime: -1}});
        }
    });

    Template.body.events({
        "submit #blogForm": function (e, t) {

            e.preventDefault();

            var title = t.find('#title').value,
                description = t.find('#description').value,
                update = t.find('#update').value,
                blogId = t.find('#blogId').value;

            var endTime = new Date();
            if (description === '') {
                title = "-";
                description = startTime.toISOString().slice(0, 19) + "\n" + endTime.toISOString().slice(0, 19);
            } else {
                if (update == 0) {
                    description = startTime.toISOString().slice(0, 19) + "\n\n" + description + "\n\n" + endTime.toISOString().slice(0, 19);
                }
            }

            if (update == 0) {
                Meteor.call('addBlog', title, description);
            } else {
                Meteor.call('updateBlog', blogId, title, description);
            }

            $('#title').val('');
            $('#description').val('');
            $('#submit').html('SUBMIT');
            $('#update').val(0);
            $('#blogId').val('');

        },

        "click #title": function (e) {
            e.preventDefault();

            startTime = new Date();
        }
    });

    Template.blog.events({
        "click .delete": function () {
            Meteor.call("deleteBlog", this._id);
        },
        "click .update": function () {
            Meteor.call("loadBlog", this._id);
        }
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

Meteor.methods({
    addBlog: function (title, description) {

        if (!Meteor.userId()) {
            alert("Not authorized");
        }

        Blogs.insert({
            title: title,
            description: description,
            datetime: new Date(),
            user: Meteor.user().username
        })
    },
    deleteBlog: function (blogId) {
        var blog = Blogs.findOne(blogId);
        if (blog.user !== Meteor.user().username) {
            alert("Not authorized");
        }

        Blogs.remove(blogId);
    },
    updateBlog: function (blogId, title, description) {
        var blog = Blogs.findOne(blogId);
        if (blog.user !== Meteor.user().username) {
            alert("Not authorized");
        }

        Blogs.update(blogId, {$set: {title: title, description: description}});
    },
    loadBlog: function (blogId) {
        var blog = Blogs.findOne(blogId);
        if (blog.user !== Meteor.user().username) {
            alert("Not authorized");
        }

        $('#title').val(blog.title);
        $('#description').val(blog.description);
        $('#blogId').val(blogId);
        $('#update').val(1);
        $('#submit').html("UPDATE");
    }
});