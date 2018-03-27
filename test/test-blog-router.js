const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const expect = chai.expect;
chai.use(chaiHttp);

describe('BlogPosts', function() {
  before(function() {
    return runServer();
  });
  after(function() {
    return closeServer();
  });

  it('should show blog-post on GET', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body.length).to.be.at.least(1);
        const expectedKeys = ['title', 'content', 'author', 'publishDate'];
        res.body.forEach(function(item) {
          expect(item).to.be.a('object');
          expect(item).to.include.keys(expectedKeys);
        });
      });
  });
  it('should add blog-post on POST', function() {
    const newBlog = {title: 'something', content: 'anything', author: 'some guy', publishDate: '2012'};
    return chai.request(app)
      .post('/blog-posts')
      .send(newBlog)
      .then(function(res) {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.be.a('object');
        expect(res.body).to.include.keys('title', 'content', 'author', 'publishDate');
        expect(res.body.id).to.not.equal(null);
        expect(res.body).to.deep.equal(Object.assign(newBlog, {id: res.body.id}));
      });
  });
  it('should update blog posts on PUT', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function( res) {
        const updatedPost = Object.assign(res.body[0], {
          title: 'c;ldms',
          content: 'slkmvdklw;'
        });
        return chai.request(app)
          .put(`/blog-posts/${res.body[0].id}`)
          .send(updatedPost)
          .then(function(res) {
            expect(res).to.have.status(204);
          });
      });
  });
  it('should delete blog-post on DELETE', function() {
    return chai.request(app)
      .get('/blog-posts')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blog-posts/${res.body[0].id}`);
      })
      .then(function(res) {
        expect(res).to.have.status(204);
      });
  });
});
