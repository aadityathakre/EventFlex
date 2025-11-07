import Layout from '../../components/Layout';

const OrganizerEvents = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">My Events</h1>
        <div className="card">
          <p className="text-gray-500">No events created yet</p>
        </div>
      </div>
    </Layout>
  );
};

export default OrganizerEvents;

