import { useEffect, useState } from 'react';
import axios from 'axios';

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
      .catch((err) => {
        setError('Failed to load coin data');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Crypto Analytics Dashboard</h1>
      <ul>
        {coins.map((coin) => (
          <li key={coin.id}>
            {coin.name} ({coin.symbol.toUpperCase()}) — ${coin.current_price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;