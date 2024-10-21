import { ConnectKitButton } from "connectkit";
import styled from "styled-components";
const StyledButton = styled.button`
  cursor: pointer;
  position: relative;
  display: inline-block;
  padding: 14px 24px;
  color: #ffffff;
  background: #0052ff;
  font-size: 16px;
  font-weight: 500;
  border-radius: 10rem;
  box-shadow: 0 4px 24px -6px rgba(0, 82, 255, 0.5);
  transition: 200ms ease;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 6px 40px -6px rgba(0, 82, 255, 0.6);
  }

  &:active {
    transform: translateY(-3px);
    box-shadow: 0 6px 32px -6px rgba(0, 82, 255, 0.7);
  }
`;

export const CommonButon = () => {
  return (
    <ConnectKitButton.Custom>
      {({ isConnected, show, truncatedAddress, ensName }) => {
        return (
          <StyledButton onClick={show}>
            {isConnected ? ensName ?? truncatedAddress : "Connect Wallet"}
          </StyledButton>
        );
      }}
    </ConnectKitButton.Custom>
  );
};
