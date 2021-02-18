import styled from "styled-components";

const FormContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;

const Form = styled.form`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -80%);
  width: 30rem;
  padding: 1rem;
  font-size: 1.6rem;
`;

function Input({
  label,
  id,
  type = "text",
  name,
  value,
  onChange,
  error,
  ...otherProps
}) {
  return (
    <InputContainer>
      <Label htmlFor={id}>{label}</Label>
      <TextInput
        required
        id={id}
        type={type}
        name={name}
        onChange={onChange}
        value={value}
        {...otherProps}
      />
      {error && <Error>{error}</Error>}
    </InputContainer>
  );
}

const InputContainer = styled.div`
  margin: 1.4rem 0 1.4rem 0;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
`;

const TextInput = styled.input`
  display: block;
  width: 27.75rem;
  padding: 1rem;
  border: 0.1rem solid var(--dark-grey);
  border-radius: 0.5rem;
`;

const Error = styled.span`
  display: block;
  color: var(--danger);
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  width: 100%;
  margin-top: 2rem;
`;

const Button = styled.button`
  display: block;
  width: 100%;
  background-color: ${(props) =>
    props.disabled ? "var(--light-tertiary-color)" : "var(--tertiary-color)"};
  border: none;
  outline: none;
  box-shadow: none;
  color: var(--white);
  padding: 1rem;
  margin: 0 auto;
  border-radius: 0.5rem;

  &:hover {
    cursor: pointer;
  }
`;

export { FormContainer, Form, Input, ButtonGroup, Button };
