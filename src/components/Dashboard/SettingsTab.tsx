"use client"

import { info } from "console"
import { useState } from "react"

const SettingsTab = () => {

  const [tab, setTab] = useState("info")

  return (
    <div className='border border-primary-1 border-opacity-20 lg:py-6 py-4 lg:px-6 px-6'>
      <h5 className='lg:text-xl text-2md text-dark-2 font-semibold leading-[1.5]'>Settings</h5>
      <div className="pt-4">
        <ul className="flex gap-8 lg:text-md text-base font-medium">
          <li onClick={() => setTab("info")} className={`cursor-pointer border-b ${tab === "info" ? " text-primary-1 border-primary-1" : "text-gray-500"}`}>Personal Information</li>
          <li onClick={() => setTab("password")} className={`cursor-pointer border-b ${tab === "password" ? " text-primary-1 border-primary-1" : "text-gray-500"}`}>Change Password</li>
        </ul>

        <div className="mt-6">
          {tab === "info" ?
            <>
              <form action="#" className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="text-dark-2 block mb-2">First Name</label>
                  <input type="text"
                    placeholder="ex: Jhon"
                    className="input_style__primary" />
                </div>
                <div className="col-span-1">
                  <label className="text-dark-2 block mb-2">Last Name</label>
                  <input type="text"
                    placeholder="ex: Doe"
                    className="input_style__primary" />
                </div>
                <div className="col-span-1">
                  <label className="text-dark-2 block mb-2">Email</label>
                  <input type="email"
                    placeholder="jhondoe@example.com"
                    className="input_style__primary" />
                </div>
                <div className="col-span-1">
                  <label className="text-dark-2 block mb-2">Phone Number</label>
                  <input type="tel"
                    placeholder="+00123456789"
                    className="input_style__primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-dark-2 block mb-2">Your Address</label>
                  <input type="text"
                    placeholder="ex: 8800 Orchard Lake Road, Suite 180 Farmington Hills, U.S.A."
                    className="input_style__primary" />
                </div>
                <div className="col-span-2">
                <button aria-label="info submit" className="btn_primary__v1" type="submit">Save Changes</button>
                </div>
              </form>
            </> : null
          }
          {tab === "password" ?
            <>
              <form action="#" className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="text-dark-2 block mb-2">Current Password</label>
                  <input type="text"
                    placeholder="Current Password"
                    className="input_style__primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-dark-2 block mb-2">New Password</label>
                  <input type="text"
                    placeholder="New Password"
                    className="input_style__primary" />
                </div>
                <div className="col-span-2">
                  <label className="text-dark-2 block mb-2">New Password Again</label>
                  <input type="email"
                    placeholder="Re-type New Password"
                    className="input_style__primary" />
                </div>
                
                <div className="col-span-2">
                <button aria-label="password submit" className="btn_primary__v1" type="submit">Save Changes</button>
                </div>
              </form>
            </> : null
          }
        </div>
      </div>
    </div>
  )
}

export default SettingsTab