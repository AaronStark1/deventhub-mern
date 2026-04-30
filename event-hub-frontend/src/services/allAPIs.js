import { serverURL } from "./serverURL";
import commonAPI from "./commonAPI";

// auth APIs
export const registerUserAPI = async (reqBody) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/register`, 
    reqBody, 
    {}
  );
};

export const loginUserAPI = async (reqBody) => {
  return await commonAPI(
    "POST", 
    `${serverURL}/api/login`, 
    reqBody, 
    {}
  );
};

export const googleLoginAPI = async (reqBody) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/google-login`,
    reqBody,
    {}
  );
};

// EVENTS APIs
export const addEventAPI = async (reqBody, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/addEvent`,
    reqBody,
    {
      Authorization: `Bearer ${token}`,
    }
  );
};


export const getAllEventsAPI = async (query = "") => {
  return await commonAPI(
    'GET',
    `${serverURL}/api/getAllEvents${query}`,
    {},
    {}
  );
};

export const getSingleEventAPI = async (id) => {
  return await commonAPI(
    'GET',
    `${serverURL}/api/getSingleEvent/${id}`,
    {},
    {}
  );
};

export const updateEventAPI = async (id, reqBody) => {
  return await commonAPI(
    'PUT',
    `${serverURL}/api/updateEvent/${id}`,
    reqBody,
    {}
  );
};

export const deleteEventAPI = async (id) => {
  return await commonAPI(
    'DELETE',
    `${serverURL}/api/deleteEvent/${id}`,
    {},
    {}
  );
};

export const confirmRegistrationAPI = async (id, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/events/${id}/confirm-registration`,
    {},
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

export const getHostEventsAPI = async (token) => {
  return await commonAPI(
    "GET",
    `${serverURL}/api/host/events`,
    {},
    {
      Authorization: `Bearer ${token}`,
    }
  );
};

// payment 
export const createCheckoutSessionAPI = async (eventId, token) => {
  return await commonAPI(
    "POST",
    `${serverURL}/api/create-checkout-session`,
    { eventId },
    {
      Authorization: `Bearer ${token}`,
    }
  );
};
