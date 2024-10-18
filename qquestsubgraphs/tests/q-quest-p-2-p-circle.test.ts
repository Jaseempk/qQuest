import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import { CircleContribution } from "../generated/schema"
import { CircleContribution as CircleContributionEvent } from "../generated/QQuestP2PCircle/QQuestP2PCircle"
import { handleCircleContribution } from "../src/q-quest-p-2-p-circle"
import { createCircleContributionEvent } from "./q-quest-p-2-p-circle-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let contributor = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let contributionAmount = BigInt.fromI32(234)
    let contributionId = Bytes.fromI32(1234567890)
    let isUSDC = "boolean Not implemented"
    let circleId = Bytes.fromI32(1234567890)
    let newCircleContributionEvent = createCircleContributionEvent(
      contributor,
      contributionAmount,
      contributionId,
      isUSDC,
      circleId
    )
    handleCircleContribution(newCircleContributionEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("CircleContribution created and stored", () => {
    assert.entityCount("CircleContribution", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "CircleContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "contributor",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "CircleContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "contributionAmount",
      "234"
    )
    assert.fieldEquals(
      "CircleContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "contributionId",
      "1234567890"
    )
    assert.fieldEquals(
      "CircleContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "isUSDC",
      "boolean Not implemented"
    )
    assert.fieldEquals(
      "CircleContribution",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "circleId",
      "1234567890"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
