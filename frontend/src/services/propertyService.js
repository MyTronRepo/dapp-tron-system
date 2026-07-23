import api from "./api";


export const getProperties = async () => {

  const response = await api.get("/properties/search");

  return response.data;

};


export const getPropertyById = async (propertyId) => {

  const response = await api.get(
    `/properties/${propertyId}`
  );

  return response.data;

};


export const registerProperty = async (propertyData) => {

  const response = await api.post(
    "/properties/register",
    propertyData
  );

  return response.data;

};