import BookingData from '@/constant/dashboard/BookingData'
import Link from 'next/link'
import React from 'react'

const DashboardTab = () => {
    return (
        <div className='border border-primary-1 border-opacity-20 lg:py-6 py-4 lg:px-6 px-6'>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 grid-cols-1 gap-4">
                <div className="col-span-1">
                    <div className="bg-[#FFF2ED] bg-opacity-30 py-5 px-5 flexjustify-center items-center flex gap-4 ">
                        <div className='max-w-[58px] shrink-0'>
                            <img src="/assets/images/icons/booking.png" alt="" />
                        </div>
                        <div>
                            <h5 className='font-semibold lg:text-2xl text-2xl leading-[1]'>10</h5>
                            <p className='font-semibold text-gray-600 mt-2'>Total Booking</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="bg-[#FFF2ED] bg-opacity-30 py-5 px-5 flexjustify-center items-center flex gap-4 ">
                        <div className='max-w-[58px] shrink-0'>
                            <img src="/assets/images/icons/tour.png" alt="" />
                        </div>
                        <div>
                            <h5 className='font-semibold lg:text-2xl text-2xl leading-[1]'>10</h5>
                            <p className='font-semibold text-gray-600 mt-2'>Total Travel</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="bg-[#FFF2ED] bg-opacity-30 py-5 px-5 flexjustify-center items-center flex gap-4 ">
                        <div className='max-w-[58px] shrink-0'>
                            <img src="/assets/images/icons/review.png" alt="" />
                        </div>
                        <div>
                            <h5 className='font-semibold lg:text-2xl text-2xl leading-[1]'>10</h5>
                            <p className='font-semibold text-gray-600 mt-2'>Reviews</p>
                        </div>
                    </div>
                </div>
                <div className="col-span-1">
                    <div className="bg-[#FFF2ED] bg-opacity-30 py-5 px-5 flexjustify-center items-center flex gap-4 ">
                        <div className='max-w-[58px] shrink-0'>
                            <img src="/assets/images/icons/wishlist.png" alt="" />
                        </div>
                        <div>
                            <h5 className='font-semibold lg:text-2xl text-2xl leading-[1]'>10</h5>
                            <p className='font-semibold text-gray-600 mt-2'>Wishlist</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className='pt-10'>
                <div className="flex justify-between gap-3 items-center">
                    <h5 className='lg:text-xl text-2md text-dark-2 font-semibold leading-[1.5]'>Recent Bookings</h5>
                    <Link
                        href={
                            `?${new URLSearchParams({
                                tab: 'booking'
                            })}`
                        }
                        className='text-primary-1 underline'>View All</Link>
                </div>
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
                            {BookingData?.bookings.slice(0, 7)?.map((booking) => (
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
        </div>
    )
}

export default DashboardTab