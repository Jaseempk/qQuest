import { gql } from "@apollo/client";

export const GET_CIRCLE_DATA = gql`
  query GetCircleData($circleId: String!) {
    circles(where: { circleId: $circleId }) {
      contributionAmount
      contributors
    }
  }
`;
