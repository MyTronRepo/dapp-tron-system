import api from "./api";


export const getDocumentsByProperty = async (propertyId) => {

  const response = await api.get(
    `/documents/property/${propertyId}`
  );

  return response.data;

};



export const getDocumentById = async (documentId) => {

  const response = await api.get(
    `/documents/${documentId}`
  );

  return response.data;

};



export const registerDocument = async (data) => {

  const response = await api.post(
    "/documents/register",
    data
  );

  return response.data;

};



export const uploadDocument = async (documentId, file) => {

  const formData = new FormData();

  formData.append(
    "document",
    file
  );


  const response = await api.post(
    `/documents/upload/${documentId}`,
    formData
  );


  return response.data;

};



export const verifyDocument = async (documentId) => {

  const response = await api.put(
    `/documents/verify/${documentId}`
  );


  return response.data;

};