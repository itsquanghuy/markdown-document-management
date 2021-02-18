import React from "react";
import styled from "styled-components";

function Modal({ width, height, children }) {
  return (
    <>
      <Container />
      <Box width={width} height={height}>
        {children}
      </Box>
    </>
  );
}

const Container = styled.div`
  position: absolute;
  top: 0;
  width: 100%;
  height: 100vh;
  background-color: var(--black);
  opacity: 0.5;
  z-index: 2;
`;

const Box = styled.div`
  position: absolute;
  background-color: orange;
  width: ${(props) => props.width};
  height: ${(props) => props.height};
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  z-index: 3;
  background-color: #fff;
  border: 0.1rem solid var(--medium-grey);
  border-radius: 0.5rem;

  @media only screen and (max-width: 80rem) {
    width: 50%;
  }
`;

export default Modal;
