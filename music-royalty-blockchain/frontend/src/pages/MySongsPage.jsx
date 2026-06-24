import { useEffect, useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './MySongsPage.css';

export const MySongsPage = () => {
  const { songs } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  const [mySongs, setMySongs] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalRoyalties, setTotalRoyalties] = useState(0);

  useEffect(() => {
    if (user && songs) {
      // Filtrar canciones creadas por el usuario (en demo, mostramos todas)
      const userSongs = songs; // En producción: songs.filter(s => s.creatorId === user.id)
      setMySongs(userSongs);

      const sales = userSongs.reduce((sum, s) => sum + (s.sales || 0), 0);
      setTotalSales(sales);

      const royalties = userSongs.reduce((sum, s) => {
        const userParticipant = s.participants?.find(p => p.name === user.fullName);
        if (userParticipant) {
          return sum + ((s.sales || 0) * s.price * (userParticipant.percentage / 100));
        }
        return sum;
      }, 0);
      setTotalRoyalties(royalties);
    }
  }, [user, songs]);

  return (
    <div className="my-songs-page">
      <h2>{t('myCreatedSongs')}</h2>

      {mySongs.length === 0 ? (
        <div className="no-songs">
          <p>{t('noSongsCreated')}</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{mySongs.length}</h3>
              <p>Canciones Creadas</p>
            </div>
            <div className="stat-card">
              <h3>{totalSales}</h3>
              <p>{t('totalSales')}</p>
            </div>
            <div className="stat-card highlight">
              <h3>${totalRoyalties.toFixed(2)}</h3>
              <p>{t('totalRoyalties')}</p>
            </div>
          </div>

          <div className="songs-list-section">
            <h3>{t('salesHistory')}</h3>
            
            <div className="my-songs-list">
              {mySongs.map(song => {
                const userParticipant = song.participants?.find(p => p.name === user.fullName);
                const royaltyEarned = userParticipant 
                  ? (song.sales || 0) * song.price * (userParticipant.percentage / 100)
                  : 0;

                return (
                  <div key={song.id} className="my-song-card">
                    <img src={song.coverUrl} alt={song.title} className="my-song-cover" />
                    
                    <div className="my-song-info">
                      <h4>{song.title}</h4>
                      <p className="my-song-artist">{song.artist}</p>
                      <span className="my-song-genre">{t(`genre.${song.genre}`)}</span>
                    </div>

                    <div className="my-song-stats">
                      <div className="stat-row">
                        <span>Ventas:</span>
                        <strong>{song.sales || 0}</strong>
                      </div>
                      <div className="stat-row">
                        <span>Precio:</span>
                        <strong>${song.price.toFixed(2)}</strong>
                      </div>
                      {userParticipant && (
                        <div className="stat-row">
                          <span>Tu %:</span>
                          <strong>{userParticipant.percentage}%</strong>
                        </div>
                      )}
                      <div className="stat-row royalty">
                        <span>Regalías:</span>
                        <strong>${royaltyEarned.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="participants-mini">
                      <h5>{t('participants')}:</h5>
                      {song.participants.map((p, idx) => (
                        <span key={idx} className="mini-participant">
                          {p.name} ({p.percentage}%)
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
