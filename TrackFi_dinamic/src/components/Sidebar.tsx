import { Link } from "@tanstack/react-router";
import type { NavId, NavigationItem } from "../data";
import { navigationItems as navItems } from "../data";
import { Icon } from "./icons/Icon";

type SidebarProps = {
  activeId: NavId;
  onNavigate: () => void;
};

function Sidebar({ activeId, onNavigate }: SidebarProps) {
  const primaryItems = navItems.filter((item) => item.id !== "settings");
  const secondaryItems = navItems.filter((item) => item.id === "settings");

  return (
    <aside className="sidebar" id="sidebar">
      <nav className="sidebar__nav" aria-label="Primary navigation">
        <div className="sidebar__groups">
          <SidebarList activeId={activeId} items={primaryItems} onNavigate={onNavigate} />
          <SidebarList activeId={activeId} extraClassName="sidebar__list--secondary" items={secondaryItems} onNavigate={onNavigate} />
        </div>
      </nav>
    </aside>
  );
}

function SidebarList({
  activeId,
  extraClassName = "",
  items,
  onNavigate,
}: {
  activeId: NavId;
  extraClassName?: string;
  items: NavigationItem[];
  onNavigate: () => void;
}) {
  return (
    <ul className={`sidebar__list ${extraClassName}`}>
      {items.map((item) => (
        <li className="sidebar__list-item" key={item.id}>
          <Link
            className={`sidebar__item ${item.id === activeId ? "is-active" : ""}`}
            to={item.to}
            aria-current={item.id === activeId ? "page" : undefined}
            onClick={onNavigate}
          >
            <span className={`sidebar__icon sidebar__icon--${item.icon}`} aria-hidden="true">
              <Icon name={item.icon} />
            </span>
            <span className="sidebar__label">{item.label}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default Sidebar;
