import { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './CreateSongPage.css';

export const CreateSongPage = ({ onNavigate }) => {
  const { createSong, loading } = useData();
  const { user } = useAuth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'pop',
    description: '',
    downloadLink: '',
    price: ''
  });
  
  const [participants, setParticipants] = useState([
    { name: user?.fullName || '', role: 'artist', percentage: 100 }
  ]);
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const roles = ['artist', 'composer', 'producer', 'lyricist', 'label'];

  const totalPercentage = participants.reduce((sum, p) => sum + Number(p.percentage), 0);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', role: 'artist', percentage: 0 }]);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      const updated = participants.filter((_, i) => i !== index);
      setParticipants(updated);
    }
  };

  const updateParticipant = (index, field, value) => {
    const updated = [...participants];
    updated[index] = { ...updated[index], [field]: value };
    setParticipants(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (totalPercentage !== 100) {
      setError(t('percentageError'));
      return;
    }

    if (!formData.downloadLink.includes('http')) {
      setError('El enlace debe ser una URL válida');
      return;
    }

    const songData = {
      ...formData,
      price: parseFloat(formData.price),
      participants,
      creatorId: user?.id
    };

    createSong(songData);
    setSuccess(true);
    
    setTimeout(() => {
      onNavigate('songs');
    }, 2000);
  };

  return (
    <div className="create-song-page">
      <div className="create-song-container">
        <h2>{t('createSong')}</h2>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{t('contractCreated')}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>{t('songTitle')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>{t('artistName')}</label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>{t('genre')}</label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                required
              >
                {roles.map(g => (
                  <option key={g} value={g}>{t(`genre.${g}`)}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>{t('priceUSD')}</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>{t('description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label>{t('downloadLink')}</label>
            <input
              type="url"
              value={formData.downloadLink}
              onChange={(e) => setFormData({ ...formData, downloadLink: e.target.value })}
              placeholder="https://ejemplo.com/cancion.mp3"
              required
            />
          </div>

          <div className="participants-section">
            <div className="participants-header">
              <h3>{t('participants')}</h3>
              <button type="button" onClick={addParticipant} className="btn-add">
                {t('addParticipant')}
              </button>
            </div>

            <div className={`total-percentage ${totalPercentage !== 100 ? 'error' : 'success'}`}>
              {t('totalPercentage')}: {totalPercentage}%
            </div>

            {participants.map((participant, index) => (
              <div key={index} className="participant-row">
                <input
                  type="text"
                  placeholder={t('participantName')}
                  value={participant.name}
                  onChange={(e) => updateParticipant(index, 'name', e.target.value)}
                  required
                />
                
                <select
                  value={participant.role}
                  onChange={(e) => updateParticipant(index, 'role', e.target.value)}
                  required
                >
                  {roles.map(role => (
                    <option key={role} value={role}>{t(`role.${role}`)}</option>
                  ))}
                </select>

                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder={t('percentage')}
                  value={participant.percentage}
                  onChange={(e) => updateParticipant(index, 'percentage', e.target.value)}
                  required
                />

                {participants.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeParticipant(index)}
                    className="btn-remove"
                  >
                    {t('removeParticipant')}
                  </button>
                )}
              </div>
            ))}
          </div>

          <button type="submit" className="btn-submit" disabled={loading || totalPercentage !== 100}>
            {loading ? t('blockchainProcessing') : t('createContract')}
          </button>
        </form>
      </div>
    </div>
  );
};
