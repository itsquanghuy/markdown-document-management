import React, { useState } from "react";
import PropTypes from "prop-types";
import { useFormik } from "formik";
import * as Yup from "yup";
import HtmlParser from "html-react-parser";
import marked from "marked";
import styled from "styled-components";
import {
  FiEyeOff,
  FiEye,
  FiTrash2,
  FiSave,
  FiXCircle,
  FiChevronLeft,
} from "react-icons/fi";
import { ImShare2 } from "react-icons/im";
import { BiSearch } from "react-icons/bi";
import { toast } from "react-toastify";

import documentService from "./../services/documentService";
import authService from "./../services/authService";
import userService from "./../services/userService";
import "./Document.css";
import Modal from "../components/Modal";

function Document({ mode, location, history }) {
  const [emailInput, setEmailInput] = useState("");
  const [allowSharing, setAllowSharing] = useState(
    mode === "create" ? false : location.state.allowSharing
  );
  const [whoCanAccess, setWhoCanAccess] = useState(
    mode === "create" ? [] : [...location.state.whoCanAccess]
  );
  const [editMode, setEditMode] = useState(
    mode === "create"
      ? true
      : authService.getCurrentUser()._id === location.state.userId
  );
  const [readOnly, setReadOnly] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);
  const [sharePrompt, setSharePrompt] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: String(mode === "create" ? "" : location.state.title),
      content: String(mode === "create" ? "" : location.state.content),
    },
    validationSchema,
    onSubmit: async function (values) {
      try {
        if (mode === "create") {
          const response = await documentService.create({
            ...values,
            allowSharing: allowSharing,
            whoCanAccess: [...whoCanAccess],
          });
          if (response) {
            toast.success("Successfully created a document");
            history.push({
              pathname: `/documents/${response.data._id}`,
              state: response.data,
            });
          }
        } else if (mode === "update") {
          const response = await documentService.update(location.state._id, {
            ...values,
            allowSharing: allowSharing,
            whoCanAccess: [...whoCanAccess],
          });
          if (response) toast.success("Successfully updated the document");
        }
      } catch (error) {
        toast.error("Cannot create or update document");
      }
    },
  });

  function handleDeleteDocument() {
    setDeletePrompt(true);
  }

  async function handleYesDelete() {
    if (mode === "update") await documentService.del(location.state._id);
    history.goBack();
  }

  function handleNoDelete() {
    setDeletePrompt(false);
  }

  function handleToggle() {
    setReadOnly(!readOnly);
  }

  function handleShareDocument() {
    setSharePrompt(true);
  }

  async function handleFindUserByEmail() {
    setEmailInput("");

    for (let i = 0; i < whoCanAccess.length; i++)
      if (whoCanAccess[i].email === emailInput) return;

    setAllowSharing(true);

    try {
      const { data } = await userService.findUserByEmail(emailInput);
      setWhoCanAccess([...whoCanAccess, data]);
    } catch (error) {
      toast.error(`No user with email ${emailInput} is found!`);
    }
  }

  function handleCancelSharing() {
    setAllowSharing(
      mode === "create" ? allowSharing : location.state.allowSharing
    );
    setWhoCanAccess(
      mode === "create" ? [...whoCanAccess] : [...location.state.whoCanAccess]
    );
    setSharePrompt(false);
  }

  function handleDoneAddSharedUsers() {
    setSharePrompt(false);
  }

  function handleRemoveWhoCanAccess(user) {
    setWhoCanAccess([
      ...whoCanAccess.filter(function remove(sharedUser) {
        return user !== sharedUser;
      }),
    ]);
  }

  function handleGoBack() {
    history.push("/documents");
  }

  function handleKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  return (
    <>
      {deletePrompt && (
        <Modal width="25%" height="10rem">
          <Prompt>Are you sure?</Prompt>
          <ButtonGroup>
            <No type="button" onClick={handleNoDelete}>
              No
            </No>
            <Yes type="button" onClick={handleYesDelete}>
              Yes
            </Yes>
          </ButtonGroup>
        </Modal>
      )}
      {sharePrompt && (
        <Modal width="50%" height="20rem">
          <SearchInputContainer>
            <SearchInput
              type="text"
              value={emailInput}
              onChange={(evt) => setEmailInput(evt.target.value)}
            />
            <BiSearch
              size={24}
              cursor={"pointer"}
              onClick={handleFindUserByEmail}
            />
          </SearchInputContainer>
          <SharedUsersContainer>
            {whoCanAccess.map((user) => (
              <SharedUser key={user._id}>
                <p>
                  {user.name} - {user.email}
                </p>
                <FiXCircle
                  size={20}
                  cursor={"pointer"}
                  color={"var(--danger)"}
                  onClick={() => handleRemoveWhoCanAccess(user)}
                />
              </SharedUser>
            ))}
          </SharedUsersContainer>
          <ButtonGroup>
            <Cancel type="button" onClick={handleCancelSharing}>
              Cancel
            </Cancel>
            <Done type="button" onClick={handleDoneAddSharedUsers}>
              Share
            </Done>
          </ButtonGroup>
        </Modal>
      )}
      <Form>
        <TaskBar>
          <FiChevronLeft
            size={24}
            cursor={"pointer"}
            style={{ paddingLeft: "1rem" }}
            onClick={handleGoBack}
          />
          <TitleContainer>
            <div>
              <label htmlFor="title"></label>
              <TitleInput
                onKeyDown={handleKeyDown}
                type="text"
                id="title"
                name="title"
                disabled={!editMode}
                placeholder={mode === "create" ? "Title" : ""}
                value={formik.values.title}
                onChange={formik.handleChange}
                error={formik.errors.title}
              />
            </div>
            {editMode && (
              <ActionContainer>
                <Toggle onClick={handleToggle}>
                  {!readOnly ? <FiEyeOff size={24} /> : <FiEye size={24} />}
                </Toggle>
                <FiSave
                  size={24}
                  color={"var(--tertiary-color)"}
                  cursor={"pointer"}
                  type="button"
                  onClick={formik.handleSubmit}
                />
                <FiTrash2
                  size={24}
                  color={"var(--danger)"}
                  cursor={"pointer"}
                  onClick={handleDeleteDocument}
                />
                <ImShare2
                  size={24}
                  color={"var(--dark-grey)"}
                  cursor={"pointer"}
                  onClick={handleShareDocument}
                />
              </ActionContainer>
            )}
          </TitleContainer>
        </TaskBar>
        <ContentContainer>
          {editMode ? (
            <View>
              {!readOnly ? (
                <>
                  <label htmlFor="content"></label>
                  <TextArea
                    id="content"
                    name="content"
                    autoFocus
                    value={formik.values.content}
                    onChange={formik.handleChange}
                    error={formik.errors.content}
                  />
                </>
              ) : (
                <Previewer className="previewer">
                  {HtmlParser(marked(formik.values.content))}
                </Previewer>
              )}
            </View>
          ) : (
            <View>
              <Previewer className="previewer">
                {HtmlParser(marked(formik.values.content))}
              </Previewer>
            </View>
          )}
        </ContentContainer>
      </Form>
    </>
  );
}

