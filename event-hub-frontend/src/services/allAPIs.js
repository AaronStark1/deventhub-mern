import api from "./api";

// Every call returns the axios response on 2xx and throws on anything else.
// The token is attached automatically by the interceptor in ./api.

// AUTH
export const registerUserAPI = (body) => api.post("/api/register", body);
export const loginUserAPI = (body) => api.post("/api/login", body);
export const googleLoginAPI = (body) => api.post("/api/google-login", body);

// EVENTS — public
export const getAllEventsAPI = (params) => api.get("/api/getAllEvents", { params });
export const getSingleEventAPI = (id) => api.get(`/api/getSingleEvent/${id}`);

// EVENTS — host
export const addEventAPI = (body) => api.post("/api/addEvent", body);
export const updateEventAPI = (id, body) => api.put(`/api/updateEvent/${id}`, body);
export const deleteEventAPI = (id) => api.delete(`/api/deleteEvent/${id}`);
export const getHostEventsAPI = () => api.get("/api/host/events");

// REGISTRATIONS — user
export const confirmRegistrationAPI = (id) =>
  api.post(`/api/events/${id}/confirm-registration`);
export const getMyRegistrationsAPI = () => api.get("/api/user/registrations");
export const getMyTicketAPI = (id) => api.get(`/api/events/${id}/ticket`);

// PAYMENT (demo only)
export const createCheckoutSessionAPI = (eventId) =>
  api.post("/api/create-checkout-session", { eventId });
