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

var {
  makeBarSequence, makeBar, makeHarmony, makeLyric, makeChord,
  makeRecording, makeSong
} = require("./types.es")

let { test } = require("./test.es")

export let parse =
  (text, transposeSteps) => makeSong({
    barSequences: parseSong(text.split(/\n/).filter(x => x.trim().length), transposeSteps)
  })

export let songLength = ({ song }) => {
  let n = 0
  song.barSequences.forEach(x => n += x.barSequence.bars.length)
  return n
}

let parseSong = (lines, transposeSteps) => {
  var barSequences = []
  var current = makeBarSequence({ name: "Fragment", bars: [] })
  for (var i = 0; i < lines.length; i++) {
    if (/^#\s*(.*)\s*$/.test(lines[i])) {
      if (i == 0)
        current.barSequence.name = RegExp.$1
      else {
        barSequences.push(current)
        current = makeBarSequence({ name: RegExp.$1, bars: [] })
      }
    } else {
      current.barSequence.bars.push(parseLine(lines[i], transposeSteps))
    }
  }
  barSequences.push(current)
  return barSequences
}

let parseLine = (line, transposeSteps) => {
  if (/^([^|]+)(?:\|(.*))?$/.test(line)) {
    let [harmony, lyric] = [RegExp.$1, RegExp.$2.trim()]
    return makeBar({
      voices: [
        parseHarmony(harmony, transposeSteps),
        ...(lyric ? [makeLyric({ text: lyric })] : [])
      ]
    })
  }
}

let parseHarmony =
  (s, transposeSteps) => makeHarmony({
    chords: s.trim().split(" ").map(name => parseChord(name, transposeSteps))
  })

let parseChord =
  ((name, t) => {
    let rootNote = readNote(name)
    let slashPosition = name.indexOf('/')

    if (slashPosition === -1) {
      return makeChord({
        name: transposeNote(rootNote, t) + name.substring(rootNote.length)
      })
    }
    else
    {
      let modLength = slashPosition - rootNote.length
      let modifiers = name.substring(rootNote.length, slashPosition)
      let bassNote = readNote(name.substring(slashPosition + 1))

      return makeChord({
        name: transposeNote(rootNote, t) + modifiers + '/' +
          transposeNote(bassNote, t)
      })
    }
  })

let noteRing = [
  ['C',  'C'],
  ['C#', 'Db'],
  ['D',  'D'],
  ['D#', 'Eb'],
  ['E',  'E'],
  ['F',  'F'],
  ['F#', 'Gb'],
  ['G',  'G'],
  ['G#', 'Ab'],
  ['A',  'A'],
  ['A#', 'Bb'],
  ['B',  'B']
]

let loopedModulo = (value, divisor) => {
  let n = value % divisor
  return n < 0 ? (divisor + n) : n
}

let getNote = o => noteRing[loopedModulo(o, noteRing.length)]
let getSharp = o => getNote(o)[0]
let getFlat = o => getNote(o)[1]

let transposeNote = ((note, t) => {
  for (var i = 0; i < noteRing.length; ++i) {
    if (noteRing[i][0] === note) {
      return getSharp(i + t);
    } else if (noteRing[i][1] === note) {
      return getFlat(i + t);
    }
  }

  return name;
})

let readNote = (t => {
  if (t.length < 2) {
    return t.toUpperCase()
  }

  if (t[1] === 'b' || t[1] === '#') {
    return t[0].toUpperCase() + t[1]
  }

  return t[0].toUpperCase()
})

test(({ is, ok }) => {
  is(readNote("D"), "D")
  is(readNote("Db"), "Db")
  is(readNote("D#sus"), "D#")
  is(readNote("Dsus"), "D")
  is(readNote("d"), "D")
  is(readNote("db"), "Db")
  is(transposeNote("C", 0), "C")
  is(transposeNote("C", 1), "C#")
  is(transposeNote("Db", 2), "Eb")
  is(transposeNote("C#", 2), "D#")
  is(parseChord("Dsus", 0), makeChord({ name: "Dsus" }))
  is(parseChord("D#sus", 0), makeChord({ name: "D#sus" }))
  is(parseChord("Dm/F#", 1), makeChord({ name: "D#m/G" }))
  is(parseChord("Dsus/F", 0), makeChord({ name: "Dsus/F" }))

  is(parseLine("C Em | hello", 0), makeBar({
    voices: [
      makeHarmony({
        chords: [
          makeChord({ name: "C" }),
          makeChord({ name: "Em" }),
        ],
      }),
      makeLyric({ text: "hello" }),
    ]
  }))

  let simpleBar = chordName => makeBar({
    voices: [
      makeHarmony({
        chords: [makeChord({ name: chordName })]
      }),
    ]
  })

  is(parseLine("C", 0), simpleBar("C"))

  is(parse("C", 0), makeSong({
    barSequences: [
      makeBarSequence({
        name: "Fragment",
        bars: [simpleBar("C")]
      })
    ]
  }))

  let simpleBarSequence =
    (name, chord) => makeBarSequence({
      name,
      bars: [simpleBar(chord)]
    })

  is(parse("# verse\nC\n# chorus\n G", 0), makeSong({
    barSequences: [
      simpleBarSequence("verse", "C"),
      simpleBarSequence("chorus", "G")
    ]
  }))
})