import api from "./api";


export const getTransfers = async () => {

  const response = await api.get(
    "/transfers"
  );

  return response.data;

};



export const getTransferHistory = async () => {

  const response = await api.get(
    "/transfers/history"
  );

  return response.data;

};



export const createTransfer = async (data) => {

  const response = await api.post(
    "/transfers/create",
    data
  );

  return response.data;

};



export const approveTransferByBuyer = async (transferId) => {

  const response = await api.patch(
    `/transfers/buyer-approve/${transferId}`
  );

  return response.data;

};



export const approveTransferByAdmin = async (transferId) => {

  const response = await api.patch(
    `/transfers/admin-approve/${transferId}`
  );

  return response.data;

};