import {
  CircleContribution as CircleContributionEvent,
  CircleCreated as CircleCreatedEvent,
  CircleKilled as CircleKilledEvent,
  CircleRedeemed as CircleRedeemedEvent,
  CircleThresholdUpdated as CircleThresholdUpdatedEvent,
  RepaymentFailed as RepaymentFailedEvent,
  RepaymentSuccessful as RepaymentSuccessfulEvent,
  RoleAdminChanged as RoleAdminChangedEvent,
  RoleGranted as RoleGrantedEvent,
  RoleRevoked as RoleRevokedEvent,
  UserBanned as UserBannedEvent,
  UserCollateralUnlocked as UserCollateralUnlockedEvent,
  UserContributionRedeemed as UserContributionRedeemedEvent,
  UserReputationScoreSlashed as UserReputationScoreSlashedEvent,
  UserReputationScoreUpdated as UserReputationScoreUpdatedEvent,
} from "../generated/QQuestP2PCircle/QQuestP2PCircle";
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
  UserReputationScoreUpdated,
} from "../generated/schema";
/**
 * 

export function handleCircleCreated(event: CircleCreatedEvent): void {
  let entity = new CircleCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
    );
    entity.creator = event.params.creator;
    entity.circleId = event.params.circleId;
    entity.isUSDC = event.params.isUSDC;
    entity.goalValueToRaise = event.params.goalValueToRaise;
    entity.leadDurations = event.params.leadDurations;
    entity.dueDuration = event.params.dueDuration;
    entity.builderScore = event.params.builderScore;
    
    entity.blockNumber = event.block.number;
    entity.blockTimestamp = event.block.timestamp;
    entity.transactionHash = event.transaction.hash;
    
    entity.save();
    
    let circle = new Circle(event.params.circleId);
    circle.creator = event.params.creator;
    circle.circleId = event.params.circleId;
    circle.isUSDC = event.params.isUSDC;
    circle.goalValueToRaise = event.params.goalValueToRaise;
    circle.leadDurations = event.params.leadDurations;
    circle.dueDuration = event.params.dueDuration;
    circle.builderScore = event.params.builderScore;
    circle.contributors = [];
    circle.contributionAmount = [];
    circle.state = 0;
    
    circle.blockNumber = event.block.number;
    circle.blockTimestamp = event.block.timestamp;
    circle.transactionHash = event.transaction.hash;
    
    circle.save();
    }
    export function handleCircleContribution(event: CircleContributionEvent): void {
      let entity = new CircleContribution(
        event.transaction.hash.concatI32(event.logIndex.toI32())
      );
      entity.contributor = event.params.contributor;
      entity.contributionAmount = event.params.contributionAmount;
      entity.contributionId = event.params.contributionId;
      entity.isUSDC = event.params.isUSDC;
      entity.circleId = event.params.circleId;
    
      entity.blockNumber = event.block.number;
      entity.blockTimestamp = event.block.timestamp;
      entity.transactionHash = event.transaction.hash;
    
      entity.save();
    
      let circle = Circle.load(event.params.circleId);
    
      if (circle !== null) {
        let contributors = circle.contributors;
        if (contributors == null) {
          contributors = [];
        }
    
        let contributionAmounts = circle.contributionAmount;
        if (contributionAmounts == null) {
          contributionAmounts = [];
        }
    
        contributors.push(event.params.contributor);
        contributionAmounts.push(event.params.contributionAmount);
    
        circle.contributors = contributors;
        circle.contributionAmount = contributionAmounts;
    
        circle.blockNumber = event.block.number;
        circle.blockTimestamp = event.block.timestamp;
        circle.transactionHash = event.transaction.hash;
    
        circle.save();
      }
    }
 */

export function handleCircleContribution(event: CircleContributionEvent): void {
  let entity = new CircleContribution(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.contributor = event.params.contributor;
  entity.contributionAmount = event.params.contributionAmount;
  entity.contributionId = event.params.contributionId;
  entity.isUSDC = event.params.isUSDC;
  entity.circleId = event.params.circleId;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCircleCreated(event: CircleCreatedEvent): void {
  let entity = new CircleCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.creator = event.params.creator;
  entity.circleId = event.params.circleId;
  entity.isUSDC = event.params.isUSDC;
  entity.goalValueToRaise = event.params.goalValueToRaise;
  entity.leadDurations = event.params.leadDurations;
  entity.dueDuration = event.params.dueDuration;
  entity.builderScore = event.params.builderScore;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCircleKilled(event: CircleKilledEvent): void {
  let entity = new CircleKilled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.creator = event.params.creator;
  entity.circleId = event.params.circleId;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCircleRedeemed(event: CircleRedeemedEvent): void {
  let entity = new CircleRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.creator = event.params.creator;
  entity.circleId = event.params.circleId;
  entity.amountRaised = event.params.amountRaised;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleCircleThresholdUpdated(
  event: CircleThresholdUpdatedEvent
): void {
  let entity = new CircleThresholdUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.newAllyGoalValueThreshold = event.params.newAllyGoalValueThreshold;
  entity.newGuardianGoalValueThreshold =
    event.params.newGuardianGoalValueThreshold;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRepaymentFailed(event: RepaymentFailedEvent): void {
  let entity = new RepaymentFailed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.creator = event.params.creator;
  entity.paymentFailureCount = event.params.paymentFailureCount;
  entity.circleId = event.params.circleId;
  entity.timeStamp = event.params.timeStamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRepaymentSuccessful(
  event: RepaymentSuccessfulEvent
): void {
  let entity = new RepaymentSuccessful(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.creator = event.params.creator;
  entity.circleId = event.params.circleId;
  entity.paybackAmount = event.params.paybackAmount;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleAdminChanged(event: RoleAdminChangedEvent): void {
  let entity = new RoleAdminChanged(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.role = event.params.role;
  entity.previousAdminRole = event.params.previousAdminRole;
  entity.newAdminRole = event.params.newAdminRole;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleGranted(event: RoleGrantedEvent): void {
  let entity = new RoleGranted(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleRoleRevoked(event: RoleRevokedEvent): void {
  let entity = new RoleRevoked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.role = event.params.role;
  entity.account = event.params.account;
  entity.sender = event.params.sender;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleUserBanned(event: UserBannedEvent): void {
  let entity = new UserBanned(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.timestamp = event.params.timestamp;
  entity.userFailedRepaymentCount = event.params.userFailedRepaymentCount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleUserCollateralUnlocked(
  event: UserCollateralUnlockedEvent
): void {
  let entity = new UserCollateralUnlocked(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.circleId = event.params.circleId;
  entity.amount = event.params.amount;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleUserContributionRedeemed(
  event: UserContributionRedeemedEvent
): void {
  let entity = new UserContributionRedeemed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.contributionId = event.params.contributionId;
  entity.amount = event.params.amount;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleUserReputationScoreSlashed(
  event: UserReputationScoreSlashedEvent
): void {
  let entity = new UserReputationScoreSlashed(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.updatedReputationScore = event.params.updatedReputationScore;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}

export function handleUserReputationScoreUpdated(
  event: UserReputationScoreUpdatedEvent
): void {
  let entity = new UserReputationScoreUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.user = event.params.user;
  entity.numberOfContributions = event.params.numberOfContributions;
  entity.repaymentCount = event.params.repaymentCount;
  entity.reputationScore = event.params.reputationScore;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
