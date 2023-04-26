import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts"
import { ABIChanged } from "../generated/schema"
import { ABIChanged as ABIChangedEvent } from "../generated/L2PublicResolver/L2PublicResolver"
import { handleABIChanged } from "../src/l-2-public-resolver"
import { createABIChangedEvent } from "./l-2-public-resolver-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let node = Bytes.fromI32(1234567890)
    let contentType = BigInt.fromI32(234)
    let newABIChangedEvent = createABIChangedEvent(node, contentType)
    handleABIChanged(newABIChangedEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ABIChanged created and stored", () => {
    assert.entityCount("ABIChanged", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ABIChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "node",
      "1234567890"
    )
    assert.fieldEquals(
      "ABIChanged",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "contentType",
      "234"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
