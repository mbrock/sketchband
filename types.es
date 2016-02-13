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