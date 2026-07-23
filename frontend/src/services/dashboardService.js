import api from "./api";

export const getDashboardStatistics = async () => {
  const response = await api.get("/dashboard");

  return response.data;
};