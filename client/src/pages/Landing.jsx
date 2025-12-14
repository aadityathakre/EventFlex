import React, { useState } from 'react';
import LandingPageHero from '../components/LandingPageHero';
import LandingPageStatsSection from '../components/LandingPageStatsSection';
import LandingPageRolesSection from '../components/LandingPageRolesSection';
import LandingPageHowItWorksSection from '../components/LandingPageHowItWorksSection';
import LandingPageTestimonialsSection from '../components/LandingPageTestimonialsSection';
import LandingPageFooter from '../components/LandingPageFooter';
import AuthDialog from '../components/AuthDialog';

function Landing() {
    const [authDialogOpen, setAuthDialogOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');

    const openAuthDialog = (mode = 'login') => {
        setAuthMode(mode);
        setAuthDialogOpen(true);
    };

    const closeAuthDialog = () => {
        setAuthDialogOpen(false);
    };

    return (
        <>
            <LandingPageHero onOpenAuth={openAuthDialog} />
            <LandingPageStatsSection />
            <LandingPageRolesSection />
            <LandingPageHowItWorksSection />
            <LandingPageTestimonialsSection />
            <LandingPageFooter />
            <AuthDialog
                isOpen={authDialogOpen}
                onClose={closeAuthDialog}
                initialMode={authMode}
            />
        </>
    );
}

export default Landing;