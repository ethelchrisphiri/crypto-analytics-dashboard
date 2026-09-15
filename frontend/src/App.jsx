import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:4000/api/coins/markets')
      .then((res) => {
        setCoins(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load coin data');
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>Loading...</p>;
  if (error) return <p style={{ padding: '2rem', fontFamily: 'sans-serif' }}>{error}</p>;

  const chartData = coins.slice(0, 10).map((coin) => ({
    name: coin.symbol.toUpperCase(),
    marketCap: coin.market_cap,
  }));

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <h1>Crypto Analytics Dashboard</h1>

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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {coins.map((coin) => {
          const isPositive = coin.price_change_percentage_24h >= 0;
          return (
            <div key={coin.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
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
    </div>
  );
}

export default App;