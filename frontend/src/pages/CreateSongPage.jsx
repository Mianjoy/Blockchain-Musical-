import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import '../styles/CreateSongPage.css';

const CreateSongPage = ({ setCurrentPage }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    url: '',
    price: ''
  });
  const [participants, setParticipants] = useState([
    { name: '', role: '', percentage: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    updated[index][field] = value;
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '', role: '', percentage: '' }]);
  };

  const removeParticipant = (index) => {
    if (participants.length > 1) {
      setParticipants(participants.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError(t('song.create.validation.title.required'));
      return false;
    }
    if (!formData.artist.trim()) {
      setError(t('song.create.validation.artist.required'));
      return false;
    }
    if (!formData.url.trim()) {
      setError(t('song.create.validation.url.required'));
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError(t('song.create.validation.price.required'));
      return false;
    }
    if (participants.length === 0 || !participants.some(p => p.name.trim())) {
      setError(t('song.create.validation.participants.required'));
      return false;
    }

    const totalPercentage = participants.reduce((sum, p) => sum + (parseFloat(p.percentage) || 0), 0);
    if (Math.abs(totalPercentage - 100) > 0.01) {
      setError(t('song.create.validation.percentages.invalid'));
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const songData = {
        ...formData,
        price: parseFloat(formData.price),
        participants: participants.map(p => ({
          ...p,
          percentage: parseFloat(p.percentage)
        }))
      };

      await apiService.crearCancion(songData);
      setSuccess(t('song.create.success'));
      
      // Reset form
      setFormData({ title: '', artist: '', url: '', price: '' });
      setParticipants([{ name: '', role: '', percentage: '' }]);
      
      setTimeout(() => {
        setCurrentPage('songs');
      }, 2000);
    } catch (err) {
      setError(t('song.create.error'));
      console.error('Error creating song:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-song-page">
      <h1>{t('song.create.title')}</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="song-form">
        <div className="form-group">
          <label htmlFor="title">{t('song.create.form.title.label')}</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder={t('song.create.form.title.placeholder')}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="artist">{t('song.create.form.artist.label')}</label>
          <input
            type="text"
            id="artist"
            name="artist"
            value={formData.artist}
            onChange={handleInputChange}
            placeholder={t('song.create.form.artist.placeholder')}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">{t('song.create.form.url.label')}</label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleInputChange}
            placeholder={t('song.create.form.url.placeholder')}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="price">{t('song.create.form.price.label')}</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder={t('song.create.form.price.placeholder')}
            step="0.01"
            min="0"
            disabled={loading}
          />
        </div>

        <div className="participants-section">
          <h3>{t('song.create.form.participants.title')}</h3>
          
          {participants.map((participant, index) => (
            <div key={index} className="participant-row">
              <input
                type="text"
                placeholder={t('song.create.form.participant.name')}
                value={participant.name}
                onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                disabled={loading}
              />
              <input
                type="text"
                placeholder={t('song.create.form.participant.role')}
                value={participant.role}
                onChange={(e) => handleParticipantChange(index, 'role', e.target.value)}
                disabled={loading}
              />
              <input
                type="number"
                placeholder={t('song.create.form.participant.percentage')}
                value={participant.percentage}
                onChange={(e) => handleParticipantChange(index, 'percentage', e.target.value)}
                step="0.01"
                min="0"
                max="100"
                disabled={loading}
              />
              <button
                type="button"
                className="btn-remove"
                onClick={() => removeParticipant(index)}
                disabled={loading || participants.length === 1}
              >
                {t('song.create.form.participant.remove')}
              </button>
            </div>
          ))}

          <button
            type="button"
            className="btn-add-participant"
            onClick={addParticipant}
            disabled={loading}
          >
            {t('song.create.form.participant.add')}
          </button>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => setCurrentPage('songs')}
            disabled={loading}
          >
            {t('common.cancel')}
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? t('common.loading') : t('song.create.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSongPage;
