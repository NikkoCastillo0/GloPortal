import { useEffect, useId, useRef, useState } from "react";
import { supabase } from "../../lib/supabase.js";
import CustomerMenuOverlay from "../navigation/CustomerMenuOverlay";
import AdminNavigationLinks from "../navigation/AdminNavigationLinks.jsx";
import CustomerNavigationLinks from "../navigation/CustomerNavigationLinks.jsx";
import MenuOverlay from "../navigation/not-logged-in-menuOverlay";
import garageGloLogo from "../../assets/GarageGloLogo.svg";
import menuIcon from "../../assets/Hamburger-Menu.svg";

const homeMenuLinks = [
  { label: "Home", href: "#home" },
  { label: "Services", href: "#services" },
  { label: "Calendar", href: "#calendar" },
  { label: "Contact", href: "#contact" },
];

const customerPortalLinks = [
  { label: "Customer Dashboard", href: "/customerportal"},
  { label: "Book Appointment", href: "/monthlybooking"},
  { label: "My Vehicles", href: "/viewvehicle"},
  { label: "Add Vehicle", href: "/addvehicle"},
  { label: "Edit Profile", href: "/editprofile"},
];

const adminPortalLinks = [
  { label: "Admin Dashboard", href: "/adminportal"},
  { label: "Appointment Requests", href: "/viewappointmentrequests"},
  { label: "Appointments", href: "/viewappointments"},
  { label: "Inventory", href: "/viewinventory"},
  { label: "Services", href: "/editservices"},
]

export default function Header({
  role = "customer",
  isHome = false,
}) {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [authenticatedRole, setAuthenticatedRole] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuId = useId();
  const menuTriggerRef = useRef(null);

  useEffect(() => {
    const loadUserRole = async (session) => {
      setIsSignedIn(!!session);

      if (!session) {
        setAuthenticatedRole(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Could not load user role:", error.message);
        setAuthenticatedRole(null);
        return;
      }

      setAuthenticatedRole(data.role);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUserRole(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      loadUserRole(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Could not sign out:", error.message);
      return;
    }

    setIsMenuOpen(false);
  };

  const showCustomerNav = isHome;
  const activeRole = authenticatedRole ?? role;
  const showCustomerMenu = activeRole === "customer" && isSignedIn;
  const showAdminMenu = activeRole === "admin" && isSignedIn;

  const menuLinks = isHome
    ? homeMenuLinks
    : activeRole === "admin"
      ? adminPortalLinks
      : customerPortalLinks;

  // Signed-in customers use the regular menu on the homepage.
  // Other signed-in users use the customer/admin overlay.
  const showAccountOverlay = !isHome && (showAdminMenu || showCustomerMenu);

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
    <a
      href="/"
      className="garage-glo-logo inline-flex w-fit justify-self-start"
      aria-label="GloPortal home"
    >        
        <img
          src={garageGloLogo}
          alt="Garage Glo Logo"
          className="block size-15 object-contain md:size-18 lg:size-22.5"
        />
      </a>

      {showCustomerNav && (
        <nav
          aria-label="Homepage navigation"
          className="
            hidden items-center justify-self-end
            gap-5 md:mr-15 md:flex
            lg:mr-20 lg:gap-13.5
          "
        >
          {homeMenuLinks.map((link) => (
            <a
              key={link.label}
              href={isHome ? link.href : `/${link.href}`}
              className="
                whitespace-nowrap text-xl font-semibold
                text-[#D9D9D9] no-underline hover:text-white
                md:text-[22px] lg:text-[38px]
              "
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}

      <button
        ref={menuTriggerRef}
        type="button"
        className="
          col-start-2 flex size-10.5 cursor-pointer
          items-center justify-center justify-self-end
          border-none bg-transparent p-0
          md:col-start-3 md:size-12 lg:size-15
        "
        aria-label="Open menu"
        aria-haspopup={showAccountOverlay ? "dialog" : undefined}
        aria-expanded={showAccountOverlay ? isMenuOpen : undefined}
        aria-controls={showAccountOverlay && isMenuOpen ? menuId : undefined}
        onClick={() => setIsMenuOpen(true)}
      >
        <img
          src={menuIcon}
          alt="Menu"
          className="block size-10.5 md:size-12 lg:size-15"
        />
      </button>

      {showAccountOverlay ? (
        <CustomerMenuOverlay
          id={menuId}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          returnFocusRef={menuTriggerRef}
          menuLabel={showAdminMenu ? "Admin" : "Customer"}
        >
        {menuLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            onClick={() => setIsMenuOpen(false)}
            className="block rounded-lg px-4 py-3 font-semibold text-black transition hover:bg-gray-100"
          >
            {link.label}
          </a>
        ))}

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full rounded-lg bg-black px-4 py-3 font-semibold text-white"
        >
          Sign Out
        </button>        
</CustomerMenuOverlay>
      ) : (
        <MenuOverlay
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          isSignedIn={isSignedIn && isHome}
          userRole={activeRole}
          onSignOut={handleSignOut}
        />
      )}
    </header>
  );
}