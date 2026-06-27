import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
import SidebarWidget from "./SidebarWidget";
import { useAuth } from "../../context/AuthContext";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const generateNavItems = (role: string): NavItem[] => {
  const baseItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Overview",
      path: "/admin",
    },
    {
      icon: <UserCircleIcon />,
      name: "Users",
      path: "/admin/users",
    },
    {
      icon: <PageIcon />,
      name: "KTM Verification",
      path: "/admin/ktm",
    },
    {
      icon: <TableIcon />,
      name: "Items Moderation",
      path: "/admin/items",
    },
    {
      icon: <ListIcon />,
      name: "Transactions",
      path: "/admin/transactions",
    },
    {
      icon: <BoxCubeIcon />,
      name: "Categories",
      path: "/admin/categories",
    },
    {
      icon: <PieChartIcon />,
      name: "Finance",
      path: "/admin/finance",
    },
    {
      icon: <CalenderIcon />,
      name: "Reports",
      path: "/admin/reports",
    }
  ];

  return baseItems;
};

const othersItems: NavItem[] = [];

const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const { logout, user } = useAuth();
  const location = useLocation();

  const navItems = generateNavItems(user?.role || "ADMIN");

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // const isActive = (path: string) => location.pathname === path;
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "others"].forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-purple-900/30 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                  : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
              } cursor-pointer rounded-xl px-4 py-3 ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size transition-colors ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "text-purple-400 fill-purple-400"
                    : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-purple-400"
                      : "text-gray-400"
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group rounded-xl px-4 py-3 transition-all ${
                  isActive(nav.path) 
                    ? "bg-purple-900/30 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]" 
                    : "text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5"
                }`}
              >
                <span
                  className={`menu-item-icon-size transition-colors ${
                    isActive(nav.path)
                      ? "text-purple-400 fill-purple-400"
                      : "text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item px-4 py-2 rounded-lg transition-colors ${
                        isActive(subItem.path)
                          ? "text-purple-400 bg-purple-900/20"
                          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 ${user?.role === 'OWNER' ? 'bg-[#0f111a] text-white border-[#2d2e42]' : 'bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900'} h-screen transition-all duration-300 ease-in-out z-50 border-r 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <div className="flex items-center gap-2">
              <span className="text-3xl drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">👑</span>
              <span className="text-xl font-extrabold bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent tracking-wide">
                CampusRent <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/50 align-top ml-1">PRO</span>
              </span>
            </div>
          ) : (
            <span className="text-3xl drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]">👑</span>
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  "Menu"
                ) : (
                  <HorizontaLDots className="size-6" />
                )}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>
            
            <div className="mt-6 border-t border-gray-200 dark:border-gray-800 pt-4 flex flex-col gap-4">
              
              {/* Badge Dinamis berdasarkan Role */}
              {(isExpanded || isHovered || isMobileOpen) && (
                user?.role === "OWNER" ? (
                  <div className="mx-2 p-4 rounded-2xl bg-gradient-to-br from-violet-600 via-fuchsia-600 to-indigo-700 text-white shadow-[0_10px_25px_rgba(168,85,247,0.4)] transform transition hover:scale-105 border border-purple-400/30 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 animate-pulse"></div>
                    <div className="relative z-10 flex flex-col items-center">
                      <span className="text-2xl mb-1 drop-shadow-md animate-bounce">👑</span>
                      <p className="text-xs font-black tracking-widest uppercase mb-1 drop-shadow-sm text-center">BOS BESAR KECE</p>
                      <p className="text-[10px] opacity-90 font-medium text-center bg-black/20 px-2 py-1 rounded-full">Pantau terus bestie! 💅✨</p>
                    </div>
                  </div>
                ) : (
                  <div className="mx-2 p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-center shadow-lg transform transition hover:scale-105">
                    <p className="text-xs font-bold tracking-widest uppercase mb-0.5 shadow-sm">🛡️ ADMIN SIGAP</p>
                    <p className="text-[10px] opacity-90 font-medium">Semangat kerjanya kanda! ☕💪</p>
                  </div>
                )
              )}

              <button 
                onClick={logout}
                className={`menu-item group menu-item-inactive cursor-pointer w-full text-left ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"
                }`}
              >
                <span className="menu-item-icon-size menu-item-icon-inactive">
                   <PlugInIcon /> 
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">Logout</span>
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default AppSidebar;
