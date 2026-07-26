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

  const response = await api.get(
    "/users"
  );

  return response.data;

};