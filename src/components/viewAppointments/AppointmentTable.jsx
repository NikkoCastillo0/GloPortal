import { useEffect, useState } from 'react'

import { supabase } from '../../lib/supabase'

export default function AppointmentTable(){

    const [appointments, setAppointments] = useState([]);
    
    useEffect(() => {
        getAppointments()
    }, [])

    async function getAppointments() {
        {/*
        Database Instructions: .from() selects the table
        .select() selects the columns, 
        doing it by itself is fine * not needed 
        but if you need data from foreign table 
        then you need to do *(or whatever columns from the 1st table), table_name ( column_name, column_name2 )
        */}
        const {data, error} = await supabase
        .from('appointments')
        .select('*, customers (lname, fname, email, phone), vehicles (vehicle)')

        
        if (error) {
            console.error(error)
            return
        }

        setAppointments(data)
    }

    return(
        <h1>
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Last Name</th>
                        <th>First Name</th>
                        <th>E-Mail</th>
                        <th>Phone</th>
                        <th>Service</th>
                        <th>Vehicle</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Notes</th>
                    </tr>
                </thead>
                <tbody>
                    {/*
                        Code commented out until database tables are setup
                        No error handling yet so page will not load if table and data is missing
                        Table Instructions: row.column_name
                    */}
                    {/*
                    {appointments.map(row => (
                        <tr key = {row.id}>
                            <td>{row.date}</td>
                            <td>{row.customers.lname}</td>
                            <td>{row.customers.fname}</td>
                            <td>{row.customers.email}</td>
                            <td>{row.customers.phone}</td>
                            <td>{row.service}</td>
                            <td>{row.vehicles.vehicle}</td>
                            <td>{row.price}</td>
                            <td>{row.location}</td>
                            <td>{row.notes}</td>
                        </tr>
                    ))}
                    */}
                </tbody>
            </table>
        </h1>
    )
}
