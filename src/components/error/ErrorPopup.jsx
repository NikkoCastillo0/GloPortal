import { useState } from 'react'

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
                <h1 style={{ margin: '0 0 16px',
                    textAlign: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    lineHeight: '32px'
                 }}>Error</h1>
                <p style={{ margin: '0 0 16px',
                    textAlign: 'center',
                    fontSize: '24px',
                    lineHeight: '32px'}}>{text}</p>
                <button onClick={onClose} style={{ display: 'block',
                    width: '180px',
                    maxWidth: '100%',
                    height: '48px',
                    margin: '22px auto 0',
                    padding: '0 16px',
                    border: '0',
                    borderRadius: '24px',
                    background: '#2c2c2c',
                    color: '#f5f5f5',
                    font: 'inherit',
                    fontSize: '16px',
                    fontWeight: '400',
                    cursor: 'pointer' }}>Okay</button>
            </div>
        </div>
    )

}