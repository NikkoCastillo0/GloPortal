import garageGloLogo from '../../assets/GarageGloLogo.svg'
import menuIcon from '../../assets/Hamburger-Menu.svg'
import { useState } from 'react'
import MenuOverlay from '../navigation/not-logged-in-menuOverlay'

//set up label and refereces
//for future use of buttons and scrolling to sections
const customerNav=[
    {label: 'Home', href: '#home'},
    {label: 'Services', href: '#services'},
    {label: 'Calendar', href: '#calendar'},
    {label: 'Contact', href: '#contact'}
]

export default function Header({role='customer', isHome=false, isSignedIn=false, showNavigation=false}){
    const showCustomerNav=role==='customer' && (isHome || showNavigation)
    const [isMenuOpen, setIsMenuOpen]=useState(false)

    //This determines what type of menu should be displayed
    let menuType
    if(role==='admin'){
        menuType='admin'
    } else if(isSignedIn){
        menuType='signedIn-customer'
    } else{
        menuType='guest-customer'
    }

    return(
        <header 
            className="
                sticky top-0 z-50
                grid min-h-[70px] grid-cols-[1fr_auto] items-center
                bg-[#323232] px-[14px] py-2
                shadow-[0_5px_8px_rgba(0,0,0,0.35)]
                md:min-h-[85px] md:grid-cols-[auto_1fr_auto] md:px-[18px]
                lg:min-h-[100px] lg:px-6    
            "
        >
            {/* Inserting logo png */}
            <a href="/" 
                className="garage-glo-logo" 
                aria-label="GloPortal home"
            >
                <img 
                    src={garageGloLogo} 
                    alt="Garage Glo Logo" 
                    className="
                        block h-[60px] w-[60px] object-contain
                        md:h-[72px] md:w-[72px]
                        lg:h-[90px] lg:w-[90px]
                    "
                />
            </a>

            {/* Inserting navigation when needed */}
            {showCustomerNav && 
            (<nav 
                aria-label="Homepage navigation"
                className="
                    hidden items-center justify-self-end
                    gap-5 md:flex
                    md:mr-15
                    lg:mr-20 lg:gap-[54px]
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
            </nav>)
            }

            {/* Inserting hamburger menu */}
            <button 
                type="button"
                className="
                    col-start-2 flex h-[42px] w-[42px]
                    cursor-pointer items-center justify-center
                    justify-self-end
                    border-none bg-transparent p-0
                    md:col-start-3
                    md:h-12 md:w-12
                    lg:h-[60px] lg:w-[60px]
                " 
                aria-label='Open menu' 
                onClick={() => setIsMenuOpen(true)}
            >
                <img 
                    src={menuIcon} 
                    alt="Menu" 
                    className="
                        block h-[42px] w-[42px]
                        md:h-12 md:w-12
                        lg:h-[60px] lg:w-[60px]
                    "
                />
            </button>

            <MenuOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </header>
    )
}
