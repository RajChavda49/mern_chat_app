import axios from "axios";

export const BaseUrl = '"http://localhost:5000/"';

export const postUrl = axios.create({
  method: "POST",
  baseURL: "http://localhost:5000/api/",
});

export const putUrl = axios.create({
  method: "PUT",
  baseURL: "http://localhost:5000/api/",
});

export const getUrl = axios.create({
  method: "GET",
  baseURL: "http://localhost:5000/api/",
});
