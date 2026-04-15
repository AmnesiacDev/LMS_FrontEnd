import React from 'react';
import { useAuth } from '../../context/AuthContext';
import useFetchData from '../../hooks/useFetchData';

const ReviewsPage = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  const endpoint = (role === 'student' || role === 'parent') ? '/api/v1/sessionReview/me' : '/api/v1/sessionReview';
  const { data, loading, error } = useFetchData(endpoint);

  const reviews = Array.isArray(data) ? data : (data?.docs || data?.reviews || []);

  const ratingBar = (value, max = 5) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--bg-tertiary)', borderRadius: '3px', overflow: 'hidden', maxWidth: '100px' }}>
        <div style={{ height: '100%', width: `${(value / max) * 100}%`, background: 'var(--brand-primary)', borderRadius: '3px' }}></div>
      </div>
      <span style={{ fontSize: '0.85rem', fontWeight: '600', minWidth: '30px' }}>{value}/{max}</span>
    </div>
  );

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem' }}>Session Reviews</h1>
        <span style={{ color: 'var(--text-muted)' }}>{reviews.length} reviews</span>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>}
      {error && <p style={{ color: 'var(--error)' }}>{error}</p>}

      {!loading && reviews.length === 0 && (
        <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
          <h3>No reviews yet</h3>
          <p style={{ color: 'var(--text-muted)' }}>Session reviews will be listed here.</p>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {reviews.map(review => (
          <div key={review._id} className="glass-panel" style={{ padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Session Review</h3>
              <div style={{
                background: 'linear-gradient(135deg, var(--brand-primary), var(--info))',
                color: 'white',
                width: '42px', height: '42px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700',
                fontSize: '0.9rem',
              }}>
                {review.overAllRating?.toFixed(1) || '—'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Behavior</span>
                {ratingBar(review.Behavior)}
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Understanding</span>
                {ratingBar(review.underStanding)}
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Participation</span>
                {ratingBar(review.participation)}
              </div>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Coding</span>
                {ratingBar(review.coding)}
              </div>
            </div>

            {review.notes && (
              <p style={{ marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                📝 {review.notes}
              </p>
            )}

            <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : ''}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewsPage;
