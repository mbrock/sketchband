export let makePlayChord = ({ chord, delay }) =>
  ({ play: { chord, delay } })
export let makeSchedule = ({ events }) =>
  ({ schedule: { events } })
export let makeChord = ({ name }) =>
  ({ chord: { name } })
export let makeHarmony = ({ chords }) =>
  ({ harmony: { chords } })
export let makeLyric = ({ text }) =>
  ({ lyric: { text } })
export let makeRecording = ({ }) =>
  ({ recording: true })
export let makeBar = ({ voices }) =>
  ({ bar: { voices } })
export let makeBarSequence = ({ name, bars }) =>
  ({ barSequence: { name, bars } })
export let makeSong = ({ barSequences }) =>
  ({ song: { barSequences } })