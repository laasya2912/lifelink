const API_BASE_URL = "https://lifelink-api-3p4l.onrender.com";

export async function checkBackend() {
  const response = await fetch(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error("Backend connection failed");
  }

  return response.json();
}

export async function createIncident(incident) {
  const response = await fetch(`${API_BASE_URL}/incidents/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(incident),
  });

  if (!response.ok) {
    throw new Error("Incident creation failed");
  }

  return response.json();
}