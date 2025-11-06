import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Upload, FileText, Eye, Download, Edit, Trash2, Search } from 'lucide-react';
import { hostService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const LegalCompliance = () => {
  const [documents, setDocuments] = useState([
    {
      _id: '1',
      name: 'Contract_Tech_Summit_2024.pdf',
      event: 'Tech Summit 2024',
      type: 'Contract',
      status: 'Signed',
      lastUpdated: '2024-03-15',
      iconColor: 'text-teal',
    },
    {
      _id: '2',
      name: 'Permit_Indie_Music.pdf',
      event: 'Indie Music Fest',
      type: 'Permit',
      status: 'In Review',
      lastUpdated: '2024-03-14',
      iconColor: 'text-orange',
    },
    {
      _id: '3',
      name: 'Insurance_Coverage.pdf',
      event: 'Tech Summit 2024',
      type: 'Insurance',
      status: 'Awaiting Signature',
      lastUpdated: '2024-03-13',
      iconColor: 'text-orange',
    },
    {
      _id: '4',
      name: 'NDA_Agreement.pdf',
      event: 'Indie Music Fest',
      type: 'Contract',
      status: 'Action Required',
      lastUpdated: '2024-03-12',
      iconColor: 'text-red-500',
    },
  ]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Signed':
        return 'badge-signed';
      case 'In Review':
        return 'badge-review';
      case 'Awaiting Signature':
        return 'badge-awaiting';
      case 'Action Required':
        return 'badge-action';
      default:
        return 'badge-info';
    }
  };

  return (
    <Layout role="host">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold dark:text-white text-gray-900">Legal & Compliance</h1>
          <div className="flex items-center gap-4">
            <button className="btn btn-teal">
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
            <button className="relative p-2">
              <div className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1"></div>
              <span className="text-gray-400">🔔</span>
            </button>
          </div>
        </div>

        {/* Manage Documents */}
        <div className="card">
          <h2 className="text-2xl font-bold dark:text-white text-gray-900 mb-6">Manage Documents</h2>

          {/* Search and Filter */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 dark:text-gray-400 text-gray-600" />
              <input
                type="text"
                placeholder="Search documents..."
                className="input pl-10"
              />
            </div>
            <button className="btn btn-outline">
              All Document Types
              <span className="ml-2">▼</span>
            </button>
          </div>

          {/* Documents Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Document Name</th>
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Event</th>
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Last Updated</th>
                  <th className="text-left py-3 px-4 text-sm font-medium dark:text-gray-400 text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-b border-gray-200 dark:border-gray-700 hover:dark:bg-dark-bg hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <FileText className={`w-6 h-6 ${doc.iconColor}`} />
                        <span className="font-medium dark:text-white text-gray-900">{doc.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 dark:text-gray-300 text-gray-700">{doc.event}</td>
                    <td className="py-4 px-4 dark:text-gray-300 text-gray-700">{doc.type}</td>
                    <td className="py-4 px-4">
                      <span className={`badge ${getStatusBadge(doc.status)}`}>
                        {doc.status === 'Signed' && '✓'}
                        {doc.status === 'In Review' && '⏳'}
                        {doc.status === 'Awaiting Signature' && '✏️'}
                        {doc.status === 'Action Required' && '!'}
                        {' '}{doc.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 dark:text-gray-300 text-gray-700">{doc.lastUpdated}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded">
                          <Eye className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded">
                          <Download className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                        </button>
                        {(doc.status === 'Awaiting Signature' || doc.status === 'Action Required') && (
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded">
                            <Edit className="w-4 h-4 dark:text-gray-400 text-gray-600" />
                          </button>
                        )}
                        {doc.status === 'Action Required' && (
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-dark-bg rounded">
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LegalCompliance;

