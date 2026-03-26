import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SidebarItem = ({ icon, label, to, open, subItems }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const itemRef = useRef(null);
  const dropdownRef = useRef(null); // Ref for the dropdown menu
  const location = useLocation();
  const navigate = useNavigate();

  const isSubItemActive =
    subItems && subItems.some((item) => location.pathname.startsWith(item.to));

  const toggleDropdown = () => {
    if (!subItems) return;
    setDropdownOpen((prev) => !prev);
  };

  // Effect to position the fixed dropdown
  useEffect(() => {
    const itemEl = itemRef.current;
    const dropdownEl = dropdownRef.current;

    // Do nothing if elements aren't ready or dropdown is closed
    if (!isDropdownOpen || !itemEl || !dropdownEl) return;

    // Function to calculate and set position
    const positionDropdown = () => {
      const itemRect = itemEl.getBoundingClientRect();

      // Get viewport-relative coordinates from the item
      const top = itemRect.top;
      const left = itemRect.right; // Position just to the right of the item

      // Apply styles to the 'fixed' dropdown
      dropdownEl.style.top = `${top}px`;
      dropdownEl.style.left = `${left + 8}px`; // 8px gap
    };

    // Position it immediately
    positionDropdown();

    // Find the nearest scrolling parent (the <aside>) to update on scroll
    const scrollParent = itemEl.closest("aside");

    // Add event listeners to keep it in place on scroll/resize
    window.addEventListener("resize", positionDropdown);
    if (scrollParent) {
      scrollParent.addEventListener("scroll", positionDropdown);
    }

    // Cleanup listeners
    return () => {
      window.removeEventListener("resize", positionDropdown);
      if (scrollParent) {
        scrollParent.removeEventListener("scroll", positionDropdown);
      }
    };
  }, [isDropdownOpen]); // Re-run only when the dropdown opens/closes

  // Close dropdown on outside click
  useEffect(() => {
    const closeDropdown = (e) => {
      // Check for itemRef *and* dropdownRef
      if (
        itemRef.current &&
        !itemRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => {
      document.removeEventListener("mousedown", closeDropdown);
    };
  }, []); // Empty dependency array, runs once

  const mainTo = to;

  return (
    // We do NOT add 'relative' here, as the dropdown will be 'fixed'
    <div ref={itemRef} className="select-none">
      {/* Main Item */}
      <div
        role="button"
        tabIndex={0}
        className={`flex w-full text-sm text-white/80 hover:bg-white/10 items-center space-x-3 px-4 py-2 rounded-md transition duration-200 cursor-pointer hover:bg-accent hover:text-accent-foreground${
          location.pathname === mainTo || isSubItemActive
            ? "bg-white text-[#1d4ed8] font-semibold"
            : "hover:bg-[#3b6ef3] hover:text-white text-white"
        }`}
        onClick={() => {
          if (subItems) {
            toggleDropdown();
          } else {
            navigate(to);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            subItems ? toggleDropdown() : navigate(to);
          }
        }}
      >
        <span className="text-lg">{icon}</span>
        {open && <span className="text-sm">{label}</span>}
        {subItems && (
          <span
            className={`ml-auto transform transition-transform ${
              isDropdownOpen ? "rotate-90" : ""
            } ${
              // Hide arrow when sidebar is closed (icons only)
              !open ? "hidden" : ""
            }`}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        )}
      </div>

      {/* Sub Items Dropdown (Custom in DOM, not portal) */}
      {subItems && (
        <div
          ref={dropdownRef} // Add the ref
          // Use `fixed` positioning, remove all old positioning classes
          className={`z-50 fixed w-[200px] bg-slate-800 rounded-lg shadow-xl border border-blue-100 overflow-hidden transition-all duration-200 origin-top ${
            isDropdownOpen
              ? "scale-y-100 opacity-100"
              : "scale-y-0 opacity-0 pointer-events-none"
          }`}
          // Animate from the top-left corner
          style={{ transformOrigin: "top left" }}
        >
          {subItems.map((item, idx) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <div
                key={idx}
                onClick={() => {
                  navigate(item.to);
                  setDropdownOpen(false);
                }}
                className={`px-5 py-2 text-sm font-medium cursor-pointer transition-colors ${
                  isActive
                    ? "bg-slate-500 text-white/80"
                    : "hover:bg-slate-700 text-white hover:text-white/90"
                }`}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SidebarItem;
