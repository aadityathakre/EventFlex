import React from 'react';
import LandingPageHero from '../components/LandingPageHero';
import LandingPageHowItWorksSection from '../components/LandingPageHowItWorksSection';
import LandingPageCategoriesSection from '../components/LandingPageCategoriesSection';
import LandingPageFeaturedActivitiesSection from '../components/LandingPageFeaturedActivitiesSection';
import LandingPageFooter from '../components/LandingPageFooter';

function Landing() {
    return (
        <>
            <LandingPageHero />
            <LandingPageHowItWorksSection />
            <LandingPageCategoriesSection />
            <LandingPageFeaturedActivitiesSection />
            <LandingPageFooter />
        </>
    );
}

export default Landing;