// Form Contraints
const validationSchema = Yup.object().shape({
  title: Yup.string().required().min(1).label("Title"),
  content: Yup.string().required().min(0),
});

// Component Constraints
Document.propTypes = {
  mode: PropTypes.oneOf(["create", "update"]),
};

// Styles
const Prompt = styled.h3`
  font-size: 2rem;
  padding-left: 1.5rem;
`;

const ButtonGroup = styled.div`
  text-align: right;
  padding-right: 1.5rem;
`;

const No = styled.button`
  border: none;
  outline: none;
  background-color: inherit;
  color: var(--dark-grey);
  font-weight: 600;
  cursor: pointer;
`;

const Yes = styled.button`
  border: none;
  outline: none;
  background-color: inherit;
  color: var(--danger);
  font-weight: 600;
  cursor: pointer;
`;

const Done = styled.button`
  border: none;
  outline: none;
  background-color: inherit;
  color: var(--tertiary-color);
  font-weight: 600;
  cursor: pointer;
`;

const Cancel = styled.button`
  border: none;
  outline: none;
  background-color: inherit;
  color: var(--dark-grey);
  font-weight: 600;
  cursor: pointer;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  padding: 1rem 1rem 0 1rem;
`;

const SearchInput = styled.input`
  display: block;
  border: none;
  border-bottom: 0.1rem solid var(--medium-grey);
  outline: none;
  font-size: 2rem;
  border-radius: 0.5rem;
  width: 100%;
`;

const SharedUsersContainer = styled.div`
  margin: 0 auto;
  font-size: 1.6rem;
  margin: 1rem 0 1rem 0;
  height: 10rem;
  overflow: auto;
`;

const SharedUser = styled.div`
  margin: 0;
  padding: 0 1rem 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Form = styled.form`
  width: 100%;
  background-color: var(--light-grey);
  padding: 0 0 1rem 0;

  @media only screen and (max-width: 60rem) {
    background-color: #fff;
  }
`;

const TaskBar = styled.div`
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1;
  padding: 2rem 0 2rem 0;
  background-color: #fff;
  border-bottom: 0.1rem solid var(--medium-grey);
  display: flex;
  align-items: center;
`;

const ActionContainer = styled.div`
  width: 13rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Toggle = styled.div`
  display: inline;
  cursor: pointer;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 2rem;
`;

const TitleInput = styled.input`
  border: ${(props) => (props.error ? "0.1rem solid var(--danger)" : "none")};
  outline: none;
  font-weight: 600;
  font-size: 2rem;
  border-radius: 0.5rem;
  width: 20rem;
  margin-right: 1.5rem;

  &:hover {
    border: ${(props) =>
      props.error
        ? "0.1rem solid var(--danger)"
        : "0.1rem solid var(--light-grey)"};
  }

  &:focus {
    border: ${(props) =>
      props.error
        ? "0.2rem solid var(--danger)"
        : "0.2rem solid var(--tertiary-color)"};
  }
`;

const ContentContainer = styled.div`
  position: relative;
  width: 100%;
  height: 80vh;
  padding: 10rem 0 6rem 0;
  margin: 0rem 0 2rem 0;
  overflow: auto;

  @media only screen and (max-width: 60rem) {
    padding: 6.5rem 0 0 0;
  }
`;

const View = styled.div`
  width: 60%;
  height: 100vh;
  margin 0 auto;

  @media only screen and (max-width: 87.5rem) {
    width: 80%;
  }

  @media only screen and (max-width: 60rem) {
    width: 100%;
  }
`;

const TextArea = styled.textarea`
  display: block;
  width: 100%;
  height: 100%;
  margin: 0 auto;
  overflow: auto;
  border: ${(props) => (props.error ? "0.1rem solid var(--danger)" : "none")};
  outline: none;
  resize: none;
  padding: 2rem;
  font-size: 1.6rem;

  @media only screen and (max-width: 60rem) {
    padding: 1rem;
  }
`;

const Previewer = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #fff;
  font-size: 1.6rem;
  padding: 2rem;
  margin: 0 auto;
`;

export default Document;
