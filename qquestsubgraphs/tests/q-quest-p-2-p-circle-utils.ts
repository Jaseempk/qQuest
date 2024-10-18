import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  CircleContribution,
  CircleCreated,
  CircleKilled,
  CircleRedeemed,
  CircleThresholdUpdated,
  RepaymentFailed,
  RepaymentSuccessful,
  RoleAdminChanged,
  RoleGranted,
  RoleRevoked,
  UserBanned,
  UserCollateralUnlocked,
  UserContributionRedeemed,
  UserReputationScoreSlashed,
  UserReputationScoreUpdated
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

export function createCircleKilledEvent(
  creator: Address,
  circleId: Bytes,
  timestamp: BigInt
): CircleKilled {
  let circleKilledEvent = changetype<CircleKilled>(newMockEvent())

  circleKilledEvent.parameters = new Array()

  circleKilledEvent.parameters.push(
    new ethereum.EventParam("creator", ethereum.Value.fromAddress(creator))
  )
  circleKilledEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  circleKilledEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return circleKilledEvent
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

export function createCircleThresholdUpdatedEvent(
  newAllyGoalValueThreshold: BigInt,
  newGuardianGoalValueThreshold: BigInt
): CircleThresholdUpdated {
  let circleThresholdUpdatedEvent = changetype<CircleThresholdUpdated>(
    newMockEvent()
  )

  circleThresholdUpdatedEvent.parameters = new Array()

  circleThresholdUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newAllyGoalValueThreshold",
      ethereum.Value.fromUnsignedBigInt(newAllyGoalValueThreshold)
    )
  )
  circleThresholdUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newGuardianGoalValueThreshold",
      ethereum.Value.fromUnsignedBigInt(newGuardianGoalValueThreshold)
    )
  )

  return circleThresholdUpdatedEvent
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

export function createUserBannedEvent(
  user: Address,
  timestamp: BigInt,
  userFailedRepaymentCount: i32
): UserBanned {
  let userBannedEvent = changetype<UserBanned>(newMockEvent())

  userBannedEvent.parameters = new Array()

  userBannedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userBannedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )
  userBannedEvent.parameters.push(
    new ethereum.EventParam(
      "userFailedRepaymentCount",
      ethereum.Value.fromUnsignedBigInt(
        BigInt.fromI32(userFailedRepaymentCount)
      )
    )
  )

  return userBannedEvent
}

export function createUserCollateralUnlockedEvent(
  user: Address,
  circleId: Bytes,
  amount: BigInt,
  timestamp: BigInt
): UserCollateralUnlocked {
  let userCollateralUnlockedEvent = changetype<UserCollateralUnlocked>(
    newMockEvent()
  )

  userCollateralUnlockedEvent.parameters = new Array()

  userCollateralUnlockedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userCollateralUnlockedEvent.parameters.push(
    new ethereum.EventParam("circleId", ethereum.Value.fromFixedBytes(circleId))
  )
  userCollateralUnlockedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  userCollateralUnlockedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return userCollateralUnlockedEvent
}

export function createUserContributionRedeemedEvent(
  user: Address,
  contributionId: Bytes,
  amount: BigInt,
  timestamp: BigInt
): UserContributionRedeemed {
  let userContributionRedeemedEvent = changetype<UserContributionRedeemed>(
    newMockEvent()
  )

  userContributionRedeemedEvent.parameters = new Array()

  userContributionRedeemedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userContributionRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "contributionId",
      ethereum.Value.fromFixedBytes(contributionId)
    )
  )
  userContributionRedeemedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )
  userContributionRedeemedEvent.parameters.push(
    new ethereum.EventParam(
      "timestamp",
      ethereum.Value.fromUnsignedBigInt(timestamp)
    )
  )

  return userContributionRedeemedEvent
}

export function createUserReputationScoreSlashedEvent(
  user: Address,
  updatedReputationScore: i32
): UserReputationScoreSlashed {
  let userReputationScoreSlashedEvent = changetype<UserReputationScoreSlashed>(
    newMockEvent()
  )

  userReputationScoreSlashedEvent.parameters = new Array()

  userReputationScoreSlashedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userReputationScoreSlashedEvent.parameters.push(
    new ethereum.EventParam(
      "updatedReputationScore",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(updatedReputationScore))
    )
  )

  return userReputationScoreSlashedEvent
}

export function createUserReputationScoreUpdatedEvent(
  user: Address,
  numberOfContributions: i32,
  repaymentCount: i32,
  reputationScore: i32
): UserReputationScoreUpdated {
  let userReputationScoreUpdatedEvent = changetype<UserReputationScoreUpdated>(
    newMockEvent()
  )

  userReputationScoreUpdatedEvent.parameters = new Array()

  userReputationScoreUpdatedEvent.parameters.push(
    new ethereum.EventParam("user", ethereum.Value.fromAddress(user))
  )
  userReputationScoreUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "numberOfContributions",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(numberOfContributions))
    )
  )
  userReputationScoreUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "repaymentCount",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(repaymentCount))
    )
  )
  userReputationScoreUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "reputationScore",
      ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(reputationScore))
    )
  )

  return userReputationScoreUpdatedEvent
}
