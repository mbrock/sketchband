var {
  makePlayChord, makeBarSequence, makeSchedule
} = require("./types.es")

/** Utilities **/

let compact = xs => xs.filter(x => x != null)
let concat = xs => [].concat.apply([], xs)

// Dispatches on a single-key object type
let dispatch = (x, cases) => cases[Object.keys(x)[0]]()


/** Scheduling functions for the song parts **/

// :: (Context, Song) -> Schedule
export let scheduleSong =
  (context, { song }) =>
    stretchSchedule(
      scheduleBarSequence(
        context, concatBarSequences(song.barSequences)),
      60 / context.bpm)

// :: (Context, BarSequence) -> Schedule
let scheduleBarSequence =
  (context, { barSequence }) =>
    scheduleMany(barSequence.bars.map(
      (x, i) => delaySchedule(scheduleBar(context, x),
        i * context.beatsPerBar)))

// :: (Context, Bar) -> Schedule
let scheduleBar =
  (context, { bar }) =>
    scheduleMany(bar.voices.map(
      x => scheduleBarVoice(context, x)))
      
// :: (Context, BarVoice) -> Schedule
let scheduleBarVoice =
  (context, voice) =>
    dispatch(voice, {
      harmony: () => scheduleHarmony(context, voice),
      lyric: () => emptySchedule,
      recording: () => emptySchedule,
    })

// :: (Context, Harmony) -> Schedule
let scheduleHarmony =
  (context, { harmony }) =>
    scheduleMany(subdivideHarmony(harmony.chords))

// :: [Chord] -> Schedule
let subdivideHarmony =
  harmony => ({
    // Obviously bogus stuff that should be dynamic.
    1: [[0, 0], [0, 2]],
    2: [[0, 0], [0, 1], [1, 2], [1, 3]],
  }[harmony.length]).map(
    ([i, j]) => delaySchedule(scheduleChord(harmony[i]), j))

// :: Chord -> Schedule
let scheduleChord =
  ({ chord }) => makeSchedule({
    events: [makePlayChord({ chord, delay: 0 })]
  })


/** General schedule functions */

// :: [Schedule] -> Schedule
let scheduleMany =
  xs => makeSchedule({
    events: compact(concat(xs.map(x => x.schedule.events)))
  })

// :: (Schedule, (Event -> Event)) -> Schedule
let mapSchedule =
  ({ schedule }, f) => makeSchedule({
    events: schedule.events.map(f)
  })

// :: (Schedule, Seconds) -> Schedule
export let delaySchedule =
  (schedule, dt) => mapSchedule(schedule,
    ({ play }) => {
      let { delay, ...x } = play
      return { play: { delay: delay + dt, ...x }}
    })

// :: (Schedule, Factor) -> Schedule
export let stretchSchedule =
  (schedule, k) => mapSchedule(schedule,
    ({ play }) => {
      let { delay, ...x } = play
      return { play: { delay: delay * k, ...x }}
    })

// :: Schedule
let emptySchedule = makeSchedule([])

// :: [BarSequence] -> BarSequence
let concatBarSequences = barSequences =>
  makeBarSequence({
    name: "Irrelevant",
    bars: concat(barSequences.map(x => x.barSequence.bars)),
  })
