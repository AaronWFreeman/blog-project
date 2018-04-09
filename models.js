'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const blogPostSchema = mongoose.Schema({
  author: {
      firstName: String,
      lastName: String
    },
    title: {type: String, required: true},
    content: {type: String},
    created: {type: Date, default: Date.now}
  });

blogPostSchema.virtual('authorName').get(function() {
  return `${this.author.firstName} ${this.author.lastName}`;
});

blogPostSchema.methods.serialize = function() {
  return {
    title: this.title,
    content: this.content,
    author: this.authorName,
    id: this._id,
    created: this.created
  };
}

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = {BlogPost};
