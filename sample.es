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

let fetchBinary = async url => (await fetch(url)).arrayBuffer()

let fetchAudio = async (audioContext, url) => {
  let buffer = await fetchBinary(url)
  return new Promise((resolve, reject) =>
    audioContext.decodeAudioData(buffer, resolve, reject))
}

let fetchSamples = async (audioContext, names) => {
  let fetched = {}
  await* names.map(async name => {
    fetched[name] = await fetchAudio(audioContext,
      `samples/${encodeURIComponent(name)}.wav`)
  })
  return fetched
}

const allChordNames =
  ("A A# B C C# D D# E F F# G G# " +
   "Am A#m Bm Cm C#m Dm D#m Em Fm F#m G G#m").split(" ")

export let fetchChordSamples = audioContext =>
  fetchSamples(audioContext, allChordNames)
