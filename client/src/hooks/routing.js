import { useHistory } from "react-router-dom";

export function useRouting(currentPath) {
  const history = useHistory();
  localStorage.setItem("currentPath", currentPath);

  return {
    push: history.push,
  };
}

export function currentPath() {
  try {
    return localStorage.getItem("currentPath");
  } catch (error) {
    return null;
  }
}
