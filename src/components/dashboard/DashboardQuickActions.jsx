import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaBoxOpen,
  FaClipboardList,
  FaHandshake,
  FaSearch,
  FaShoppingCart,
  FaTimes,
  FaUser,
  FaStar,
  FaTicketAlt,
} from "react-icons/fa";
import { getDashboardSearchResults, useDashboardData } from "./DashboardDataContext";

const notificationIcons = {
  order: <FaShoppingCart className="text-[#C6922B]" />,
  customer: <FaUser className="text-blue-400" />,
  partner: <FaHandshake className="text-blue-400" />,
  application: <FaHandshake className="text-[#C6922B]" />,
  product: <FaBoxOpen className="text-red-400" />,
  request: <FaClipboardList className="text-[#C6922B]" />,
  coupon: <FaTicketAlt className="text-[#C6922B]" />,
  review: <FaStar className="text-yellow-400" />,
};

export default function DashboardQuickActions({ role }) {
  const navigate = useNavigate();
  const { records, errors, notifications, unreadCount, markNotificationRead, markAllNotificationsRead } = useDashboardData();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchRef = useRef(null);
  const notificationsRef = useRef(null);
  const results = useMemo(() => getDashboardSearchResults(role, records, query), [role, records, query]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) setSearchOpen(false);
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) setNotificationsOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setMobileSearch(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const selectResult = (path) => {
    navigate(path);
    setQuery("");
    setSearchOpen(false);
    setMobileSearch(false);
  };

  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <div ref={searchRef} className="relative">
        <div className="hidden md:flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 focus-within:border-[#C6922B]">
          <FaSearch className="shrink-0 text-sm text-gray-500" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSearchOpen(true);
            }}
            onFocus={() => query && setSearchOpen(true)}
            aria-label={`Search ${role} dashboard`}
            placeholder="Search dashboard..."
            className="w-40 bg-transparent text-sm outline-none placeholder:text-gray-500 xl:w-56"
          />
          {query && (
            <button type="button" onClick={() => { setQuery(""); setSearchOpen(false); }} aria-label="Clear search" className="text-gray-500 hover:text-white">
              <FaTimes />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setMobileSearch((open) => !open)}
          aria-label={mobileSearch ? "Close search" : "Open search"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:border-[#C6922B] md:hidden"
        >
          {mobileSearch ? <FaTimes /> : <FaSearch />}
        </button>
        {mobileSearch && (
          <div className="absolute right-0 top-12 z-[70] w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-white/10 bg-[#111] p-3 shadow-2xl md:hidden">
            <input
              autoFocus
              value={query}
              onChange={(event) => { setQuery(event.target.value); setSearchOpen(true); }}
              aria-label={`Search ${role} dashboard`}
              placeholder="Search dashboard items..."
              className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-sm outline-none focus:border-[#C6922B]"
            />
            {renderResults()}
          </div>
        )}
        {searchOpen && !mobileSearch && query.trim() && (
          <div className="absolute right-0 top-12 z-[70] hidden max-h-[min(70vh,32rem)] w-80 overflow-y-auto rounded-xl border border-white/10 bg-[#111] shadow-2xl md:block">
            {renderResults()}
          </div>
        )}
      </div>

      <div ref={notificationsRef} className="relative">
        <button
          type="button"
          onClick={() => setNotificationsOpen((open) => !open)}
          aria-label={`Notifications, ${unreadCount} unread`}
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:border-[#C6922B]"
        >
          <FaBell />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C6922B] px-1 text-[9px] font-black text-black">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>
        {notificationsOpen && (
          <div className="absolute right-0 top-12 z-[70] w-[min(20rem,calc(100vw-1.5rem))] overflow-hidden rounded-xl border border-white/10 bg-[#111] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3">
              <strong className="text-sm">Notifications</strong>
              {unreadCount > 0 && (
                <button type="button" onClick={markAllNotificationsRead} className="text-[10px] uppercase tracking-wider text-[#C6922B] hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            {errors.length > 0 && (
              <p role="alert" className="border-y border-red-500/20 bg-red-500/10 px-4 py-2 text-xs text-red-300">
                Some dashboard updates could not be loaded ({errors.join(", ")}).
              </p>
            )}
            <div className="max-h-72 overflow-y-auto divide-y divide-white/5">
              {notifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-gray-500">No updates yet</p>
              ) : notifications.map((notification) => (
                <button
                  type="button"
                  key={notification.id}
                  onClick={() => {
                    markNotificationRead(notification.id);
                    setNotificationsOpen(false);
                    navigate(notification.path);
                  }}
                  className={`flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-white/5 ${notification.read ? "" : "bg-white/[0.03]"}`}
                >
                  <span className="mt-0.5 shrink-0">{notificationIcons[notification.type] || <FaBell className="text-gray-400" />}</span>
                  <span className="min-w-0 flex-1">
                    <span className={`block text-xs leading-snug ${notification.read ? "text-gray-400" : "text-white"}`}>{notification.message}</span>
                    <span className="mt-1 block text-[10px] text-gray-600">{notification.time}</span>
                  </span>
                  {!notification.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#C6922B]" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  function renderResults() {
    if (errors.length > 0 && records.length === 0) {
      return <p role="alert" className="px-4 py-3 text-xs text-red-300">Could not load searchable dashboard items.</p>;
    }
    if (results.length === 0) {
      return <p className="px-4 py-3 text-sm text-gray-500">{query.trim() ? `No results for "${query}"` : "Type to search dashboard items"}</p>;
    }
    return results.map((result) => (
      <button
        type="button"
        key={result.key}
        onClick={() => selectResult(result.path)}
        className="block w-full border-b border-white/5 px-4 py-3 text-left last:border-0 hover:bg-white/5"
      >
        <span className="block truncate text-sm text-white">{result.label}</span>
        <span className="block truncate text-[10px] text-gray-500">{result.subtitle}</span>
      </button>
    ));
  }
}
