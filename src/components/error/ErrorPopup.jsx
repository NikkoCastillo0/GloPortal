import { useState } from 'react'
import './ErrorPopup.css'

export default function ErrorPopup ({text, onClose}) {
    const [show, setShow] = useState(true);

    return (
        <div style={{ position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0, 
        backgroundColor: 'rgba(0,0,0,0.5)', 
        display: show ? 'flex' : 'none', 
        justifyContent: 'center', 
        alignItems: 'center' }}>
            <div style={{ backgroundColor: '#fff', 
                padding: '20px', 
                borderRadius: '16px', 
                maxWidth: '75%' }}>
                <h1>Error</h1>
                <p>{text}</p>
                <button onClick={onClose} >Okay</button>
            </div>
        </div>
    )

}