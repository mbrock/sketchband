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
