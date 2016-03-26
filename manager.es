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

var { Karaoke, KaraokeAudioElement } = require("./karaoke.es")
var { Song } = require("./sheet.es")
var { parse, songLength } = require("./tab.es")

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

    // XXX: It would be nice to refactor how the toolbar
    // decides which buttons to show...

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

    let audioHash = this.state.song && this.state.song["audio-hash"]
    let audio = (
      audioHash
        ? <KaraokeAudioElement
             src={`https://sketch.band:1967/ipfs/${audioHash}`} />
        : null
    )

    return (
      <div className="manager">
        <div className="manager-toolbar">
          { select }
          { audio }
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

    function renderSong({ barProgress, addExplicitBarTimestamp }) {
      let parsedSong = parse(song.content)
      return (
        <Song
          t={barProgress}
          onClickBar={
            i => {
              addExplicitBarTimestamp({
                barNumber: i,
                barCount: songLength(parsedSong)
              })
            }
          }
          {...parsedSong}
          />
      )
    }

    let sheet = (
      this.refs.audio
        ? <Karaoke
            audioElement={this.refs.audio}
            key={this.refs.audio}
            renderChild={renderSong}
          />
        : renderSong({ barProgress: 0, addExplicitBarTimestamp: null })
    )

    return (
      <div className="song-editor">
        <div className="song-editor-content">
          { textarea }
          { sheet }
        </div>
      </div>
    )
  },

  saveTimestamps: function(timestamps) {
    this.setState({
      song: {
        ...this.state.song,
        timestamps
      }
    }, this.save)
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

