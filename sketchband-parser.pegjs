{
  function header(text) {
    return { type: "header", text: text }
  }

  function bars(bs) {
    return { type: "bars", bars: bs }
  }

  function bar(cs, ws) {
    return { type: "bar", chords: cs, words: ws }
  }

  function chord(root, mods, bass) {
    return { type: "chord", root: root, mods: mods, bass: bass || null }
  }
}

start = segments

segments = segment+

segment
  = h:header { return header(h) }
  / bs:bars { return bars(bs) }

header
  = '#' _ l:lineOfText { return l }

bars = bar+

bar = cs:chords _ '|' _ ws:lineOfText [\n$]? { return bar(cs, ws) }

lineOfText = [^\n]* { return text() }

chords
 = a:chord __ b:chords { return [a].concat(b) }
 / a:chord { return [a] }

chord
  = n:note m:chordModifiers '/' b:note { return chord(n, m, b) }
  / n:note m:chordModifiers { return chord(n, m) }

chordModifiers
  = [^\/ ]* { return text() }

note
  = noteLetter noteModifier { return text() }
  / noteLetter { return text() }

noteLetter
  = 'A' / 'B' / 'C' / 'D' / 'E' / 'F' / 'G'

noteModifier
  = [#b]

_  = [ \t\r\n]*

__ = [ \t\r\n]+
