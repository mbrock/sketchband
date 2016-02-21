let color = require("color")

export let lessOpaque = (x, n) => color(x).clearer(n).hslString()

export const backgroundColor = "#fcfcfc"
export const inactiveBarColor = "white"
export const activeBarColor = "#ddd"
export const headerColor = "#333"
export const lyricColor = headerColor
export const chordBackgroundColor = "#ccc"
export const chordColor = "#333"

