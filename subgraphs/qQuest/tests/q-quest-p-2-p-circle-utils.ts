import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CircleContribution,
  CircleCreated,
  CircleFundRedeemed,
  CircleKilled,
  CircleKilled1,
  CircleRedeemed,
  RepaymentFailed,
  RepaymentSuccessful,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked
} from "../generated/QQuestP2PCircle/QQuestP2PCircle"

export function createCircleContributionEvent(
  contributor: Address,
  contributionAmount: BigInt,
  contributionId: Bytes,
  isUSDC: boolean,
  circleId: Bytes
): CircleContribution {
  let circleContributionEvent = changetype<CircleContribution>(newMockEvent())

  circleContributionEvent.parameters = new Array()

  circleContributionEvent.parameters.push(
    new ethereum.EventParam(
      "contributor",
      ethereum.Value.fromAddress(contributor)
    )
  )
  circleContributionEvent.parameters.push(
    new ethereum.EventParam(
      "contributionAmount",
      ethereum.Value.fromSignedBigInt(contributionAmount)
    )
  )
  circleContributionEvent.parameters.push(
    new ethereum.EventParam(
      "contributionId",
      ethereum.Value.fromFixedBytes(contributionId)
    )
  )
  circleContributionEvent.parameters.push(
    new ethereum.EventParam("isUSDC", ethereum.Value.fromBoolean(isUSDC))
  )
  circleContributionEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )

  return circleContributionEvent
}

export function createCircleCreatedEvent(
  creator: Address,
  circleId: Bytes,
  isUSDC: boolean,
  goalValueToRaise: BigInt,
  leadDurations: BigInt,
  dueDuration: BigInt,
  builderScore: i32
): CircleCreated {
  let circleCreatedEvent = changetype<CircleCreated>(newMockEvent())

  circleCreatedEvent.parameters = new Array()

  circleCreatedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  circleCreatedEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  circleCreatedEvent.parameters.push(
    new ethereum.EventParam("isUSDC", ethereum.Value.fromBoolean(isUSDC))
  )
  circleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "goalValueToRaise",
      ethereum.Value.fromUnsignedBigInt(goalValueToRaise)
    )
  )
  circleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "leadDurations",
      ethereum.Value.fromUnsignedBigInt(leadDurations)
    )
  )
  circleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "dueDuration",
      ethereum.Value.fromUnsignedBigInt(dueDuration)
    )
  )
  circleCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "builderScore",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(builderScore))
    )
  )

  return circleCreatedEvent
}

export function createCircleFundRedeemedEvent(
  creator: Address,
  redemptionAmount: BigInt,
  circleId: Bytes
): CircleFundRedeemed {
  let circleFundRedeemedEvent = changetype<CircleFundRedeemed>(newMockEvent())

  circleFundRedeemedEvent.parameters = new Array()

  circleFundRedeemedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  circleFundRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "redemptionAmount",
      ethereum.Value.fromUnsignedBigInt(redemptionAmount)
    )
  )
  circleFundRedeemedEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )

  return circleFundRedeemedEvent
}

export function createCircleKilledEvent(
  creator: Address,
  circleRaisedAmount: BigInt,
  circleId: Bytes
): CircleKilled {
  let circleKilledEvent = changetype<CircleKilled>(newMockEvent())

  circleKilledEvent.parameters = new Array()

  circleKilledEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  circleKilledEvent.parameters.push(
    new ethereum.EventParam(
      "circleRaisedAmount",
      ethereum.Value.fromUnsignedBigInt(circleRaisedAmount)
    )
  )
  circleKilledEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )

  return circleKilledEvent
}

export function createCircleKilled1Event(
  creator: Address,
  circleId: Bytes,
  timestamp: BigInt
): CircleKilled1 {
  let circleKilled1Event = changetype<CircleKilled1>(newMockEvent())

  circleKilled1Event.parameters = new Array()

  circleKilled1Event.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  circleKilled1Event.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  circleKilled1Event.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return circleKilled1Event
}

export function createCircleRedeemedEvent(
  creator: Address,
  circleId: Bytes,
  amountRaised: BigInt,
  timestamp: BigInt
): CircleRedeemed {
  let circleRedeemedEvent = changetype<CircleRedeemed>(newMockEvent())

  circleRedeemedEvent.parameters = new Array()

  circleRedeemedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  circleRedeemedEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  circleRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "amountRaised",
      ethereum.Value.fromUnsignedBigInt(amountRaised)
    )
  )
  circleRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return circleRedeemedEvent
}

export function createRepaymentFailedEvent(
  creator: Address,
  paymentFailureCount: i32,
  circleId: Bytes,
  timeStamp: BigInt
): RepaymentFailed {
  let repaymentFailedEvent = changetype<RepaymentFailed>(newMockEvent())

  repaymentFailedEvent.parameters = new Array()

  repaymentFailedEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  repaymentFailedEvent.parameters.push(
    new ethereum.EventParam(
      "paymentFailureCount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(paymentFailureCount))
    )
  )
  repaymentFailedEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  repaymentFailedEvent.parameters.push(
    new ethereum.EventParam(
      "timeStamp",
      ethereum.Value.fromUnsignedBigInt(timeStamp)
    )
  )

  return repaymentFailedEvent
}

export function createRepaymentSuccessfulEvent(
  creator: Address,
  circleId: Bytes,
  paybackAmount: BigInt,
  timestamp: BigInt
): RepaymentSuccessful {
  let repaymentSuccessfulEvent = changetype<RepaymentSuccessful>(newMockEvent())

  repaymentSuccessfulEvent.parameters = new Array()

  repaymentSuccessfulEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  repaymentSuccessfulEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  repaymentSuccessfulEvent.parameters.push(
    new ethereum.EventParam(
      "paybackAmount",
      ethereum.Value.fromUnsignedBigInt(paybackAmount)
    )
  )
  repaymentSuccessfulEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return repaymentSuccessfulEvent
}

export function createRoleAdminChangedEvent(
  role: Bytes,
  previousAdminRole: Bytes,
  newAdminRole: Bytes
): RoleAdminChanged {
  let roleAdminChangedEvent = changetype<RoleAdminChanged>(newMockEvent())

  roleAdminChangedEvent.parameters = new Array()

  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "previousAdminRole",
      ethereum.Value.fromFixedBytes(previousAdminRole)
    )
  )
  roleAdminChangedEvent.parameters.push(
    new ethereum.EventParam(
      "newAdminRole",
      ethereum.Value.fromFixedBytes(newAdminRole)
    )
  )

  return roleAdminChangedEvent
}

export function createRoleGrantedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleGranted {
  let roleGrantedEvent = changetype<RoleGranted>(newMockEvent())

  roleGrantedEvent.parameters = new Array()

  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleGrantedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleGrantedEvent
}

export function createRoleRevokedEvent(
  role: Bytes,
  account: Address,
  sender: Address
): RoleRevoked {
  let roleRevokedEvent = changetype<RoleRevoked>(newMockEvent())

  roleRevokedEvent.parameters = new Array()

  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("role", ethereum.Value.fromFixedBytes(role))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("account", ethereum.Value.fromAddress(account))
  )
  roleRevokedEvent.parameters.push(
    new ethereum.EventParam("sender", ethereum.Value.fromAddress(sender))
  )

  return roleRevokedEvent
}
