const Component = require('choo/component')
const html = require('choo/html')
const clone = require('shallow-clone')
const nanostate = require('nanostate')
const nanologger = require('nanologger')
const Loader = require('./play-count')
const compare = require('nanocomponent/compare')
const Pagination = require('@resonate/pagination')

class Artworks extends Component {
  constructor (id, state, emit) {
    super(id)

    this.id = id
    this.local = state.components[id] = {}
    this.state = state
    this.emit = emit

    this.items = []

    this.renderArtworks = this.renderArtworks.bind(this)
    this.renderError = this.renderError.bind(this)
    this.renderPlaceholder = this.renderPlaceholder.bind(this)

    this.log = nanologger(id)

    this.local.machine = nanostate('idle', {
      idle: { start: 'loading', resolve: 'data' },
      loading: { resolve: 'idle', reject: 'error' },
      error: { start: 'idle' }
    })

    this.local.machine.event('notFound', nanostate('notFound', {
      notFound: { start: 'idle' }
    }))

    this.local.loader = nanostate.parallel({
      loader: nanostate('off', {
        on: { toggle: 'off' },
        off: { toggle: 'on' }
      })
    })

    this.local.loader.on('loader:toggle', () => {
      this.log.info('loader:toggle', this.local.loader.state.loader)
      if (this.element) this.rerender()
    })

    this.local.machine.on('notFound', () => {
      this.log.info('notFound')
      if (this.element) this.rerender()
    })

    this.local.machine.on('loading', () => {
      this.log.info('loading')
    })

    this.local.machine.on('error', () => {
      this.log.error('error')
      if (this.element) this.rerender()
    })

    this.local.machine.on('data', () => {
      this.log.info('data')
      if (this.element) this.rerender()
    })
  }

  createElement (props) {
    const self = this

    const { items = [], numberOfPages = 1, pagination: paginationEnabled = true } = props

    this.items = clone(items)

    const albums = {
      loading: {
        on: this.renderLoader,
        off: () => void 0
      }[this.local.loader.state.loader](),
      notFound: this.renderPlaceholder(),
      error: this.renderError()
    }[this.local.machine.state] || this.renderArtworks()

    let paginationEl

    if (paginationEnabled) {
      paginationEl = new Pagination(this.id + '-pagination', this.state, this.emit).render({
        navigate: function (pageNumber) {
          const path = !/albums/.test(this.state.href) ? '/albums' : ''
          self.emit(self.state.events.PUSHSTATE, self.state.href + `${path}?page=${pageNumber}`)
        },
        path: !/albums/.test(this.state.href) ? '/albums' : '',
        numberOfPages
      })
    }

    return html`
      <div class="flex flex-column flex-auto w-100">
        ${albums}
        ${paginationEl}
      </div>
    `
  }

  renderError () {
    return html`
      <div class="flex flex-column flex-auto w-100 items-center justify-center">
        <p>😱 Failed to fetch albums</p>
        <div>
          <button class="grow dim" onclick=${() => {
    this.emit('labels:reload', this.state.params.id)
  }}>Try again</button>
        </div>
      </div>
    `
  }

  renderPlaceholder () {
    return html`
      <div class="flex flex-column flex-auto w-100 items-center justify-center">
        <p class="tc">This label has no albums yet</p>
      </div>
    `
  }

  renderLoader () {
    const loader = new Loader().render({
      name: 'loader',
      count: 3,
      options: { animate: true, repeat: true, reach: 9, fps: 10 }
    })

    return html`
      <div class="flex flex-column flex-auto items-center justify-center" style="min-height:100vh;">
        ${loader}
      </div>
    `
  }

  renderArtworks () {
    const artworkItem = (artwork, index) => {
      const { uuid, url } = artwork

      return html`
        <div class="fl w-100 w-50-l pa2">
          <a href="/artworks/${uuid}" class="db link dim">
            <img src=${url} alt="artwork" class="w-100 db outline black-10"/>
          </a>
        </div>
      `
    }

    return html`
      <article>
        <h2 class="f3 fw4 pa3 mv0">Artworks</h2>
        <div class="cf pa2">
          ${this.items.map(artworkItem)}
        </div>
      </article>
    `
  }

  update (props) {
    return compare(this.items, props.items)
  }
}

module.exports = Artworks