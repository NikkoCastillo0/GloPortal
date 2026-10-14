import garageGloLogo from '../../assets/GarageGloLogo.svg'
import menuIcon from '../../assets/Hamburger-Menu.svg'
import './Header.css'

//set up label and refereces
//for future use of buttons and scrolling to sections
const customerNav=[
    {label: 'Home', href: '#home'},
    {label: 'Services', href: '#Services'},
    {label: 'Calendar', href: '#Calendar'},
    {label: 'Contact', href: '#Contact'}
]

export default function Header({role='customer', isHome=false, isSignedIn=false}){
    const showCustomerNav=role==='customer' && isHome

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
        <header className="site-header" aria-label="Site header">
            {/* Inserting logo png */}
            <a href="/" className="garage-glo-logo" aria-label="GloPortal home">
                <img src={garageGloLogo} alt="Garage Glo Logo" />
            </a>

            {/* Inserting navigation when needed */}
            {showCustomerNav && 
            (<nav aria-label="Homepage navigation">
                {customerNav.map((link) => (
                    <a key={link.label} href={link.href}>
                        {link.label}
                    </a>
                ))}
            </nav>)}

            {/* Inserting hamburger menu */}
            <button className="menu-button" aria-label='menu-button' onClick={() => console.log('Menu button clicked')}>
                <img src={menuIcon} alt="Menu" />
            </button>
        </header>
    )
}