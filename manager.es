import * as React from "react"

export let Manager = React.createClass({
  getInitialState: function() {
    return {
      song: this.props.songs.length > 0 ? this.props.songs[0] : null
    }
  },

  componentWillReceiveProps: function(next) {
    if (this.state.song == null && next.songs.length > 0) {
      this.setState({ song: next.songs[0] })
    }
  },

  render: function() {
    let select = this.state.song ? (
      <select value={this.state.song._id} onChange={this.changeSelectedSong}
      >{
        this.props.songs.map(x =>
          <option key={x._id} value={x._id}>
            {`${x.author} - ${x.title}`}
          </option>
        )
      }</select>
    ) : null

    let newSong = (
      <button style={{ marginLeft: "1rem" }} onClick={this.newSong}>
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
        <input value={song.title} onChange={this.changeTitle} onBlur={this.save} />
        <input value={song.author} onChange={this.changeAuthor} onBlur={this.save} />
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

