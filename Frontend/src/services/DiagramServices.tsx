import axios, { AxiosResponse } from 'axios';
import url from '../api/api'; // Correct import for the default export

// Define types for API responses
interface DiagramResponse {
  id: string;
  name: string;
  content: string;
}

interface CreateDiagramResponse {
  success: boolean;
  message: string;
  diagramId?: string;
}

interface UpdateDiagramResponse {
  success: boolean;
  message: string;
}

// Helper function to handle Axios errors
const handleAxiosError = (error: unknown): void => {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) {
      console.error('Unauthorized: Invalid token or session expired');
      // Optionally, implement logout logic here
    } else {
      console.error('An error occurred:', error.response?.data || error.message);
    }
  } else {
    console.error('An unexpected error occurred:', error);
  }
};

// Get Diagrams
const getDiagrams = async (code?: string | null): Promise<DiagramResponse[]> => {
  try {
    const accessToken = localStorage.getItem('accessToken') || code;
    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    const options = {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };

    const URL = `${url}/user/diagram`;
    const response: AxiosResponse<DiagramResponse[]> = await axios.get(URL, options);
    return response.data; // Return the data from the response
  } catch (error) {
    handleAxiosError(error);
    throw error; // Re-throw the error to handle it in the calling function
  }
};

// Update Diagrams
const updateDiagrams = async (json: object): Promise<UpdateDiagramResponse> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const URL = `${url}/user/diagram`;
    const response: AxiosResponse<UpdateDiagramResponse> = await axios.post(URL, json, { headers });
    return response.data; // Return the data from the response
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

// Create Diagrams
const createDiagrams = async (json: object): Promise<CreateDiagramResponse> => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('Access token is missing');
    }

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const URL = `${url}/user/createDiagram`;
    const response: AxiosResponse<CreateDiagramResponse> = await axios.post(URL, json, { headers });
    return response.data; // Return the data from the response
  } catch (error) {
    handleAxiosError(error);
    throw error;
  }
};

export {
  getDiagrams,
  updateDiagrams,
  createDiagrams,
};
