import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import apiService from '../services/api';
import { useAuth, normalizeNickname, isValidNickname } from '../contexts/AuthContext';
import '../styles/CreateSongPage.css';

const CreateSongPage = ({ setCurrentPage }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    url: '',
    price: ''
  });
  const [participants, setParticipants] = useState([
    { name: user?.nickname || '@', role: 'artista', percentage: '100' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.nickname) {
      setParticipants((prev) => {
        if (prev.length === 1 && (!prev[0].name || prev[0].name === '@')) {
          return [{ ...prev[0], name: user.nickname }];
        }
        return prev;
      });
    }
  }, [user?.nickname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (index, field, value) => {
    const updated = [...participants];
    if (field === 'name') {
      let v = value;
      if (v && !v.startsWith('@')) v = `@${v.replace(/^@+/, '')}`;
      updated[index][field] = v;
    } else {
      updated[index][field] = value;
    }
    setParticipants(updated);
  };

  const blurParticipantNick = (index) => {
    const updated = [...participants];
    const nick = normalizeNickname(updated[index].name);
    updated[index].name = nick || '@';
    setParticipants(updated);
  };

  const addParticipant = () => {
    setParticipants([...participants, { name: '@', role: '', percentage: '' }]);
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
    if (participants.length === 0 || !participants.some((p) => p.name.trim())) {
      setError(t('song.create.validation.participants.required'));
      return false;
    }

    for (let i = 0; i < participants.length; i += 1) {
      const nick = normalizeNickname(participants[i].name);
      if (!isValidNickname(nick)) {
        setError(t('song.create.validation.nickname.invalid', { index: i + 1 }));
        return false;
      }
    }

    const totalPercentage = participants.reduce(
      (sum, p) => sum + (parseFloat(p.percentage) || 0),
      0
    );
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

    if (!user?.nickname) {
      setError(t('auth.error.session'));
      return;
    }

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const songData = {
        ...formData,
        price: parseFloat(formData.price),
        usuarioId: user.nickname,
        participants: participants.map((p) => {
          const name = normalizeNickname(p.name);
          return {
            name,
            usuarioId: name,
            role: p.role,
            percentage: parseFloat(p.percentage)
          };
        })
      };

      await apiService.crearCancion(songData);
      setSuccess(t('song.create.success'));

      setFormData({ title: '', artist: '', url: '', price: '' });
      setParticipants([{ name: user.nickname, role: 'artista', percentage: '100' }]);

      setTimeout(() => {
        setCurrentPage('songs');
      }, 2000);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || t('song.create.error')
      );
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
          <p className="participants-hint">{t('song.create.form.participants.hint')}</p>

          {participants.map((participant, index) => (
            <div key={index} className="participant-row">
              <input
                type="text"
                placeholder={t('song.create.form.participant.name')}
                value={participant.name}
                onChange={(e) => handleParticipantChange(index, 'name', e.target.value)}
                onBlur={() => blurParticipantNick(index)}
                disabled={loading}
                spellCheck={false}
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
                onChange={(e) =>
                  handleParticipantChange(index, 'percentage', e.target.value)
                }
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
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? t('common.loading') : t('song.create.form.submit')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSongPage;
