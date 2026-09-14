import apiClient from "./client";

export const getDeveloperDatabaseSchema = async () => {
    const response = await apiClient.get(
        "/developer/database/schema"
    );
    console.log('fetched Response : ', response)
return response.success !== undefined ? response : response.data;
};