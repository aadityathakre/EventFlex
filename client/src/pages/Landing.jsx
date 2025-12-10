import React, { useState } from 'react';
import LandingPageHero from '../components/LandingPageHero';
import LandingPageHowItWorksSection from '../components/LandingPageHowItWorksSection';
import LandingPageCategoriesSection from '../components/LandingPageCategoriesSection';
import LandingPageFeaturedActivitiesSection from '../components/LandingPageFeaturedActivitiesSection';
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
            <LandingPageHowItWorksSection />
            <LandingPageCategoriesSection />
            <LandingPageFeaturedActivitiesSection />
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