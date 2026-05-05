import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAppState } from "../app/AppContext";
import { BrandIcon, Icon } from "./icons/Icon";

type HeaderProps = {
  onToggleSidebar: () => void;
  sidebarOpen: boolean;
};

function Header({ onToggleSidebar, sidebarOpen }: HeaderProps) {
  const { userName } = useAppState();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="app-header__left">
        <button
          className="header-menu-toggle"
          type="button"
          aria-label="Toggle navigation"
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        >
          <Icon name="menu" />
        </button>
        <Link className="brand" to="/dashboard" aria-label="TrackFi dashboard">
          <span className="brand__icon" aria-hidden="true">
            <BrandIcon />
          </span>
          <span className="brand__label">TrackFi</span>
        </Link>
      </div>

      <div className={`user-dropdown ${menuOpen ? "is-open" : ""}`}>
        <button
          className="user-dropdown__trigger"
          type="button"
          aria-haspopup="true"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="user-dropdown__avatar" aria-hidden="true">
            {userName.slice(0, 1).toUpperCase()}
          </span>
          <span className="user-dropdown__name">{userName}</span>
          <span className="user-dropdown__chevron" aria-hidden="true">
            <Icon name="chevron" />
          </span>
        </button>
        <div className="user-dropdown__menu" role="menu" aria-label="User menu">
          <Link className="user-dropdown__menu-item" role="menuitem" to="/" onClick={() => setMenuOpen(false)}>
            Sign Out
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
