var {
  makeBarSequence, makeBar, makeHarmony, makeLyric, makeChord,
  makeRecording, makeSong
} = require("./types.es")

let { test } = require("./test.es")

export let parse =
  text => makeSong({
    barSequences: parseSong(text.split(/\n/).filter(x => x.trim().length))
  })

let parseSong = lines => {
  var barSequences = []
  var current = makeBarSequence({ name: "Fragment", bars: [] })
  for (var i = 0; i < lines.length; i++) {
    if (/^# (.*)\s*$/.test(lines[i])) {
      if (i == 0)
        current.barSequence.name = RegExp.$1
      else {
        barSequences.push(current)
        current = makeBarSequence({ name: RegExp.$1, bars: [] })
      }
    } else {
      current.barSequence.bars.push(parseLine(lines[i]))
    }
  }
  barSequences.push(current)
  return barSequences
}

let parseLine = line => {
  if (/^([^|]+)(?:\| (.*))?$/.test(line)) {
    let [harmony, lyric] = [RegExp.$1, RegExp.$2]
    return makeBar({
      voices: [
        parseHarmony(harmony),
        ...(lyric ? [makeLyric({ text: lyric })] : []),
        makeRecording({}),
      ]
    })
  }
}

let parseHarmony =
  s => makeHarmony({
    chords: s.trim().split(" ").map(name => makeChord({ name }))
  })

test(({ is, ok }) => {
  is(parseLine("C Em | hello"), makeBar({
    voices: [
      makeHarmony({
        chords: [
          makeChord({ name: "C" }),
          makeChord({ name: "Em" }),
        ],
      }),
      makeLyric({ text: "hello" }),
      makeRecording({ }),
    ]
  }))

  let simpleBar = chordName => makeBar({
    voices: [
      makeHarmony({
        chords: [makeChord({ name: chordName })]
      }),
      makeRecording({}),
    ]
  })

  is(parseLine("C"), simpleBar("C"))

  is(parse("C"), makeSong({
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

  is(parse("# verse\nC\n# chorus\n G"), makeSong({
    barSequences: [
      simpleBarSequence("verse", "C"),
      simpleBarSequence("chorus", "G")
    ]
  }))
})