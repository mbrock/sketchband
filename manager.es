import * as React from "react"
var PouchDB = require("pouchdb")

export let Manager = React.createClass({
  getInitialState: function() {
    return {
      song: this.props.songs.length > 0 ? this.props.songs[0] : null,
      syncUrl: localStorage.getItem("sync-url")
    }
  },

  componentWillReceiveProps: function(next) {
    if (this.state.song == null && next.songs.length > 0) {
      this.setState({ song: next.songs[0] })
    } else if (this.state.song && next.songs) {
      this.setState({ song: next.songs.filter(x => x._id == this.state.song._id)[0] })
    }
  },

  render: function() {
    let syncUrl = (
      <input
        style={{
          display: "block",
          marginTop: "1rem",
          width: "20rem",
          font: "inherit"
        }}
        value={this.state.syncUrl}
        placeholder="Sync URL"
        onChange={this.changeSyncUrl}
        onBlur={this.saveSyncUrl}
      />
    )

    let select = this.state.song ? (
      <select
        style={{ font: "inherit" }}
        value={this.state.song._id}
        onChange={this.changeSelectedSong}
      >{
        this.props.songs.map(x =>
          <option key={x._id} value={x._id}>
            {`${x.author} - ${x.title}`}
          </option>
        )
      }</select>
    ) : null

    let newSong = (
      <button
        style={{
          marginLeft: "1rem",
          font: "inherit",
        }}
        onClick={this.newSong}
      >
        New song
      </button>
    )

    let songEditor = (
      this.state.song
        ? this.renderSongEditor()
        : null
    )

    return (
      <div>
        <a style={{ display: "block" }} href="#">Back</a>
        { syncUrl }
        { select }
        { newSong }
        { songEditor }
      </div>
    )
  },

  renderSongEditor: function() {
    let song = this.state.song
    return (
      <div>
        <input
          style={{ font: "inherit" }}
          value={song.title}
          onChange={this.changeTitle}
          onBlur={this.save}
        />
        <input
          style={{ font: "inherit" }}
          value={song.author}
          onChange={this.changeAuthor}
          onBlur={this.save}
        />
        <textarea
          style={{
            display: "block",
            marginTop: "1rem",
            width: "100%",
            fontSize: "inherit",
            fontFamily: "courier",
          }}
          value={song.content}
          rows={20}
          onChange={this.changeContent}
          onBlur={this.save}
        />
      </div>
    )
  },

  changeSyncUrl: function(event) {
    let syncUrl = event.target.value
    this.setState({ syncUrl })
    if (syncUrl !== localStorage.getItem("sync-url")) {
      localStorage.setItem("sync-url", event.target.value)
    }
  },

  saveSyncUrl: function(event) {
    PouchDB.sync("sketch.band", event.target.value, { live: true })
  },

  newSong: function() {
    console.log("Posting")
    this.props.db.post({
      title: "Untitled",
      author: "Unknown",
      format: "bar-lines-v1",
      content: ""
    })
  },

  save: function() {
    console.log("Saving")
    this.props.db.put(this.state.song)
  },

  changeSelectedSong: function(event) {
    this.setState({
      song: this.props.songs.filter(x => x._id == event.target.value)[0]
    })
  },

  changeTitle: function(event) {
    this.setState({
      song: {
        ...this.state.song,
        title: event.target.value
      }
    })
  },

  changeAuthor: function(event) {
    this.setState({
      song: {
        ...this.state.song,
        author: event.target.value
      }
    })
  },

  changeContent: function(event) {
    this.setState({
      song: {
        ...this.state.song,
        content: event.target.value
      }
    })
  },
})

