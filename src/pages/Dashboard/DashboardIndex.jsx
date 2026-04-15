import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ParentOverview from './ParentOverview';
import DashboardOverview from './DashboardOverview';
import InstructorOverview from './InstructorOverview';
import AdminOverview from './AdminOverview';

const DashboardIndex = () => {
    const { user } = useAuth();
    const role = user?.role || 'student';

    switch (role) {
        case 'admin':
            return <AdminOverview />;
        case 'instructor':
            return <InstructorOverview />;
        case 'parent':
            return <ParentOverview />;
        case 'student':
        default:
            return <DashboardOverview />;
    }
};

export default DashboardIndex;
