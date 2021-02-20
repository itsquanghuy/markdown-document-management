import http from "./httpServices";
import { apiUrl } from "./../config.json";

const apiEndpoint = apiUrl + "/comments";

function get(documentId) {
  return http.get(`${apiEndpoint}/${documentId}`);
}

function post(documentId, data) {
  return http.post(`${apiEndpoint}/${documentId}`, data);
}

function update(documentId, commentId, data) {
  return http.put(`${apiEndpoint}/${documentId}?commentId=${commentId}`, data);
}

function remove(documentId, commentId) {
  return http.delete(`${apiEndpoint}/${documentId}?commentId=${commentId}`);
}

const comments = {
  get,
  post,
  update,
  remove,
};

export default comments;
