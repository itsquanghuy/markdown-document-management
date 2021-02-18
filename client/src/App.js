import React, { useEffect } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Document from "./pages/Document";
import DocumentList from "./pages/DocumentList";
import Register from "./pages/Register";
import SignIn from "./pages/SignIn";
import authService from "./services/authService";

function App() {
  var history = useHistory();

  useEffect(() => {
    if (!authService.getCurrentUser()) return history.push("/signin");
    else return history.push("/documents");
  }, [history]);

  return (
    <>
      <ToastContainer style={{ fontSize: "1.4rem" }} />
      <Switch>
        <Route exact path="/signin" component={SignIn} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/documents" component={DocumentList} />
        <Route
          exact
          path="/documents/create"
          render={(props) => <Document mode="create" {...props} />}
        />
        <Route
          exact
          path="/documents/:id"
          render={(props) => <Document mode="update" {...props} />}
        />
      </Switch>
    </>
  );
}

export default App;
