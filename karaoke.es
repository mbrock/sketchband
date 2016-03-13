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

import React from "react"

export function makeKaraokeFromAudioElement({
  audioElement,
  explicitBarTimestamps = [],
  barCount
}) {
  let audioContext = new AudioContext
  let sourceNode = audioContext.createMediaElementSource(audioElement)
  sourceNode.connect(audioContext.destination)
  return {
    getSongTimeInSeconds: () => audioElement.currentTime,
    explicitBarTimestamps,
    implicitBarTimestamps: guessBarTimestamps({
      barTimestamps: explicitBarTimestamps,
      barCount
    })
  }
}

export function addExplicitBarTimestamp({
  karaoke,
  barNumber,
  timeInSeconds,
  barCount,
}) {
  let explicitBarTimestamps = [
    ...karaoke.explicitBarTimestamps,
    { barNumber, timeInSeconds }
  ].sort(
    (a, b) => a.timeInSeconds - b.timeInSeconds
  )
  return {
    ...karaoke,
    explicitBarTimestamps,
    implicitBarTimestamps: guessBarTimestamps({
      barTimestamps: explicitBarTimestamps,
      barCount
    })
  }
}

function guessBarTimestamps({ barTimestamps, barCount }) {
  if (barTimestamps.length < 2) {
    return null
  } else {
    return guessBarScheduleForIntro(
      extendBarTimestampsForward(
        { barTimestamps, barCount }
      )
    )
  }
}

function extendBarTimestampsForward({ barTimestamps, barCount }) {
  let currentTempo
  let extendedTimestamps = []
  for (let i = 0; i < barTimestamps.length; i++) {
    let isLastTimestamp = i === barTimestamps.length - 1
    extendedTimestamps.push(barTimestamps[i])
    let estimationPair = (
      isLastTimestamp
        ? [barTimestamps[i - 1], barTimestamps[i]]
        : [barTimestamps[i], barTimestamps[i + 1]]
    )
    let estimatedSecondsPerBar = secondsPerBarForPair(
      estimationPair[0], estimationPair[1]
    )
    for (let j = barTimestamps[i].barNumber + 1;
         j < barCount && (
           isLastTimestamp || barTimestamps[i + 1].barNumber !== j
         );
         j++) {
      let estimatedTime = (
        barTimestamps[i].timeInSeconds +
          estimatedSecondsPerBar * (j - barTimestamps[i].barNumber)
      )
      extendedTimestamps.push({
        barNumber: j,
        timeInSeconds: estimatedTime
      })
    }
  }
  return extendedTimestamps
}

function secondsPerBarForPair(a, b) {
  return (b.timeInSeconds - a.timeInSeconds) / (b.barNumber - a.barNumber)
}

function rangeUpTo(n) {
  return Array.apply(0, Array(n)).map((e, i) => i)
}

function guessBarScheduleForIntro(barTimestamps) {
  if (barTimestamps[0].barNumber === 0) {
    return barTimestamps
  } else {
    let secondsPerBar = secondsPerBarForPair(
      barTimestamps[0], barTimestamps[1]
    )
    return [
      ...(
        rangeUpTo(barTimestamps[0].barNumber - 1).map(
          i => ({
            barNumber: i,
            timeInSeconds: (
              barTimestamps[0].timeInSeconds -
                secondsPerBar * (barTimestamps[0].barNumber - i)
            )
          })
        )
      ),
      ...barTimestamps
    ]
  }
}

console.log(
  JSON.stringify(guessBarScheduleForIntro(extendBarTimestampsForward({
    barTimestamps: [
      { barNumber: 4, timeInSeconds: 4 },
      { barNumber: 6, timeInSeconds: 6 },
    ],
    barCount: 10
  })),
  null, 2)
)

export function guessProgressInFractionalBars({
  barTimestamps,
  timeInSeconds
}) {
  let bts = barTimestamps
  if (bts) {
    for (let i = 0; i < bts.length - 1; i++) {
      if (bts[i + 1].timeInSeconds > timeInSeconds) {
        return bts[i].barNumber + (
          (timeInSeconds - bts[i].timeInSeconds) /
            (bts[i + 1].timeInSeconds - bts[i].timeInSeconds)
        )
      }
    }
  } else {
    return 0
  }
}

export let Karaoke = React.createClass({
  getInitialState() {
    return {
      karaoke: makeKaraokeFromAudioElement({
        audioElement: this.props.audioElement,
        barCount: this.props.barCount
      }),
      t: this.props.audioElement.currentTime
    }
  },

  requestAnotherAnimationFrame() {
    this.animationFrameId = setTimeout(() => {
      this.setState({ t: this.props.audioElement.currentTime })
      this.requestAnotherAnimationFrame()
    }, 50)
  },

  componentDidMount() {
    this.requestAnotherAnimationFrame()
  },

  componentWillUnmount() {
    clearTimeout(this.animationFrameId)
  },

  render() {
    return this.props.renderChild({
      barProgress: guessProgressInFractionalBars({
        timeInSeconds: this.state.t,
        barTimestamps: this.state.karaoke.implicitBarTimestamps
      }),
      addExplicitBarTimestamp: this.addExplicitBarTimestamp
    })
  },

  addExplicitBarTimestamp({ barNumber, barCount }) {
    this.setState({
      karaoke: addExplicitBarTimestamp({
        karaoke: this.state.karaoke,
        timeInSeconds: this.state.t,
        barNumber,
        barCount,
      })
    })
  }
})
