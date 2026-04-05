const WORKER_URL = "https://dreambook.f-klavun.workers.dev";

const getHeaders = () => {
  const password = localStorage.getItem("dream_vault_password");
  return {
    "Content-Type": "application/json",
    "X-API-KEY": password,
  };
};

export const api = {
  async verify(password) {
    const response = await fetch(`${WORKER_URL}/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": password,
      },
    });
    return response.ok;
  },

  async getDreams() {
    const response = await fetch(`${WORKER_URL}/dreams`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Unauthorized or Error");
    return await response.json();
  },

  async addDream(dream) {
    const response = await fetch(`${WORKER_URL}/dreams`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dream),
    });
    if (!response.ok) throw new Error("Failed to add dream");
    return await response.json();
  },

  async updateDream(id, updatedData) {
    const response = await fetch(`${WORKER_URL}/dreams/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updatedData),
    });
    if (!response.ok) throw new Error("Failed to update dream");
    return await response.json();
  },

  async deleteDream(id) {
    const response = await fetch(`${WORKER_URL}/dreams/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Failed to delete dream");
    return await response.json();
  },

  async analyzeDream(id) {
    const response = await fetch(`${WORKER_URL}/dreams/${id}/analyze`, {
      method: "POST",
      headers: getHeaders(),
    });
    
    if (!response.ok) {
      // Try to get the detailed error from the response body
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || "The Witch is silent. Try again.");
    }
    
    return await response.json();
  }
};
