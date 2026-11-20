import { useSearchParams } from 'react-router-dom'
import CustomerForm from '../components/customers/CustomerForm.jsx'
import { customersMock } from '../mock/customersMock.js'

export default function EditCustomer() {
  const [searchParams] = useSearchParams()
  const customer = customersMock.find((record) => record.id === searchParams.get('id')) ?? customersMock[0]

  return <CustomerForm key={customer.id} customer={customer} />
}
