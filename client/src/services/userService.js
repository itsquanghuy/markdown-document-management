import http from "./httpServices";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/users";

function register(user) {
  http.unsetJwt();
  return http.post(apiEndpoint, {
    email: user.email,
    password: user.password,
    name: user.name,
  });
}

function findUserByEmail(email) {
  return http.get(`${apiEndpoint}?email=${email}`);
}

const user = {
  register,
  findUserByEmail,
};

export default user;
