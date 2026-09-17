import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
const API_URL = import.meta.env.VITE_API_URL;


const COIN_COLORS = {
  bitcoin: '#f7931a',
  ethereum: '#627eea',
  tether: '#26a17b',
  binancecoin: '#f3ba2f',
  ripple: '#000000',
  usdc: '#2775ca',
  solana: '#14f195',
  tron: '#ef0027',
  zcash: '#f4b728',
  cardano: '#0033ad',
  dogecoin: '#c2a633',
  chainlink: '#2a5ada',
  monero: '#ff6600',
  stellar: '#000000',
};

const FALLBACK_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#0ea5e9'];

function getCoinColor(coin, index) {
  return COIN_COLORS[coin.id] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_desc');
  const [lastUpdated, setLastUpdated] = useState(null);

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const fetchCoins = () => {
      axios
        .get(`${API_URL}/api/coins/markets`)
        .then((res) => {
          setCoins(res.data);
          setLastUpdated(new Date());
          setLoading(false);
        })
        .catch(() => {
          setError('Failed to load coin data');
          setLoading(false);
        });
    };

    fetchCoins();
    const interval = setInterval(fetchCoins, 60000);
    return () => clearInterval(interval);
  }, []);

  const openCoinHistory = (coin) => {
    setSelectedCoin(coin);
    setHistoryLoading(true);
    axios
      .get(`${API_URL}/api/coins/history/${coin.id}`)
      .then((res) => {
        setHistory(res.data);
        setHistoryLoading(false);
      })
      .catch(() => {
        setHistory([]);
        setHistoryLoading(false);
      });
  };

  const closeModal = () => {
    setSelectedCoin(null);
    setHistory([]);
  };

  if (loading) return <div style={styles.centeredMessage}>Loading...</div>;
  if (error) return <div style={styles.centeredMessage}>{error}</div>;

  const chartData = coins.slice(0, 10).map((coin) => ({
    name: coin.symbol.toUpperCase(),
    marketCap: coin.market_cap,
  }));

  const sortFns = {
    market_cap_desc: (a, b) => b.market_cap - a.market_cap,
    price_desc: (a, b) => b.current_price - a.current_price,
    change_desc: (a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h,
    change_asc: (a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h,
  };

  const filteredCoins = coins
    .filter(
      (coin) =>
        coin.name.toLowerCase().includes(search.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort(sortFns[sortBy]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.title}>Crypto Analytics Dashboard</h1>
          {lastUpdated && (
            <p style={styles.updatedText}>Last updated: {lastUpdated.toLocaleTimeString()}</p>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>Top 10 by Market Cap</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis
                width={70}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `$${(value / 1e9).toFixed(0)}B`}
              />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="marketCap" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={index} fill={getCoinColor(coins[index], index)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>All Coins</h2>

          <div style={styles.controls}>
            <input
              type="text"
              placeholder="Search coins..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.input}
            />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
              <option value="market_cap_desc">Market Cap (High to Low)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="change_desc">24h Change (High to Low)</option>
              <option value="change_asc">24h Change (Low to High)</option>
            </select>
          </div>

          <div style={styles.grid}>
            {filteredCoins.length === 0 && <p>No coins match your search.</p>}
            {filteredCoins.map((coin, index) => {
              const isPositive = coin.price_change_percentage_24h >= 0;
              const coinColor = getCoinColor(coin, index);
              return (
                <div
                  key={coin.id}
                  onClick={() => openCoinHistory(coin)}
                  style={{ ...styles.coinCard, borderLeft: `4px solid ${coinColor}` }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <img src={coin.image} alt={coin.name} width={32} height={32} />
                  <h3 style={styles.coinName}>{coin.name} ({coin.symbol.toUpperCase()})</h3>
                  <p style={styles.coinPrice}>${coin.current_price.toLocaleString()}</p>
                  <p style={{ ...styles.coinChange, color: isPositive ? '#16a34a' : '#dc2626' }}>
                    {isPositive ? '▲' : '▼'} {coin.price_change_percentage_24h?.toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {selectedCoin && (
        <div onClick={closeModal} style={styles.overlay}>
          <div onClick={(e) => e.stopPropagation()} style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0 }}>{selectedCoin.name} — 7 Day Price</h2>
              <button onClick={closeModal} style={styles.closeBtn}>✕</button>
            </div>

            {historyLoading ? (
              <p>Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={history} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} />
                  <YAxis width={65} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f3f4f6',
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    padding: '2rem 1rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.25rem',
    color: '#111827',
    margin: 0,
  },
  updatedText: {
    color: '#6b7280',
    fontSize: '0.9rem',
    marginTop: '0.5rem',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    marginTop: 0,
    color: '#111827',
  },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.25rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  input: {
    padding: '0.6rem 0.8rem',
    width: '280px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    fontSize: '0.95rem',
  },
  select: {
    padding: '0.6rem 0.8rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: '#fff',
    fontSize: '0.95rem',
    width: '240px',
    cursor: 'pointer',
    outline: 'none',
    color: '#374151',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  coinCard: {
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    padding: '1rem',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    background: '#fafafa',
  },
  coinName: {
    margin: '0.5rem 0 0.25rem',
    fontSize: '1rem',
    color: '#111827',
  },
  coinPrice: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 600,
    color: '#111827',
  },
  coinChange: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  centeredMessage: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontFamily: 'sans-serif',
    fontSize: '1.1rem',
  },
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '1rem',
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '600px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.2rem',
    cursor: 'pointer',
    color: '#6b7280',
  },
};

export default App;