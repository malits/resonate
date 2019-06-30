const Layout = require('./elements/layout')
const lazy = require('choo-lazy-view')

module.exports = (app) => {
  app.route('/', Layout(require('./views/dashboard')))
  app.route('/playlist/:type', Layout(require('./views/playlist')))
  app.route('/artists', lazy(() => import('./views/artists/list')))
  app.route('/artists/:uid', lazy(() => import('./views/artists/show')))
  app.route('/artists/:uid/albums', Layout(require('./views/artists/albums')))
  app.route('/artists/:uid/tracks', Layout(require('./views/artists/tracks')))
  app.route('/labels', lazy(() => import('./views/labels/list')))
  app.route('/labels/:uid', lazy(() => import('./views/labels/show')))
  app.route('/labels/:uid/albums', Layout(require('./views/labels/albums')))
  app.route('/labels/:uid/artists', Layout(require('./views/labels/artists')))
  app.route('/tracks/:id', Layout(require('./views/tracks/show')))
  app.route('/login', Layout(require('./views/login')))
  app.route('/search/:q', Layout(require('./views/search')))
  app.route('/search/:q/:tab', Layout(require('./views/search')))
  app.route('/account', Layout(require('./views/profile/show')))
  app.route('/library/:type', Layout(require('./views/playlist')))
  app.route('/:user/library/:type', Layout(require('./views/playlist')))
  app.route('/:user', Layout(require('./views/placeholder')))
  app.route('/:user/*', Layout(require('./views/404')))
}
