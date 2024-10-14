import {
  CircleContribution as CircleContributionEvent,
  CircleCreated as CircleCreatedEvent,
  CircleFundRedeemed as CircleFundRedeemedEvent,
  CircleKilled as CircleKilledEvent,
  CircleKilled1 as CircleKilled1Event,
  CircleRedeemed as CircleRedeemedEvent,
  RepaymentFailed as RepaymentFailedEvent,
  RepaymentSuccessful as RepaymentSuccessfulEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent
} from "../generated/QQuestP2PCircle/QQuestP2PCircle"
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
} from "../generated/schema"

export function handleCircleContribution(event: CircleContributionEvent): void {
  let entity = new CircleContribution(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.contributor = event.params.contributor
  entity.contributionAmount = event.params.contributionAmount
  entity.contributionId = event.params.contributionId
  entity.isUSDC = event.params.isUSDC
  entity.circleId = event.params.circleId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCircleCreated(event: CircleCreatedEvent): void {
  let entity = new CircleCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.circleId = event.params.circleId
  entity.isUSDC = event.params.isUSDC
  entity.goalValueToRaise = event.params.goalValueToRaise
  entity.leadDurations = event.params.leadDurations
  entity.dueDuration = event.params.dueDuration
  entity.builderScore = event.params.builderScore

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCircleFundRedeemed(event: CircleFundRedeemedEvent): void {
  let entity = new CircleFundRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.redemptionAmount = event.params.redemptionAmount
  entity.circleId = event.params.circleId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCircleKilled(event: CircleKilledEvent): void {
  let entity = new CircleKilled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.circleRaisedAmount = event.params.circleRaisedAmount
  entity.circleId = event.params.circleId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCircleKilled1(event: CircleKilled1Event): void {
  let entity = new CircleKilled1(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.circleId = event.params.circleId
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleCircleRedeemed(event: CircleRedeemedEvent): void {
  let entity = new CircleRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.circleId = event.params.circleId
  entity.amountRaised = event.params.amountRaised
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRepaymentFailed(event: RepaymentFailedEvent): void {
  let entity = new RepaymentFailed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.paymentFailureCount = event.params.paymentFailureCount
  entity.circleId = event.params.circleId
  entity.timeStamp = event.params.timeStamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRepaymentSuccessful(
  event: RepaymentSuccessfulEvent
): void {
  let entity = new RepaymentSuccessful(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.creator = event.params.creator
  entity.circleId = event.params.circleId
  entity.paybackAmount = event.params.paybackAmount
  entity.timestamp = event.params.timestamp

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.previousAdminRole = event.params.previousAdminRole
  entity.newAdminRole = event.params.newAdminRole

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.role = event.params.role
  entity.account = event.params.account
  entity.sender = event.params.sender

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
