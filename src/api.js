const BASE_URL = 'https://api.kinoxii.redberryinternship.ge/api';

const getAuthToken = () => {
  return localStorage.getItem('token') || 
         localStorage.getItem('access_token') || 
         localStorage.getItem('access') ||
         localStorage.getItem('jwt') ||
         sessionStorage.getItem('token');
};

export const registerAccount = async (formData) => {
  try {
    const response = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: formData // Browser automatically sets multipart/form-data headers
    });
    
    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    return { status: 500, data: { message: "Network error" } };
  }
};

export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json' 
      },
      body: JSON.stringify(credentials)
    });
    
    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    return { status: 500, data: { message: "Network error" } };
  }
};

export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    // If there's no token, we are already logged out locally
    if (!token) return;

    // We don't need to await a JSON response since a successful logout returns 204 No Content
    await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    localStorage.removeItem('token');
  }
};

export const fetchCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return { status: 401, data: null };
    }

    const response = await fetch(`${BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Error fetching user session:", error);
    return { status: 500, data: null };
  }
};

export const updateProfile = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { status: 401, data: { message: 'Unauthenticated.' } };

    // Laravel requires multipart/form-data PUT requests to be spoofed via POST
    formData.append('_method', 'PUT');

    const response = await fetch(`${BASE_URL}/profile`, {
      method: 'POST', 
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Profile update error:", error);
    return { status: 500, data: { message: "Network error" } };
  }
};



export const fetchFeaturedMovies = async () => {
  try {
    const response = await fetch(`${BASE_URL}/movies/featured`);
    if (!response.ok) throw new Error('Failed to fetch featured movies');
    const json = await response.json();
    return json.data;
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
    const response = await fetch(`${BASE_URL}/sessions/${sessionId}/seats`);
    if (!response.ok) throw new Error('Failed to fetch seats');
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error fetching session seats:", error);
    return null;
  }
};

export const holdSessionSeats = async (sessionId, holdData) => {
  try {
    const token = getAuthToken();
    const headers = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Add the Bearer token if we found it
    if (token) {
      headers['Authorization'] = `Bearer ${token}`; 
    }

    const response = await fetch(`${BASE_URL}/sessions/${sessionId}/holds`, {
      method: 'POST',
      headers,
      body: JSON.stringify(holdData) 
    });

    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Error holding seats:", error);
    return { status: 500, data: { message: "Network error" } };
  }
};

export const createOrder = async (orderData) => {
  try {
    const token = getAuthToken();
    const headers = { 
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify(orderData)
    });
    
    if (!response.ok) throw new Error('Failed to create order');
    const json = await response.json();
    return json.data || json;
  } catch (error) {
    console.error("Error creating order:", error);
    return null;
  }
};

export const fetchMovieDetails = async (movieId, options = {}) => {
  try {
    const { date } = options;
    
    // 1. Fetch the base movie details
    const movieRes = await fetch(`${BASE_URL}/movies/${movieId}`);
    if (!movieRes.ok) throw new Error('Failed to fetch movie details');
    const movieJson = await movieRes.json();
    const movieData = movieJson.data;

    // 2. Fetch the sessions for the selected date
    const dateQuery = date ? `?date=${date}` : '';
    const sessionsRes = await fetch(`${BASE_URL}/movies/${movieId}/sessions${dateQuery}`);
    
    let sessionsData = [];
    if (sessionsRes.ok) {
      const sessionsJson = await sessionsRes.json();
      sessionsData = sessionsJson.data || [];
    }

    // Merge the sessions array into the movie object so the component has everything it needs
    return {
      ...movieData,
      venuesData: sessionsData 
    };
  } catch (error) {
    console.error("Error fetching movie data:", error);
    return null;
  }
};

export const fetchHold = async (holdId) => {
  try {
    const token = getAuthToken();
    const response = await fetch(`${BASE_URL}/holds/${holdId}`, {
      headers: { 
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });
    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Error fetching hold:", error);
    return { status: 500, data: null };
  }
};

export const releaseHold = async (holdId) => {
  try {
    const token = getAuthToken();
    await fetch(`${BASE_URL}/holds/${holdId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error("Error releasing hold:", error);
  }
};

export const fetchOrders = async (filter = 'upcoming') => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { status: 401, data: { message: 'Unauthenticated.' } };

    // Pass the filter as a query parameter (?filter=upcoming or ?filter=past)
    const response = await fetch(`${BASE_URL}/orders?filter=${filter}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Error fetching orders:", error);
    return { status: 500, data: null };
  }
};

export const searchMovies = async (query) => {
  try {
    const response = await fetch(`${BASE_URL}/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Search error:", error);
    return { status: 500, data: null };
  }
};

export const notifyMovie = async (movieSlug) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return { status: 401, data: { message: 'Unauthenticated.' } };

    const response = await fetch(`${BASE_URL}/movies/${movieSlug}/notify`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`
        // No Content-Type or body needed for this specific POST request
      }
    });

    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Notify error:", error);
    return { status: 500, data: { message: "Network error" } };
  }
};

export const fetchFilterOptions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/filter-options`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    const json = await response.json();
    return { status: response.status, data: json };
  } catch (error) {
    console.error("Filter options error:", error);
    return { status: 500, data: null };
  }
};