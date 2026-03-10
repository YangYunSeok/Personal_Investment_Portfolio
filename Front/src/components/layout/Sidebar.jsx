import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Database, ClipboardList, TrendingUp, Settings, PieChart } from 'lucide-react';
import styles from './Layout.module.css';

const Sidebar = () => {
    const location = useLocation();

    const menuItems = [
        {
            title: '대시보드',
            path: '/dashboard',
            icon: <PieChart size={20} />,
        },
        {
            title: '메타 마스터 관리',
            path: '/meta-master',
            icon: <Database size={20} />,
        },
        {
            title: '투자 원장',
            path: '/activity-log',
            icon: <ClipboardList size={20} />,
        },
        {
            title: '보유 자산',
            path: '/positions',
            icon: <LayoutDashboard size={20} />,
        },
        {
            title: '환전(FX)',
            path: '/fx',
            icon: <ClipboardList size={20} />,
        },
    ];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <TrendingUp className={styles.logoIcon} />
                    <span className={styles.logoText}>PIP</span>
                </div>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path} className={styles.navItem}>
                                <Link
                                    to={item.path}
                                    className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                                >
                                    <span className={styles.icon}>{item.icon}</span>
                                    <span className={styles.title}>{item.title}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.settingsLink}>
                    <Settings size={20} />
                    <span>Settings</span>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
