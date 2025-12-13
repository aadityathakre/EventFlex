import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { serverURL } from "../App";
import {
  FaUserCircle,
  FaEdit,
  FaCamera,
  FaTrash,
  FaCheckCircle,
  FaClock,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaArrowLeft,
  FaIdCard,
  FaFileSignature,
  FaTimesCircle,
  FaUpload,
  FaSignOutAlt,
} from "react-icons/fa";

function HostProfileView() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      console.log("🔍 Fetching profile from:", `${serverURL}/host/profile`);
      console.log("📦 Sending credentials: true");
      
      const response = await axios.get(`${serverURL}/host/profile`, {
        withCredentials: true,
      });
      
      console.log("✅ Profile response received:", response.data);
      const { mergedProfile, documents, kyc } = response.data.data;
      
      console.log("📋 Merged Profile:", mergedProfile);
      console.log("📄 Documents:", documents);
      console.log("🔐 KYC:", kyc);
      
      setProfileData({ mergedProfile, documents, kyc });
      setError(null);
    } catch (err) {
      console.error("❌ Profile fetch error:", err);
      console.error("Error status:", err.response?.status);
      console.error("Error data:", err.response?.data);
      const errorMessage = err.response?.data?.message || "Failed to load profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("avatar", file);
    setUploadingImage(true);
    try {
      await axios.put(`${serverURL}/host/profile/image`, formData, {
        withCredentials: true,
      });
      await fetchProfile();
      setShowImageUpload(false);
      alert("Profile image updated successfully!");
    } catch (err) {
      console.error("Image upload error:", err);
      alert(err.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;
    try {
      await axios.delete(`${serverURL}/host/profile/image`, {
        withCredentials: true,
      });
      await fetchProfile();
      alert("Profile image removed successfully!");
    } catch (err) {
      console.error("Image delete error:", err);
      alert(err.response?.data?.message || "Failed to remove image");
    }
  };

  const handleDocumentUpload = async (docType, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("fileUrl", file);
    formData.append("type", docType);
    
    // Debug: Log what we're sending
    console.log("📤 Uploading document...");
    console.log("Document Type:", docType);
    console.log("File:", file.name, file.size, file.type);
    console.log("FormData entries:");
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }
    
    setUploadingDoc(docType);
    try {
      // Check if user has ANY document (since policy is one-document-per-user)
      const hasAnyDoc = documents.length > 0;
      
      // Use update endpoint if user already has a document, otherwise use upload
      const endpoint = hasAnyDoc
        ? `${serverURL}/host/update-docs`
        : `${serverURL}/host/upload-docs`;
      
      const method = hasAnyDoc ? axios.put : axios.post;

      console.log(`🔗 Calling ${method.name.toUpperCase()} ${endpoint}`);
      
      await method(endpoint, formData, {
        withCredentials: true,
      });
      await fetchProfile();
      alert(`${docType.charAt(0).toUpperCase() + docType.slice(1)} ${hasAnyDoc ? 'updated' : 'uploaded'} successfully!`);
    } catch (err) {
      console.error("Document upload error:", err);
      console.error("Response data:", err.response?.data);
      alert(err.response?.data?.message || "Failed to upload document");
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      verified: "bg-green-100 text-green-800",
      approved: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          styles[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate("/host/dashboard")}
            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const { mergedProfile, documents = [], kyc } = profileData || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/host/dashboard")}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                <FaArrowLeft className="text-xl" />
              </button>
              <h1 className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 bg-clip-text text-transparent">
                EventFlex
              </h1>
              <span className="text-gray-400">|</span>
              <span className="text-gray-700 font-medium">Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/host/profile/edit")}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
              >
                <FaEdit />
                <span>Edit Profile</span>
              </button>
              <button
                onClick={() => navigate("/host/dashboard")}
                className="px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg font-semibold transition-all duration-300"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar Section with Image Upload Modal */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg">
                {mergedProfile?.profile_image_url ? (
                  <img
                    src={mergedProfile.profile_image_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-white text-8xl" />
                )}
              </div>

              {/* Overlay on hover */}
              <div className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center cursor-pointer"
                onClick={() => setShowImageUpload(true)}>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center">
                  <FaCamera className="text-4xl mb-2 mx-auto" />
                  <p className="text-sm font-semibold">Change Photo</p>
                </div>
              </div>

              {uploadingImage && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-4xl font-bold text-gray-900 mb-3">
                {mergedProfile?.name || "Host User"}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <FaEnvelope className="text-purple-600 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">
                      {mergedProfile?.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start space-x-3">
                  <FaPhone className="text-purple-600 text-lg" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold text-gray-900">
                      {mergedProfile?.phone || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* KYC Status */}
              {kyc && (
                <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                  {kyc.status === "approved" ? (
                    <FaCheckCircle className="text-green-500 text-xl" />
                  ) : (
                    <FaClock className="text-yellow-500 text-xl" />
                  )}
                  <div>
                    <p className="text-sm text-gray-600">KYC Status</p>
                    <p className="font-semibold">
                      {getStatusBadge(kyc.status)}
                    </p>
                  </div>
                </div>
              )}

              {/* Edit Button */}
              <button
                onClick={() => navigate("/host/profile/edit")}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 mx-auto md:mx-0"
              >
                <FaEdit />
                <span>Edit All Details</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bio Section */}
        {mergedProfile?.bio && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">About</h3>
            <p className="text-gray-700 leading-relaxed">{mergedProfile.bio}</p>
          </div>
        )}

        {/* Location & Bank Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mergedProfile?.location &&
            Object.keys(mergedProfile.location).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-purple-600" />
                  <span>Location</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(mergedProfile.location).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-600 capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="font-semibold text-gray-900">
                        {typeof value === 'object' ? JSON.stringify(value) : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {mergedProfile?.bank_details &&
            Object.keys(mergedProfile.bank_details).length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <FaIdCard className="text-indigo-600" />
                  <span>Bank Details</span>
                </h3>
                <div className="space-y-3">
                  {Object.entries(mergedProfile.bank_details).map(
                    ([key, value]) => (
                      <div key={key}>
                        <p className="text-sm text-gray-600 capitalize">
                          {key.replace(/_/g, " ")}
                        </p>
                        <p className="font-semibold text-gray-900">
                          {typeof value === 'object' ? JSON.stringify(value) : value}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
        </div>

        {/* Documents Status Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Document Status
          </h3>
          
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FaFileSignature className="text-gray-400 text-5xl mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-600">
                Please upload any document first
              </p>
            </div>
          ) : (
            <div className="max-w-md">
              {documents.map((doc) => (
                <div
                  key={doc._id}
                  className="p-4 border-2 border-gray-200 rounded-lg hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <FaFileSignature className="text-purple-600" />
                      </div>
                      <p className="font-semibold text-gray-900 capitalize">
                        {doc.type}
                      </p>
                    </div>
                    
                    {doc.status === "verified" && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FaCheckCircle /> <span>Verified</span>
                      </span>
                    )}
                    {doc.status === "approved" && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FaCheckCircle /> <span>Approved</span>
                      </span>
                    )}
                    {doc.status === "pending" && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FaClock /> <span>Pending</span>
                      </span>
                    )}
                    {doc.status === "rejected" && (
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <FaTimesCircle /> <span>Rejected</span>
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-gray-600">
                    Uploaded: {new Date(doc.uploadedAt).toLocaleDateString('en-GB')}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload/Update Document Section */}
        {documents.length === 0 ? (
          // No Document - Show Upload Section
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center space-x-2 mb-6">
              <FaFileSignature className="text-purple-600" />
              <span>Upload Document</span>
            </h3>

            <div className="text-center py-8">
              <FaFileSignature className="text-gray-400 text-5xl mx-auto mb-3" />
              <p className="text-lg font-semibold text-gray-600">
                Upload a document
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Choose a document type and upload your file below
              </p>
            </div>

            <div className="max-w-2xl">
              <div className="space-y-4">
                {/* Document Type Selector */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Select Document Type
                  </label>
                  <select
                    value={uploadingDoc || ""}
                    onChange={(e) => setUploadingDoc(e.target.value || null)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-purple-600 focus:outline-none transition-colors"
                  >
                    <option value="">-- Choose Document Type --</option>
                    <option value="aadhaar">Aadhaar Card</option>
                    <option value="pan">PAN Card</option>
                    <option value="selfie">Selfie</option>
                    <option value="signature">Signature</option>
                  </select>
                </div>

                {/* File Upload Section */}
                {uploadingDoc && uploadingDoc !== "" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Choose File
                    </label>
                    <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-all">
                      <div className="text-center">
                        <FaUpload className="text-purple-600 text-4xl mx-auto mb-3" />
                        <p className="text-sm font-semibold text-gray-700">
                          Click to upload {uploadingDoc.charAt(0).toUpperCase() + uploadingDoc.slice(1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {uploadingDoc === "signature" ? "PNG, JPG up to 5MB" : "Images or PDF up to 5MB"}
                        </p>
                      </div>
                      <input
                        type="file"
                        accept={uploadingDoc === "signature" ? "image/*" : "image/*,application/pdf"}
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleDocumentUpload(uploadingDoc, e.target.files[0]);
                            setTimeout(() => setUploadingDoc(null), 1000);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Document Already Uploaded - Show View & Update Buttons Only
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            {!uploadingDoc || uploadingDoc === "" ? (
              // Buttons View
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const latestDoc = documents[0];
                    if (latestDoc.fileUrl) {
                      window.open(latestDoc.fileUrl, "_blank");
                    }
                  }}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <FaFileSignature className="text-lg" />
                  <span>View Document</span>
                </button>
                <button
                  onClick={() => {
                    setUploadingDoc("update");
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-md hover:shadow-lg"
                >
                  <FaEdit className="text-lg" />
                  <span>Update Document</span>
                </button>
              </div>
            ) : (
              // Update Form View
              <div className="max-w-2xl">
                <button
                  onClick={() => setUploadingDoc(null)}
                  className="mb-4 px-4 py-2 text-gray-600 hover:text-gray-900 font-semibold"
                >
                  ← Back
                </button>
                <div className="space-y-4">
                  {/* Document Type Selector */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Document Type
                    </label>
                    <select
                      value={uploadingDoc || ""}
                      onChange={(e) => setUploadingDoc(e.target.value || null)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-900 focus:border-purple-600 focus:outline-none transition-colors"
                    >
                      <option value="">-- Choose Document Type --</option>
                      <option value="aadhaar">Aadhaar Card</option>
                      <option value="pan">PAN Card</option>
                      <option value="selfie">Selfie</option>
                      <option value="signature">Signature</option>
                    </select>
                  </div>

                  {/* File Upload Section */}
                  {uploadingDoc && uploadingDoc !== "" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Choose File
                      </label>
                      <label className="flex items-center justify-center w-full px-4 py-8 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-all">
                        <div className="text-center">
                          <FaUpload className="text-purple-600 text-4xl mx-auto mb-3" />
                          <p className="text-sm font-semibold text-gray-700">
                            Click to upload new {uploadingDoc.charAt(0).toUpperCase() + uploadingDoc.slice(1)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {uploadingDoc === "signature" ? "PNG, JPG up to 5MB" : "Images or PDF up to 5MB"}
                          </p>
                        </div>
                        <input
                          type="file"
                          accept={uploadingDoc === "signature" ? "image/*" : "image/*,application/pdf"}
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleDocumentUpload(uploadingDoc, e.target.files[0]);
                              setTimeout(() => setUploadingDoc(null), 1000);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Logout Button */}
        <div className="flex items-center justify-center mb-8">
          <button
            onClick={handleLogout}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-semibold hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </main>

      {/* Image Upload Modal */}
      {showImageUpload && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              Change Profile Photo
            </h3>

            <div className="space-y-4">
              {/* Upload New Image */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Upload New Photo
                </label>
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-purple-300 rounded-lg cursor-pointer hover:border-purple-600 hover:bg-purple-50 transition-all duration-300">
                  <div className="text-center">
                    <FaCamera className="text-purple-600 text-3xl mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">
                      Click to upload
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </label>
              </div>

              {mergedProfile?.profile_image_url && (
                <button
                  onClick={handleDeleteImage}
                  className="w-full px-4 py-3 border-2 border-red-300 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <FaTrash />
                  <span>Remove Current Photo</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setShowImageUpload(false)}
                disabled={uploadingImage}
                className="w-full px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                Cancel
              </button>
            </div>

            {uploadingImage && (
              <div className="mt-4 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-gray-600">Uploading...</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HostProfileView;
