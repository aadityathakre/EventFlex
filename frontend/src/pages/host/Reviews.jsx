import Layout from '../../components/Layout';
import { useEffect, useState } from 'react';
import { hostService } from '../../services/apiServices';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Placeholder: backend doesn't currently provide a `getHostReviews` helper;
    // we keep a simple placeholder UI. In future hook hostService.getHostReviews()
    setLoading(true);
    setTimeout(() => {
      setReviews([{
        id: 'r1',
        text: 'Great coordination with the organizer.',
        by: 'Organizer - Priya',
        rating: 5
      }] );
      setLoading(false);
    }, 200);
  }, []);

  return (
    <Layout role="host">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Ratings & Reviews</h1>
        </div>

        <div className="card">
          {loading ? (
            <p>Loading reviews…</p>
          ) : reviews.length === 0 ? (
            <p>No reviews yet</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((r) => (
                <li key={r.id} className="p-3 border rounded">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold">{r.by}</div>
                    <div className="text-yellow-500">{'★'.repeat(r.rating)}</div>
                  </div>
                  <div className="text-sm text-gray-600">{r.text}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Reviews;
