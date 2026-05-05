import axios from "axios";

/* =====================================================
   NODE BACKEND (PORT 5000)
===================================================== */

const api = axios.create({
  baseURL: "http://127.0.0.1:5000/api/v1", // 🔥 FIX localhost
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("spk_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* =====================================================
   AUTH
===================================================== */

export const login = (data) => api.post("/auth/login", data);

/* =====================================================
   CASES
===================================================== */

export const getCases = () => api.get("/cases");
export const getCase = (id) => api.get(`/cases/${id}`);
export const createCase = (data) => api.post("/cases", data);
export const updateCase = (id, data) => api.put(`/cases/${id}`, data);
export const deleteCase = (id) => api.delete(`/cases/${id}`);

export const updateCaseStep = (caseId, stepNumber) => {
  return api.put(`/cases/${caseId}/step`, { current_step: stepNumber });
};

/* =====================================================
   CRITERIA
===================================================== */

export const getCriteria = (caseId) => api.get(`/criteria/${caseId}`);
export const createCriteria = (data) => api.post("/criteria", data);
export const updateCriteria = (id, data) => api.put(`/criteria/${id}`, data);
export const deleteCriteria = (id) => api.delete(`/criteria/${id}`);

/* =====================================================
   ALTERNATIVES
===================================================== */

export const getAlternatives = (caseId) => api.get(`/alternatives/${caseId}`);
export const createAlternative = (data) => api.post("/alternatives", data);
export const updateAlternative = (id, data) => api.put(`/alternatives/${id}`, data);
export const deleteAlternative = (id) => api.delete(`/alternatives/${id}`);

/* =====================================================
   VALUES
===================================================== */

export const getValues = (caseId) => api.get(`/values/${caseId}`);
export const saveValues = (data) => api.post("/values", data);

/* =====================================================
   AHP
===================================================== */

export const saveCriteriaComparisons = (data) =>
  api.post("/spk/ahp/comparisons", data);

export const calculateAHP = (caseId) =>
  api.post(`/spk/ahp/calculate/${caseId}`);

export const saveAltComparisons = (data) =>
  api.post("/spk/ahp/alternative-comparisons", data);

export const calculateAHPRanking = (caseId) =>
  api.post(`/spk/ahp/calculate-ranking/${caseId}`);

/* =====================================================
   SPK METHODS
===================================================== */

export const calculateSAW = (caseId) =>
  api.post(`/spk/saw/${caseId}`);

export const calculateSMART = (caseId) =>
  api.post(`/spk/smart/${caseId}`);

export const calculateWP = (caseId) =>
  api.post(`/spk/wp/${caseId}`);

export const calculateTOPSIS = (caseId) =>
  api.post(`/spk/topsis/${caseId}`);

/* =====================================================
   RESULTS
===================================================== */

export const getResults = (caseId, method = "SAW") =>
  api.get(`/spk/results/${caseId}?method=${method}`);

/* =====================================================
   MACHINE LEARNING (NODE → DATASET)
===================================================== */

// 🔥 GLOBAL (TANPA CASE)
export const getDataset = (method = "SAW") =>
  api.get(`/ml/dataset?method=${method}`);

/* =====================================================
   MACHINE LEARNING — PYTHON (PORT 8000)
===================================================== */

const mlApi = axios.create({
  baseURL: "http://127.0.0.1:8000", // 🔥 FIX localhost
  headers: { "Content-Type": "application/json" },
});

// optional: kirim token (tidak wajib sebenarnya)
mlApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("spk_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* =====================================================
   ML FUNCTIONS (FINAL - GLOBAL)
===================================================== */

// 🔥 TRAIN (TANPA caseId)
export const trainModel = (method = "SAW") =>
  mlApi.post("/ml/train", { method });

// 🔥 STATUS (TANPA caseId)
export const getModelStatus = (method = "SAW") =>
  mlApi.get(`/ml/status?method=${method}`);

// 🔥 PREDICT (TANPA caseId)
export const predictScore = (method = "SAW", features = {}) =>
  mlApi.post("/ml/predict", { method, features });

export { mlApi };
export default api;