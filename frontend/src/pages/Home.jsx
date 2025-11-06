import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { MapPin, Smartphone, Sparkles } from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuthStore();

  return (
    <div className="min-h-screen dark:bg-dark-bg bg-light-bg">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal rounded flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="text-xl font-bold dark:text-white text-gray-900">EventFlex</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/#hosts" className="dark:text-white text-gray-900 hover:text-teal">For Hosts</Link>
            <Link to="/#organizers" className="dark:text-white text-gray-900 hover:text-teal">For Organizers</Link>
            <Link to="/#gig-workers" className="dark:text-white text-gray-900 hover:text-teal">For Gig Workers</Link>
          </nav>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link to={`/dashboard/${user?.role}`} className="btn btn-teal">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-outline">
                  Login
                </Link>
                <Link to="/register" className="btn btn-teal">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold dark:text-white text-gray-900 mb-6 leading-tight">
              Smart On-Demand Platform for{' '}
              <span className="text-teal">Event Staffing</span>
            </h1>
            <p className="text-xl dark:text-gray-300 text-gray-700 mb-8">
              Seamlessly connect with top tier event professionals across India. Our AI powered platform makes staffing your events faster, smarter, and more reliable than ever before.
            </p>
            <div className="flex gap-4">
              <Link to="/register?role=host" className="btn btn-teal text-lg px-8 py-3">
                Join as Host
              </Link>
              <Link to="/register?role=gig" className="btn btn-yellow text-lg px-8 py-3">
                Join as Gig Worker
              </Link>
            </div>
            <p className="mt-4 text-sm dark:text-gray-400 text-gray-600">
              Are you an organizer?{' '}
              <Link to="/register?role=organizer" className="text-teal hover:underline">
                Get started here.
              </Link>
            </p>
          </div>
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-900 dark:to-gray-800 rounded-[2.5rem] p-3 aspect-[9/16] max-w-xs mx-auto shadow-2xl">
                {/* Phone Frame */}
                <div className="w-full h-full bg-gradient-to-br from-teal/10 to-teal/5 rounded-[2rem] overflow-hidden relative">
                  {/* Phone Screen Content */}
                  <div className="absolute inset-0 p-4">
                    <div className="w-full h-full bg-gradient-to-b from-dark-card to-dark-bg rounded-xl flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-teal rounded-full flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-2xl">E</span>
                      </div>
                      <h3 className="text-white font-bold text-lg mb-2">EventFlex</h3>
                      <p className="text-gray-400 text-xs text-center px-4">Event Management</p>
                    </div>
                  </div>
                  {/* Home Indicator */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full"></div>
                </div>
              </div>
            </div>
            {/* Decorative Background Elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-teal/20 rounded-full blur-2xl"></div>
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow/20 rounded-full blur-2xl"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 dark:bg-dark-card bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold dark:text-white text-gray-900 mb-4">
              Why EventFlex is the Future of Event Staffing
            </h2>
            <p className="text-xl dark:text-gray-300 text-gray-700 max-w-2xl mx-auto">
              We've built a comprehensive ecosystem to empower every participant in the event industry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card text-center">
              <div className="w-20 h-20 bg-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-10 h-10 text-teal" />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-3">Nationwide Coverage</h3>
              <p className="dark:text-gray-400 text-gray-600">
                Access a vast, verified network of event professionals across every corner of India. From metro cities to remote locations, we have you covered.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-20 h-20 bg-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-10 h-10 text-teal" />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-3">Powerful Mobile App</h3>
              <p className="dark:text-gray-400 text-gray-600">
                Manage your events, staff, schedules, and payments on the go with our intuitive, feature-rich mobile application for all users.
              </p>
            </div>

            <div className="card text-center">
              <div className="w-20 h-20 bg-teal/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-teal" />
              </div>
              <h3 className="text-xl font-bold dark:text-white text-gray-900 mb-3">AI-Powered Matching</h3>
              <p className="dark:text-gray-400 text-gray-600">
                Our intelligent algorithm connects you with the perfect staff based on skills, experience, ratings, and proximity to your event location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold dark:text-white text-gray-900 mb-4">
            Ready to Elevate Your Next Event?
          </h2>
          <p className="text-xl dark:text-gray-300 text-gray-700 mb-8">
            Join the revolution in event staffing. Whether you're hosting, organizing, or looking for flexible work. EventFlex is your ultimate partner.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register?role=host" className="btn btn-teal text-lg px-8 py-3">
              Join as Host/Organizer
            </Link>
            <Link to="/register?role=gig" className="btn btn-yellow text-lg px-8 py-3">
              Join as Gig Worker
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <p className="text-sm dark:text-gray-400 text-gray-600">
            © 2024 EventFlex. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/about" className="dark:text-gray-400 text-gray-600 hover:text-teal">About Us</Link>
            <Link to="/contact" className="dark:text-gray-400 text-gray-600 hover:text-teal">Contact</Link>
            <Link to="/privacy" className="dark:text-gray-400 text-gray-600 hover:text-teal">Privacy Policy</Link>
            <Link to="/terms" className="dark:text-gray-400 text-gray-600 hover:text-teal">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
