import api from "./api";

export const getMyAuthorityDetails = () =>
  api.get("/user/authority-details");
