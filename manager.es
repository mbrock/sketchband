/*
 * This file is part of SketchBand.
 * Copyright (C) 2016  Mikael Brockman
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

import * as React from "react"
var PouchDB = require("pouchdb")

var { parse } = require("./tab.es")
var { Song } = require("./sheet.es")

let defaultContext = {
  beatsPerBar: 4,
  bpm: 100,
}

export let Manager = React.createClass({
  getInitialState: function() {
    return {
      song: this.props.songs.length > 0 ? this.props.songs[0] : null,
      syncUrl: localStorage.getItem("sync-url"),
      editing: false,
    }
  },

  componentWillReceiveProps: function(next) {
    if (next.hash.match(/^#(.+)$/)) {
      let id = next.hash.substr(1)
      if (this.state.song == null || this.state.song._id !== id) {
        this.setState({ song: next.songs.filter(x => x._id === id)[0] })
      } else if (this.state.song && next.songs) {
        this.setState({ song: next.songs.filter(x => x._id == this.state.song._id)[0] })
      }
    }
  },

  componentWillUpdate: function(next) {
    let noSongChosen     = next.hash == ""
    let hasSongs         = next.songs.length > 0
    let chosenSongExists = next.songs.map(x => x._id).includes(next.hash.substr(1))
    if (hasSongs && (noSongChosen || !chosenSongExists)) {
      location.hash = next.songs[0]._id
    }
  },

  render: function() {
    let sync = (
      <button
        className={this.props.syncUrl ? "pressed" : null}
        onClick={this.startSyncing}
      >Sync</button>
    )

    let select = this.state.song ? (
      <select
        className="toolbar-song-picker"
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
      <button onClick={this.newSong}>
        New
      </button>
    )

    let rename = (
      this.state.song
        ? <button onClick={this.rename}>Rename</button>
        : null
    )
    
    let remove = (
      this.state.song
        ? <button onClick={this.remove}>Remove</button>
        : null
    )

    let toggleEdit = this.state.song ? (
      <button
        onClick={this.toggleEdit}
        className={this.state.editing ? "pressed" : null}
      >
        Edit
      </button>
    ) : null

    let songEditor = (
      this.state.song
        ? this.renderSongEditor()
        : null
    )

    return (
      <div className="manager">
        <div className="manager-toolbar">
          { select }
          <div className="toolbar-buttons">
            { toggleEdit }
            { rename }
            { remove }
            { newSong }
            { sync }
          </div>
        </div>
        { songEditor }
      </div>
    )
  },

  renderSongEditor: function() {
    let song = this.state.song
    let textarea = this.state.editing ? (
      <textarea
        className="song-editor-content-text"
        value={song.content}
        onChange={this.changeContent}
        onBlur={this.save}
      />
    ) : null
    return (
      <div className="song-editor">
        <div className="song-editor-content">
          { textarea }
          <Song context={defaultContext} t={0} {...parse(song.content)} />
        </div>
      </div>
    )
  },

  startSyncing: function() {
    let syncUrl = prompt("Enter sync URL")
    this.setState({ syncUrl })
    if (syncUrl !== localStorage.getItem("sync-url")) {
      localStorage.setItem("sync-url", syncUrl)
      PouchDB.sync("sketch.band", syncUrl, { live: true })
    }
  },

  toggleEdit: function() {
    this.setState({ editing: !this.state.editing })
  },

  newSong: function() {
    console.log("Posting")
    let author = prompt("Author")
    if (!author) return
    let title = prompt("Title")
    if (!title) return
    this.props.db.post({
      title: title,
      author: author,
      format: "bar-lines-v1",
      content: ""
    }).then(function(doc) {
      location.hash = doc.id
    })
  },

  rename: function() {
    let author = prompt("Author")
    if (!author) return
    let title = prompt("Title")
    if (!title) return
    this.setState({
      song: { ...this.state.song, author, title }
    }, this.save)
  },

  remove: function() {
    if (confirm("Remove?")) {
      this.setState({
        song: { ...this.state.song, _deleted: true }
      }, this.save)
    }
  },

  save: function() {
    console.log("Saving")
    this.props.db.put(this.state.song)
  },

  changeSelectedSong: function(event) {
    location.hash = `#${event.target.value}`
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

