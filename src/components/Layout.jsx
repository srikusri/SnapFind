import React from 'react';
import Header from './Header';
import BottomNav from './BottomNav';

const Layout = ({ children }) => {
    return (
        <div className="app-shell">
            <Header />
            <main className="container">
                {children}
            </main>
            <BottomNav />
        </div>
    );
};

export default Layout;
