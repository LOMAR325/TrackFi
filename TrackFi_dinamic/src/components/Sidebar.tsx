function Sidebar() {
    return (
        <aside className="sidebar">
            <h1 className="sidebar__logo">TrackFi</h1>

            <nav className="sidebar__nav">
                <a href="#" className="sidebar__link">
                    Dashboard
                </a>
                <a href="#" className="sidebar__link">
                    Analytics
                </a>
                <a href="#" className="sidebar__link">
                    Categories
                </a>
                <a href="#" className="sidebar__link">
                    Goals
                </a>
                <a href="#" className="sidebar__link">
                    Settings
                </a>
            </nav>
        </aside>
    );
}

export default Sidebar;
