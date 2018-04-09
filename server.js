'use-strict';

const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.Promise = global.Promise;

const { DATABASE_URL, PORT } = require('./config');
const { BlogPost } = require('./models');

const app = express();

// const blogPosts = require('./blogRouter');

app.use(morgan('common'));
app.use(bodyParser.json());
// app.use('/blog-posts', blogPosts);

app.get('/posts', (req, res) => {
  BlogPost
    .find()
    .then(posts => {
      res.json(posts.map(post => post.serialize()));
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'something went terribly wrong' });
    });
});

app.get('/posts/:id', (req, res) => {
  console.log(req) // just to look at it.
  console.log(req.body) // check it out
  console.log(req.params) // look at this too
  BlogPost
    .findById(req.params.id)
    .then(post => {
      console.log(post) // just to look at it
      res.json(post);
    })
    .catch(err => {
      // write code to handle error
    });
});

app.post('/posts', (req, res) => {

  const requiredFields = ['author', 'created', 'id', 'title', 'content'];
  for (let i = 0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if(!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }

  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author,
      created: req.body.created,
      id: req.body.id
    })
    .then(restaurant => res.status(200).json(restaurant.serialize()))
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Internal server error' });
    });
});

app.put('/posts/:id', (req, res) => {
  // handle the case if the client sends over an invalid :id

  const fieldsToUpdate = ['title', 'author', 'content'];
  let updatedDocument = {};
  fieldsToUpdate.forEach(thing => {
    if (thing in req.body) {
      updatedDocument[thing] = req.body[thing];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, updatedDocument)
    .then(updatedPost => {
      res.json(updatedPost);
    })
    .catch(err => res.status(500).json({ message: 'Internal server error'}));
    });

app.delete('/posts/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .then(post => res.status(204).end())
    .catch(err => res.status(500).json({ message: 'Internal Server Error'}));
});

app.use('*', function (req, res) {
  res.status(404).json({ message: 'Not Found' });
});

let server;


function runServer(databaseUrl, port=PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}


function closeServer() {
  return new Promise((resolve, reject) => {
    console.log('Closing server');
    server.close(err => {
      if (err) {
        reject(err);
        return;
      }
      resolve;
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
