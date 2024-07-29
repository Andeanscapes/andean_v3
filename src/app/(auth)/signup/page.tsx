import { Metadata } from "next";
import Link from "next/link"


export const metadata: Metadata = {
    title: 'Signup | Arid - Travel & Tourism HTML/Tailwind CSS Template',
    description: 'Welcome, Arid - Travel & Tourism HTML/Tailwind CSS Template',
    keywords: ['tour', 'travel', 'booking', 'rental', 'nextJs', 'tailwind', 'trip', 'beach', 'holidy', 'cruise', 'vacation' ]
  }

const signup = () => {
    return (
        <div
            className="fixed inset-0 w-full h-full bg-opacity-40 z-50 overflow-y-scroll bg-no-repeat bg-cover bg-center"
            style={{ backgroundImage: 'linear-gradient(to right, rgba(30, 30, 30, .3), rgba(30, 30, 30, .3)), url("/assets/images/hero/h4.webp")' }}
        >
            <div className="max-w-[550px] h-full flex justify-center items-center py-5 px-5 mx-auto">
                <div className="mx-auto bg-white w-full px-base py-base">
                    <div className="text-center">
                        <Link href="/"><img src="/assets/images/logo.png" alt="logo" className="mx-auto" /></Link>
                    </div>
                    <ul id="tabs-nav" className="login-tabs flex gap-4 pt-6">
                        <li className="basis-1/2">
                            <Link href='/login' className="tab-link-button">Sign In</Link>
                        </li>
                        <li className="basis-1/2">
                            <Link href='#' className="tab-link-button active">Sign Up</Link>
                        </li>
                    </ul>
                    <div className="mt-9">
                        <input type="name" placeholder="ex: Hanry" className="input_style__primary" />
                    </div>
                    <div className="mt-9">
                        <input type="email" placeholder="name@example.com" className="input_style__primary" />
                    </div>
                    <div className="lg:mt-5 mt-4">
                        <input type="password" placeholder="Passowrd :" className="input_style__primary" />
                    </div>
                    <div className="lg:mt-5 mt-4 flex gap-2 items-center">
                        <input type="checkbox" id="logincheck" className="h-4 w-4 rounded-md border-primary-1 border" />
                        <label htmlFor="logincheck" className="text-dark-2">I Accept <Link href="/about" className="underline">Terms And Condition</Link></label>
                    </div>
                    <button className="btn_primary__v1 uppercase !w-full justify-center lg:mt-5 mt-4">
                        sign up
                        <svg width={20} height={20} viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7.42505 16.5999L12.8584 11.1666C13.5 10.5249 13.5 9.4749 12.8584 8.83324L7.42505 3.3999" stroke="currentColor" strokeWidth="1.5" strokeMiterlimit={10} strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    )
}

export default signup;

