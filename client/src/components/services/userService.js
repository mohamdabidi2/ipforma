import axiosInstance from "./AxiosInstance";


// Login API call
export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('users/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

// Signup API call
export const signup = async (name, email, password) => {
  try {
    const response = await axiosInstance.post('users/register', { name, email, password });
    return response.data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// Get user details
export const getUserDetails = async () => {
  try {
    const response = await axiosInstance.get('/user/details');
    return response.data;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
};
