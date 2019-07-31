const html = require('choo/html')
const Layout = require('../../elements/layout')
const Releases = require('../../components/releases')

module.exports = Layout(view)

function view (state, emit) {
  return html`
    <div class="flex flex-column w-100 mh3 mh0-ns">
      ${state.cache(Releases, 'releases').render({ items: state.releases.items })}
    </div>
  `
}