import React, { useEffect, useState } from "react";
import { Redirect, useHistory } from "react-router-dom";
import { css } from "@emotion/core";
import ClipLoader from "react-spinners/ClipLoader";
import styled from "styled-components";
import { BsPlusCircleFill } from "react-icons/bs";
import { ImExit } from "react-icons/im";
import { FiUsers } from "react-icons/fi";

import authService from "./../services/authService";
import documentService from "./../services/documentService";
import { useRouting } from "../hooks/routing";

function DocumentList() {
  const history = useHistory();
  const routing = useRouting(history.location.pathname);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  async function getDocumentList() {
    const { data } = await documentService.getAll();
    setDocuments(data);
    setLoading(false);
  }

  useEffect(() => {
    if (!authService.getCurrentUser()) return routing.push("/signin");
    getDocumentList();
  }, []);

  function handleCreateDocument() {
    routing.push("/documents/create");
  }

  async function handleSignOut() {
    await authService.logout();
    window.location = "/";
  }

  function handleToDocument(path, data) {
    routing.push({
      pathname: path,
      state: data,
    });
  }

  return (
    <Container>
      {!authService.getCurrentUser() ? (
        <Redirect to="/signin" />
      ) : (
        <>
          {loading ? (
            <ClipLoader
              color={"var(--tertiary-color)"}
              loading={loading}
              css={override}
              size={150}
            />
          ) : (
            <>
              <ActionContainer>
                <IconContainer>
                  <SignOutIcon
                    size={50}
                    cursor={"pointer"}
                    color={"var(--medium-grey)"}
                    onClick={handleSignOut}
                  />
                </IconContainer>
                <IconContainer>
                  <CreateIcon
                    size={50}
                    color={"var(--tertiary-color)"}
                    cursor={"pointer"}
                    onClick={handleCreateDocument}
                  />
                </IconContainer>
              </ActionContainer>
              <Grid>
                {documents.map((document) => (
                  <Item
                    key={document._id}
                    onClick={() =>
                      handleToDocument(`/documents/${document._id}`, document)
                    }
                  >
                    <ItemContent>{document.content}</ItemContent>
                    <Title>
                      {authService.getCurrentUser()._id !== document.userId && (
                        <FiUsers size={26} />
                      )}
                      <TitleContainer
                        shared={
                          authService.getCurrentUser()._id !== document.userId
                        }
                      >
                        <ItemTitle>{document.title}</ItemTitle>
                        <ItemCreatedDateTime>
                          {document.created_at}
                        </ItemCreatedDateTime>
                      </TitleContainer>
                    </Title>
                  </Item>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Container>
  );
}

// Styles
const override = css`
  display: block;
  margin: 0 auto;
  border-color: red;
`;

const Item = styled.div`
  cursor: pointer;
  text-decoration: none;
  color: var(--black);
  border: 0.1rem solid var(--light-grey);
  border-radius: 0.5rem;
  padding: 1rem;
  height: 22rem;

  &:hover {
    border-color: var(--tertiary-color);
  }
`;

const TitleContainer = styled.div`
  margin-left: ${(props) => (props.shared ? "1rem" : 0)};
`;

const Title = styled.div`
  display: flex;
  align-items: center;
`;

const ItemContent = styled.div`
  height: 15rem;
  overflow: hidden;
  filter: blur(0.1rem);
`;

const ItemTitle = styled.h2`
  margin-bottom: 0rem;
  font-size: 2rem;
`;

const ItemCreatedDateTime = styled.p`
  color: var(--dark-grey);
`;

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 5rem;
  margin: 2rem auto;
  width: 60%;
  padding: 2rem 0 2rem 0;

  @media only screen and (max-width: 90rem) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media only screen and (max-width: 60rem) {
    grid-template-columns: 1fr;
    width: 80%;
  }
`;

const ActionContainer = styled.div`
  position: absolute;
  top: 72%;
  left: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media only screen and (max-width: 60rem) {
    left: 85%;
  }

  @media only screen and (max-width: 50rem) {
    top: 60%;
    left: 75%;
  }
`;

const IconContainer = styled.div`
  position: relative;
  margin: 1rem 0 1rem 0;
  border-radius: 50%;
  width: 7rem;
  height: 7rem;
  box-shadow: 0rem 0rem 0.8rem 0.8rem var(--medium-grey);

  &:hover {
    box-shadow: 0rem 0rem 1rem 1rem var(--medium-grey);
  }
`;

const CreateIcon = styled(BsPlusCircleFill)`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

const SignOutIcon = styled(ImExit)`
  display: block;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-40%, -45%);
`;

export default DocumentList;
