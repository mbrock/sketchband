let inspect = x => require("util-inspect")(x, {
  depth: 20,
  colors: true
})

export let test = f => f({
  is: (x, y) => require("assert").deepEqual(x, y,
    `\n\nWanted: ${inspect(y)},\nActual: ${inspect(x)}\n`),
  ok: require("assert").assert
})
