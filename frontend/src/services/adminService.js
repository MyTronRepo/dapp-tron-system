import api from "./api";


export const updatePropertyStatus = async (propertyId, status) => {

  const response = await api.patch(
    `/properties/${propertyId}/status`,
    {
      status
    }
  );

  return response.data;

};



export const getUsers = async () => {

  const response = await api.get("/users");
return response.data.data;
};



export const updateUserRole = async (userId, role) => {

  const response = await api.patch(
    `/users/${userId}/role`,
    {
      role
    }
  );

  return response.data;

};



export const updateUserStatus = async (userId, status) => {

  const response = await api.patch(
    `/users/${userId}/status`,
    {
      status
    }
  );

  return response.data;

};