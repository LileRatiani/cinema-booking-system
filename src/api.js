const BASE_URL = 'https://api.kinoxii.redberryinternship.ge/api';

export const fetchFilterOptions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/filter-options`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch filter options:", error);
    return null;
  }
};


export const fetchFeaturedMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movies/featured`);
    if (!response.ok) throw new Error('Failed to fetch featured movies');
    const json = await response.json();
    return json.data; // Extracting the data wrapper just like before
  } catch (error) {
    console.error("Error fetching featured:", error);
    return [];
  }
};

export const fetchNowPlayingMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movies/now-playing`);
    if (!response.ok) throw new Error('Failed to fetch now playing movies');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching now playing:", error);
    return [];
  }
};

export const fetchComingSoonMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movies/coming-soon`);
    if (!response.ok) throw new Error('Failed to fetch coming soon movies');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching coming soon:", error);
    return [];
  }
};

export const fetchSessions = async (queryParams = {}) => {
  try {
    // Convert filter state object into URL search parameters (e.g., ?venue_id=1&date=2026-10-15)
    const queryString = new URLSearchParams(queryParams).toString();
    const url = `${BASE_URL}/sessions${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch sessions');
    const json = await response.json();
    return json.data;
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
};

export const fetchSessionSeats = async (sessionId) => {
  try {
    const response = await fetch(`https://api.kino-xii.example/sessions/${sessionId}/seats`); // Replace with your actual base URL if needed
    if (!response.ok) throw new Error('Failed to fetch seats');
    return await response.json();
  } catch (error) {
    console.error("Error fetching session seats:", error);
    return null;
  }
};