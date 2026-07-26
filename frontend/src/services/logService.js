import api from "./api";


export const getLogs = async () => {

    const response = await api.get(
        "/logs"
    );

    return response.data;

};



export const getAuditLogs = async () => {

    const response = await api.get(
        "/audit"
    );

    return response.data;

};