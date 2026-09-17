import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('market_cap_desc');

  const [selectedCoin, setSelectedCoin] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
useEffect(() => {
  const fetchCoins = () => {
    axios
      .get('http://localhost:4000/api/coins/markets')
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

  fetchCoins(); // initial load

  const interval = setInterval(fetchCoins, 60000); 

  return () => clearInterval(interval); 
}, []);

  const openCoinHistory = (coin) => {
    setSelectedCoin(coin);
    setHistoryLoading(true);
    axios
      .get(`http://localhost:4000/api/coins/history/${coin.id}`)
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

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>;
  if (error) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>{error}</p>;

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
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Crypto Analytics Dashboard</h1>
      {lastUpdated && (
  <p style={{ color: '#666', fontSize: '0.9rem' }}>
    Last updated: {lastUpdated.toLocaleTimeString()}
  </p>
)}

      <h2>Top 10 by Market Cap</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(value) => `$${(value / 1e9).toFixed(0)}B`} />
          <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
          <Bar dataKey="marketCap" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>

      <h2>All Coins</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Search coins..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: '0.5rem', flex: 1, minWidth: '200px' }}
        />
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: '0.5rem' }}>
          <option value="market_cap_desc">Market Cap (High to Low)</option>
          <option value="price_desc">Price (High to Low)</option>
          <option value="change_desc">24h Change (High to Low)</option>
          <option value="change_asc">24h Change (Low to High)</option>
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {filteredCoins.length === 0 && <p>No coins match your search.</p>}
        {filteredCoins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div
              key={coin.id}
              onClick={() => openCoinHistory(coin)}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
              }}
            >
              <img src={coin.image} alt={coin.name} width={32} height={32} />
              <h3 style={{ margin: '0.5rem 0 0.25rem' }}>{coin.name} ({coin.symbol.toUpperCase()})</h3>
              <p style={{ margin: 0, fontSize: '1.2rem' }}>${coin.current_price.toLocaleString()}</p>
              <p style={{ margin: 0, color: isPositive ? 'green' : 'red' }}>
                {isPositive ? '▲' : '▼'} {coin.price_change_percentage_24h?.toFixed(2)}%
              </p>
            </div>
          );
        })}
      </div>

      {selectedCoin && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '8px', padding: '1.5rem',
              width: '90%', maxWidth: '600px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0 }}>{selectedCoin.name} — 7 Day Price</h2>
              <button onClick={closeModal} style={{ cursor: 'pointer' }}>✕</button>
            </div>

            {historyLoading ? (
              <p>Loading chart...</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toFixed(0)}`} />
                  <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                  <Line type="monotone" dataKey="price" stroke="#4f46e5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;