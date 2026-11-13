import { useId, useRef, useState } from "react";
import CustomerMenuOverlay from "../navigation/CustomerMenuOverlay";
import CustomerNavigationLinks from "../navigation/CustomerNavigationLinks.jsx";
import MenuOverlay from "../navigation/not-logged-in-menuOverlay";
import garageGloLogo from "../../assets/GarageGloLogo.svg";
import menuIcon from "../../assets/Hamburger-Menu.svg";

//set up label and refereces
//for future use of buttons and scrolling to sections
const customerNav = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Calendar", href: "#calendar" },
  { label: "Contact", href: "#contact" },
];

export default function Header({
  role = "customer",
  isHome = false,
  isSignedIn = false,
  showNavigation = false,
  customerMenuContent,
  customerMenuActions,
  adminMenuContent,
}) {
  const showCustomerNav = role === "customer" && (isHome || showNavigation);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showCustomerMenu = role === "customer" && isSignedIn;
  const showAdminMenu = role === "admin" && isSignedIn;
  const menuId = useId();
  const menuTriggerRef = useRef(null);

  return (
    <header
      className="
                sticky top-0 z-50
                grid min-h-17.5 grid-cols-[1fr_auto] items-center
                bg-[#323232] px-3.5 py-2
                shadow-[0_5px_8px_rgba(0,0,0,0.35)]
                md:min-h-21.25 md:grid-cols-[auto_1fr_auto] md:px-4.5
                lg:min-h-25 lg:px-6
            "
    >
      {/* Inserting logo png */}
      <a href="/" className="garage-glo-logo" aria-label="GloPortal home">
        <img
          src={garageGloLogo}
          alt="Garage Glo Logo"
          className="
                        block size-15 object-contain
                        md:size-18 lg:size-22.5
                    "
        />
      </a>

      {/* Inserting navigation when needed */}
      {showCustomerNav && (
        <nav
          aria-label="Homepage navigation"
          className="
                    hidden items-center justify-self-end
                    gap-5 md:flex
                    md:mr-15
                    lg:mr-20 lg:gap-13.5
                "
        >
          {customerNav.map((link) => (
            <a
              key={link.label}
              href={isHome ? link.href : `/${link.href}`}
              className="
                            whitespace-nowrap text-xl font-semibold
                            text-[#D9D9D9] no-underline
                            hover:text-white
                            md:text-[22px]
                            lg:text-[38px]
                        "
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}

      {/* Inserting hamburger menu */}
      <button
        ref={menuTriggerRef}
        type="button"
        className="
                    col-start-2 flex size-10.5
                    cursor-pointer items-center justify-center
                    justify-self-end
                    border-none bg-transparent p-0
                    md:col-start-3
                    md:size-12 lg:size-15
                "
        aria-label="Open menu"
        aria-haspopup={showCustomerMenu || showAdminMenu ? "dialog" : undefined}
        aria-expanded={
          showCustomerMenu || showAdminMenu ? isMenuOpen : undefined
        }
        aria-controls={
          (showCustomerMenu || showAdminMenu) && isMenuOpen ? menuId : undefined
        }
        onClick={() => setIsMenuOpen(true)}
      >
        <img
          src={menuIcon}
          alt="Menu"
          className="
                        block size-10.5 md:size-12 lg:size-15
                    "
        />
      </button>

      {showCustomerMenu || showAdminMenu ? (
        <CustomerMenuOverlay
          id={menuId}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          returnFocusRef={menuTriggerRef}
          menuLabel={showAdminMenu ? "Admin" : "Customer"}
        >
          {showAdminMenu ? adminMenuContent : (
            <>
              {customerMenuContent ?? (
                <CustomerNavigationLinks onNavigate={() => setIsMenuOpen(false)} />
              )}
              {customerMenuActions}
            </>
          )}
        </CustomerMenuOverlay>
      ) : (
        <MenuOverlay isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
      )}
    </header>
  );
}
