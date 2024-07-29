import Link from "next/link"

const ProfileTab = () => {
  return (
    <div className='border border-primary-1 border-opacity-20 lg:py-6 py-4 lg:px-6 px-6'>
      <h5 className='lg:text-xl text-2md text-dark-2 font-semibold leading-[1.5]'>Profile Information</h5>
      <div className='lg:overflow-x-auto overflow-x-scroll'>
        <table className='dashboard-table profile-v mt-6 min-w-[500px]'>
          <tbody>
            <tr>
              <td className="lg:w-[20%]"><strong>First Name</strong></td>
              <td className="lg:w-[20px]">:</td>
              <td>Jahid Hassan</td>
            </tr>
            <tr>
              <td className="lg:w-[20%]"><strong>Last Name</strong></td>
              <td className="lg:w-[20px]">:</td>
              <td>Hassan</td>
            </tr>
            <tr>
              <td className="lg:w-[20%]"><strong>Email Address</strong></td>
              <td className="lg:w-[20px]">:</td>
              <td>example@email.com</td>
            </tr>
            <tr>
              <td className="lg:w-[20%]"><strong>Phone Number</strong></td>
              <td className="lg:w-[20px]">:</td>
              <td>+01 4561 3214</td>
            </tr>
            <tr>
              <td className="lg:w-[20%]"><strong>Date of Birth</strong></td>
              <td className="lg:w-[20px]">:</td>
              <td>03 Jun 1990</td>
            </tr>
            <tr>
              <td className="lg:w-[20%]"><strong>Address</strong></td>
              <td className="lg:w-[20px]">:</td>
              <td>8800 Orchard Lake Road, Suite 180 Farmington Hills, U.S.A.</td>
            </tr>
          </tbody>
        </table>
        <div className="mt-10">
          <Link className="btn_primary__v1 variant-2" 
            href={
              `?${new URLSearchParams({
                tab: 'settings'
              })}`
            }
          >Update Profile</Link>
        </div>

      </div>
    </div>
  )
}

export default ProfileTab