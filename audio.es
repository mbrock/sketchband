export let audioContext =
  new (window.AudioContext || window.webkitAudioContext)()

export let playSchedule =
  (samples, { schedule }) => schedule.events.forEach(
    ({ play }, i) => {
      let { chord, delay } = play
      playBuffer(samples[chord.name], delay)
    })

let playBuffer = (buffer, delay) => {
  let source = audioContext.createBufferSource()
  source.buffer = buffer
  source.connect(audioContext.destination)
  source.start(audioContext.currentTime + delay)
}
