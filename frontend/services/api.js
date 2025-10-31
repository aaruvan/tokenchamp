import axios from 'axios'

const API_BASE_URL = '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add request interceptor for debugging
api.interceptors.request.use(
  config => {
    console.log('API Request:', config.method.toUpperCase(), config.url, config.data)
    return config
  },
  error => {
    console.error('API Request Error:', error)
    return Promise.reject(error)
  }
)

// Add response interceptor for debugging
api.interceptors.response.use(
  response => {
    console.log('API Response:', response.status, response.data)
    return response
  },
  error => {
    console.error('API Response Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const tournamentAPI = {
  // Get available tournaments
  getAvailable: () => api.get('/tournament/available'),
  
  // Register a team
  registerTeam: (data) => api.post('/tournament/register', data),
  
  // Get teams for a tournament
  getTeams: (tournamentId) => api.get(`/tournament/${tournamentId}/teams`),
}

export const adminAPI = {
  // Create tournament
  createTournament: (data) => api.post('/admin/create-tournament', data),
  
  // List all tournaments
  listTournaments: () => api.get('/admin/tournaments'),
  
  // Get tournament details
  getTournament: (id) => api.get(`/admin/tournament/${id}`),
}

export const winnerAPI = {
  // Submit match results
  submitResults: (data) => api.post('/winner/submit-results', data),
  
  // Declare winner
  declareWinner: (data) => api.post('/winner/declare-winner', data),
  
  // Get hall of champions
  getHallOfChampions: () => api.get('/winner/hall-of-champions'),
  
  // Get wins by wallet
  getWinsByWallet: (walletAddress) => api.get(`/winner/by-wallet/${walletAddress}`),
}

export const nftAPI = {
  // Mint NFT for winner
  mintNFT: (winnerId) => api.post(`/nft/mint/${winnerId}`),
  
  // Get NFT details
  getNFTDetails: (winnerId) => api.get(`/nft/winner/${winnerId}`),
}

export default api

