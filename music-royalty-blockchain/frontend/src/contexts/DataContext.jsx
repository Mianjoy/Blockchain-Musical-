import { createContext, useContext, useState, useEffect } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData debe ser usado dentro de un DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [songs, setSongs] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    const storedSongs = localStorage.getItem('musicRoyaltySongs');
    const storedPurchases = localStorage.getItem('musicRoyaltyPurchases');
    
    if (storedSongs) {
      setSongs(JSON.parse(storedSongs));
    } else {
      // Datos de ejemplo
      const sampleSongs = [
        {
          id: '1',
          title: 'Summer Vibes',
          artist: 'DJ Sunshine',
          genre: 'electronic',
          description: 'Una canción perfecta para el verano con ritmos electrónicos.',
          downloadLink: 'https://example.com/summer-vibes',
          price: 2.99,
          coverUrl: 'https://picsum.photos/seed/summer/300/300',
          participants: [
            { name: 'DJ Sunshine', role: 'artist', percentage: 40 },
            { name: 'Mike Producer', role: 'producer', percentage: 30 },
            { name: 'Anna Composer', role: 'composer', percentage: 30 }
          ],
          createdAt: new Date().toISOString(),
          sales: 0
        },
        {
          id: '2',
          title: 'Rock Anthem',
          artist: 'The Rockers',
          genre: 'rock',
          description: 'Un himno rockero con guitarras potentes.',
          downloadLink: 'https://example.com/rock-anthem',
          price: 3.99,
          coverUrl: 'https://picsum.photos/seed/rock/300/300',
          participants: [
            { name: 'John Singer', role: 'artist', percentage: 35 },
            { name: 'Peter Guitar', role: 'artist', percentage: 25 },
            { name: 'Mark Drummer', role: 'artist', percentage: 20 },
            { name: 'Lisa Composer', role: 'composer', percentage: 20 }
          ],
          createdAt: new Date().toISOString(),
          sales: 0
        },
        {
          id: '3',
          title: 'Jazz Night',
          artist: 'Smooth Quartet',
          genre: 'jazz',
          description: 'Música jazz suave para noches tranquilas.',
          downloadLink: 'https://example.com/jazz-night',
          price: 4.99,
          coverUrl: 'https://picsum.photos/seed/jazz/300/300',
          participants: [
            { name: 'Tom Sax', role: 'artist', percentage: 30 },
            { name: 'Sarah Piano', role: 'artist', percentage: 30 },
            { name: 'Bob Bass', role: 'artist', percentage: 20 },
            { name: 'Jim Drums', role: 'artist', percentage: 20 }
          ],
          createdAt: new Date().toISOString(),
          sales: 0
        }
      ];
      setSongs(sampleSongs);
      localStorage.setItem('musicRoyaltySongs', JSON.stringify(sampleSongs));
    }
    
    if (storedPurchases) {
      setPurchases(JSON.parse(storedPurchases));
    }
  }, []);

  const createSong = (songData) => {
    setLoading(true);
    
    // Simular procesamiento en blockchain
    setTimeout(() => {
      const newSong = {
        ...songData,
        id: Date.now().toString(),
        coverUrl: `https://picsum.photos/seed/${Date.now()}/300/300`,
        createdAt: new Date().toISOString(),
        sales: 0
      };
      
      const updatedSongs = [...songs, newSong];
      setSongs(updatedSongs);
      localStorage.setItem('musicRoyaltySongs', JSON.stringify(updatedSongs));
      setLoading(false);
      
      return newSong;
    }, 1500);
  };

  const purchaseSong = (songId, userId, userData) => {
    setLoading(true);
    
    const song = songs.find(s => s.id === songId);
    if (!song) {
      setLoading(false);
      return { success: false, error: 'Canción no encontrada' };
    }

    // Generar clave única basada en blockchain
    const accessKey = `KEY-${songId}-${userId}-${Date.now().toString(36).toUpperCase()}`;
    
    const purchase = {
      id: Date.now().toString(),
      songId,
      songTitle: song.title,
      songArtist: song.artist,
      userId,
      userName: userData.fullName,
      userEmail: userData.email,
      price: song.price,
      accessKey,
      purchaseDate: new Date().toISOString(),
      downloadLink: song.downloadLink
    };

    const updatedPurchases = [...purchases, purchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('musicRoyaltyPurchases', JSON.stringify(updatedPurchases));

    // Actualizar ventas de la canción
    const updatedSongs = songs.map(s => 
      s.id === songId 
        ? { ...s, sales: (s.sales || 0) + 1 }
        : s
    );
    setSongs(updatedSongs);
    localStorage.setItem('musicRoyaltySongs', JSON.stringify(updatedSongs));

    setLoading(false);
    return { success: true, purchase };
  };

  const getUserPurchases = (userId) => {
    return purchases.filter(p => p.userId === userId);
  };

  const getUserSongs = (userId) => {
    // En una implementación real, filtraríamos por el creador
    // Aquí retornamos todas para demo
    return songs;
  };

  const getSongById = (id) => {
    return songs.find(s => s.id === id);
  };

  const hasPurchased = (userId, songId) => {
    return purchases.some(p => p.userId === userId && p.songId === songId);
  };

  const value = {
    songs,
    purchases,
    loading,
    createSong,
    purchaseSong,
    getUserPurchases,
    getUserSongs,
    getSongById,
    hasPurchased,
    refreshSongs: () => {
      const storedSongs = localStorage.getItem('musicRoyaltySongs');
      if (storedSongs) {
        setSongs(JSON.parse(storedSongs));
      }
    }
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
