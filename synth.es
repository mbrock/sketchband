let teoria = require("teoria")
let adsr = require("adsr")

let concat = xss => [].concat.apply([], xss)

let chordLength = 2

let noteNames =
  "a a# b bb c c# d d# e f f# g g#"
let notes =
  noteNames.split(" ").map(x => teoria.note(x))
  
let chordTypes =
  ["", "7", "m", "m7", "m/C", "/C", "/E", "/A", "maj7"]
let chords =
  concat(notes.map(note => chordTypes.map(type => note.chord(type))))

let chordName = x => x.name
let chordNotes = x => x.notes()
let noteFrequency = x => x.fq() * Math.pow(Math.pow(2, 0), 1/12)

let scheduleNote =
  (note, duration) => [{
    type: "audio-event/play-note",
    oscillatorType: "triangle",
    frequency: noteFrequency(note),
    duration: duration,
  }]

let scheduleChord =
  (chord, duration) =>
    concat(chordNotes(chord).map(x => scheduleNote(x, duration)))

let playNote = (
  audioContext, { oscillatorType, frequency, duration }
) => {
  let source = audioContext.createOscillator()
  let gain = audioContext.createGain()
  let envelope = adsr(audioContext)
  let filter = audioContext.createBiquadFilter()

  gain.gain.value = 0
  
  envelope.connect(gain.gain)
  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  filter.type = "lowpass"
  filter.frequency.value = 800
  filter.Q.value = 0.4

  envelope.value.value = 0.2
  envelope.attack = 0.01
  envelope.decay = 1
  envelope.sustain = 0.1
  envelope.release = 1.0

  source.type = oscillatorType
  source.frequency.value = frequency

  let time = audioContext.currentTime
  envelope.start(time)
  source.start(time)
  source.stop(time + duration)
  envelope.stop(time + duration, true)
}

let playEvent = (audioContext, { type, ...x }) => {
  if (type == "audio-event/play-note")
    playNote(audioContext, x)
  else
    throw new Error("impossible")
}

let playSchedule = (audioContext, schedule) => {
  schedule.forEach(x => playEvent(audioContext, x))
}

let makeOfflineAudioContext = (audioContext) =>
  new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(
    2, audioContext.sampleRate * chordLength, audioContext.sampleRate)

let render = audioContext => audioContext.startRendering()

let recordSchedule = (audioContext, schedule) => {
  let offlineAudioContext = makeOfflineAudioContext(audioContext)
  playSchedule(offlineAudioContext, schedule)
  return render(offlineAudioContext)
}

let recordChord = (audioContext, chord, duration) =>
  recordSchedule(audioContext, scheduleChord(chord, duration))

export let synthesizeChords = async (audioContext) => {
  let buffers = {}
  for (var i = 0; i < chords.length; i++)
    buffers[chordName(chords[i])] =
      await recordChord(audioContext, chords[i], chordLength)
  return buffers
}
