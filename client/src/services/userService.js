import http from "./httpServices";
import { apiUrl } from "../config.json";

const apiEndpoint = apiUrl + "/users";

function me() {
  return http.get(`${apiEndpoint}/me`);
}

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
  me,
  register,
  findUserByEmail,
};

export default user;
