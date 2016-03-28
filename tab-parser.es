let { parse } = require("./sketchband-parser.pegjs")
let { test } = require("./test.es")

export let parseTab = text => parser.parse(text);

test(({ is, ok }) => {
  let makeParsedChord = (root, mods, bass) => {
    return {
      type: "chord",
      root: root,
      mods: mods,
      bass: bass
    }
  }

  let makeParsedBar = (chords, text) => {
    return {
      type: "bar",
      chords: chords,
      words: text
    }
  }

  let makeParsedBars = bs => {
    return { type: "bars", bars: bs }
  }

  let makeParsedHeader = h => {
    return { type: "header", text: h }
  }

  is(parse("D | Hello"), [
    makeParsedBars([
      makeParsedBar([makeParsedChord("D", "", null)], "Hello")
    ])
  ])
})
