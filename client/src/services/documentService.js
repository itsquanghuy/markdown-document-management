import http from "./httpServices";
import { apiUrl } from "./../config.json";

const apiEndpoint = apiUrl + "/documents";

function getAll() {
  return http.get(apiEndpoint);
}

function get(id) {
  return http.get(`${apiEndpoint}/${id}`);
}

function create(data) {
  return http.post(apiEndpoint, data);
}

function update(id, data) {
  return http.put(`${apiEndpoint}/${id}`, data);
}

function del(id) {
  return http.delete(`${apiEndpoint}/${id}`);
}

const documents = {
  getAll,
  get,
  create,
  update,
  del,
};

export default documents;
