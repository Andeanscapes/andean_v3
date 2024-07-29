import BookingData from '@/constant/dashboard/BookingData'

const BookingTab = () => {

  return (
    <div className='border border-primary-1 border-opacity-20 lg:py-6 py-4 lg:px-6 px-6'>
      <h5 className='lg:text-xl text-2md text-dark-2 font-semibold leading-[1.5]'>Booking History</h5>
      <div className='lg:overflow-x-auto overflow-x-scroll'>
      <table className='dashboard-table mt-6 min-w-[500px]'>
        <thead className='text-white text-opacity-90'>
          <tr>
            <th>Package</th>
            <th>Total</th>
            <th>Order Date</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>

        <tbody>
          {BookingData?.bookings?.map((booking)=> (
            <tr key={booking.id}>
            <td>{booking.title}</td>
            <td>${booking.amount}</td>
            <td>${booking.date}</td>
            <td>
              {booking.status === 'pending' ? <span className='tag panding bg-[#17A2B8] text-white'>Pending</span> : null}
              {booking.status === 'canceled' ? <span className='tag panding bg-red-500 text-white'>Canceled</span> : null}
              {booking.status === 'completed' ? <span className='tag panding bg-green-700 text-white'>Completed</span> : null}
            </td>
            <td><button aria-label="disc button" type='button' className='details-btn'>View</button></td>
          </tr>
          ))}
          
        </tbody>
      </table>
      </div>
      
    </div>
  )
}

export default BookingTab