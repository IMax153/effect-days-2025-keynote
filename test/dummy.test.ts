import { describe, expect, it } from "@effect/vitest"
import { Effect } from "effect"

describe("Dummy", () => {
  it.effect(
    "should work",
    Effect.fnUntraced(function*() {
      expect.anything()
    })
  )
})
