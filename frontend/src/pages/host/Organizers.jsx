import Layout from '../../components/Layout';

const HostOrganizers = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Organizers</h1>
        <div className="card">
          <p className="text-gray-500">No organizers assigned yet</p>
        </div>
      </div>
    </Layout>
  );
};

export default HostOrganizers;

