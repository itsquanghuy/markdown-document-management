import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
  FiSend,
} from "react-icons/fi";
import { ImShare2 } from "react-icons/im";
import { BiSearch } from "react-icons/bi";
import { toast } from "react-toastify";

import documentService from "./../services/documentService";
import authService from "./../services/authService";
import userService from "./../services/userService";
import commentService from "./../services/commentService";
import "./Document.css";
import Modal from "../components/Modal";
import { useRouting } from "../hooks/routing";

function Document({ mode, location }) {
  const createOption = mode && mode === "create";
  const history = useHistory();
  const routing = useRouting(history.location.pathname);
  const [document, setDocument] = useState(
    !createOption
      ? location.state
        ? location.state
        : null
      : {
          title: "",
          content: "",
          allowSharing: false,
          whoCanAccess: [],
        }
  );
  const [comments, setComments] = useState([]);
  const [initialDocument, setInititalDocument] = useState(
    location.state ? location.state : null
  );
  const [emailInput, setEmailInput] = useState("");
  const [editMode, setEditMode] = useState(
    document
      ? createOption
        ? true
        : authService.getCurrentUser()._id === document.userId
      : true
  );
  const [readOnly, setReadOnly] = useState(false);
  const [deletePrompt, setDeletePrompt] = useState(false);
  const [sharePrompt, setSharePrompt] = useState(false);
  const [commentInput, setCommentInput] = useState("");

  const formik = useFormik({
    initialValues: {
      title: document ? String(createOption ? "" : document.title) : "",
      content: document ? String(createOption ? "" : document.content) : "",
    },
    validationSchema,
    onSubmit: async function (values) {
      try {
        if (createOption) {
          const response = await documentService.create({
            ...values,
            allowSharing: document.allowSharing,
            whoCanAccess: [...document.whoCanAccess],
          });
          if (response) {
            toast.success("Successfully created a document");
            routing.push({
              pathname: `/documents/${response.data._id}`,
              state: response.data,
            });
          }
        } else {
          const response = await documentService.update(document._id, {
            ...values,
            allowSharing: document.allowSharing,
            whoCanAccess: [...document.whoCanAccess],
          });
          if (response) toast.success("Successfully shared the document");
        }
      } catch (error) {
        toast.error("Cannot create or update document");
      }
    },
  });

  useEffect(() => {
    if (!createOption)
      if (!document)
        documentService
          .get(history.location.pathname.replace("/documents/", ""))
          .then(({ data }) => {
            setDocument(data);
            setInititalDocument(data);
            formik.setFieldValue("title", data.title);
            formik.setFieldValue("content", data.content);
            commentService.get(data._id).then(({ data }) => setComments(data));
          });
      else
        commentService.get(document._id).then(({ data }) => setComments(data));
  }, []);

  function handleDeleteDocument() {
    setDeletePrompt(true);
  }

  async function handleYesDelete() {
    if (!createOption) await documentService.del(document._id);
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

    for (let i = 0; i < document.whoCanAccess.length; i++)
      if (document.whoCanAccess[i].email === emailInput) return;

    setDocument({ ...document, allowSharing: true });

    try {
      const { data: userData } = await userService.findUserByEmail(emailInput);

      const updatedData = {
        ...formik.values,
        allowSharing: true,
        whoCanAccess: [...document.whoCanAccess, userData],
      };

      const { data: documentData } = await documentService.update(
        document._id,
        updatedData
      );
      if (documentData) {
        toast.success(`Successfully shared to ${userData.email}`);
        setDocument({ ...documentData });
        setInititalDocument({ ...documentData });
      }
    } catch (error) {
      toast.error(`No user with email ${emailInput} is found!`);
    }
  }

  function handleCancelSharing() {
    setDocument({ ...initialDocument });
    setSharePrompt(false);
  }

  async function handleDoneAddSharedUsers() {
    setSharePrompt(false);
  }

  async function handleRemoveWhoCanAccess(user) {
    const filtered = [
      ...document.whoCanAccess.filter(function remove(sharedUser) {
        return user !== sharedUser;
      }),
    ];

    try {
      const updatedData = {
        title: document.title,
        content: document.content,
        allowSharing: filtered.length !== 0,
        whoCanAccess: [...filtered],
      };

      const { data } = await documentService.update(document._id, updatedData);
      if (data) {
        toast.success(`Successfully remove ${user.email} from sharing option`);
        setDocument({ ...data });
        setInititalDocument({ ...data });
      }
    } catch (error) {
      toast.error(`Unsuccessfully remove ${user.email} from sharing option`);
    }
  }

  function handleGoBack() {
    routing.push("/documents");
  }

  function handleKeyDown(keyEvent) {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }

  async function handleAddComment(evt) {
    const { data: me } = await userService.me();
    const { data: createdComment } = await commentService.post(document._id, {
      content: commentInput,
      user: { _id: me._id, name: me.name, email: me.email },
    });
    setComments([...comments, createdComment]);
    setCommentInput("");
  }

  async function handleRemoveComment(comment) {
    const filtered = [
      ...comments.filter(function deleted(c) {
        return c !== comment;
      }),
    ];

    try {
      await commentService.remove(document._id, comment._id);
      toast.success(`Successfully delete comment with id ${comment._id}`);
      setComments(filtered);
    } catch (error) {
      toast.error(`Cannot delete comment with id ${comment._id}`);
    }
  }

  return (
    <>
      {document && (
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
            <Modal width="50%" height="27rem">
              <ShareHeaderContainer>
                <ShareHeaderHeading>Share this document to</ShareHeaderHeading>
              </ShareHeaderContainer>
              <SearchInputContainer>
                <SearchInput
                  type="text"
                  value={emailInput}
                  onChange={(evt) => setEmailInput(evt.target.value)}
                />
                <BiSearch
                  size={24}
                  cursor="pointer"
                  onClick={handleFindUserByEmail}
                />
              </SearchInputContainer>
              <SharedUsersContainer>
                {document.whoCanAccess.map((user) => (
                  <SharedUser key={user._id}>
                    <p>
                      {user.name} - {user.email}
                    </p>
                    <FiXCircle
                      size={20}
                      cursor="pointer"
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
                  Done
                </Done>
              </ButtonGroup>
            </Modal>
          )}
          <Form>
            <TaskBar>
              <FiChevronLeft
                size={24}
                cursor="pointer"
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
                    placeholder={createOption ? "Title" : ""}
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
                      cursor="pointer"
                      type="button"
                      onClick={formik.handleSubmit}
                    />
                    <FiTrash2
                      size={24}
                      color={"var(--danger)"}
                      cursor="pointer"
                      onClick={handleDeleteDocument}
                    />
                    {!createOption && (
                      <ImShare2
                        size={24}
                        color={"var(--dark-grey)"}
                        cursor="pointer"
                        onClick={handleShareDocument}
                      />
                    )}
                  </ActionContainer>
                )}
              </TitleContainer>
            </TaskBar>
            <ContentContainer createOption={createOption}>
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
              {!createOption && (
                <CommentContainer>
                  <CommentSection>
                    {comments.length !== 0 &&
                      comments.map((comment) => (
                        <Comment key={comment._id}>
                          <CommentDescription>
                            <CommentUserName>
                              {comment.user.name} - {comment.user.email}
                            </CommentUserName>
                            <CommentContent>{comment.content}</CommentContent>
                          </CommentDescription>
                          {authService.getCurrentUser()._id ===
                            comment.user._id && (
                            <CommentCallToAction>
                              <FiTrash2
                                size={20}
                                cursor="pointer"
                                onClick={() => handleRemoveComment(comment)}
                              />
                            </CommentCallToAction>
                          )}
                        </Comment>
                      ))}
                  </CommentSection>
                  <CommentInputContainer>
                    <CommentInput
                      placeholder="Your Comment"
                      value={commentInput}
                      onChange={(evt) => setCommentInput(evt.target.value)}
                    />
                    <FiSend
                      size={24}
                      onClick={handleAddComment}
                      cursor="pointer"
                    />
                  </CommentInputContainer>
                </CommentContainer>
              )}
            </ContentContainer>
          </Form>
        </>
      )}
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
const CommentContainer = styled.div`
  background-color: #fff;
  width: 80%;
  overflow: auto;
  height: 60vh;
  border-radius: 0.5rem;
  padding: 1rem;
`;

const CommentSection = styled.div`
  height: 50vh;
  overflow: auto;
  margin-bottom: 1rem;
`;

const CommentDescription = styled.div`
  padding-right: 2rem;
`;

const CommentUserName = styled.h4`
  font-size: 1.8rem;
  margin-bottom: 0;
`;

const Comment = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1rem 0 1rem;

  &:not(:last-child) {
    border-bottom: 0.1rem solid var(--light-grey);
  }
`;

const CommentContent = styled.p`
  font-size: 1.6rem;
  margin-top: 1rem;
`;

const CommentInputContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const CommentInput = styled.textarea`
  display: block;
  width: 97%;
  height: 6vh;
  overflow: auto;
  border-radius: 0.5rem;
  outline: none;
  border: 0.1rem solid var(--medium-grey);
  font-size: 1.8rem;
  resize: none;
  font-family: inherit;
  padding: 0.5rem;
  margin-right: 1rem;

  &:focus {
    border: 0.2rem solid var(--medium-grey);
  }
`;

const CommentCallToAction = styled.div`
  width: 20%;
  text-align: right;
`;

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

const ShareHeaderContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem 1rem 0 1rem;
`;

const ShareHeaderHeading = styled.div`
  font-size: 3rem;
  font-weight: 600;

  @media only screen and (max-width: 68rem) {
    font-size: 2rem;
  }
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
  ${(props) =>
    props.createOption
      ? `
    display: block;
  `
      : `
    display: grid;
    grid-template-columns: 2fr 1fr;
  `}

  @media only screen and (max-width: 60rem) {
    padding: 6.5rem 0 0 0;
  }
`;

const View = styled.div`
  width: 80%;
  height: 100%;
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
  border-radius: 0.5rem;
  overflow: auto;
  border: ${(props) => (props.error ? "0.2rem solid var(--danger)" : "none")};
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
  height: 80vh;
  overflow: auto;
  background-color: #fff;
  font-size: 1.6rem;
  padding: 2rem;
  margin: 0 auto;
`;

export default Document;
