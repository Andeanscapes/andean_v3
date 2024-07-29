import FooterTwo from '@/components/layout/FooterTwo'
import HeaderOne from '@/components/layout/HeaderOne'
import React from 'react'

const laybout = (
    {children} : 
    {
        children: React.ReactNode
    }
) => {
  return (
    <>
       <HeaderOne variant="transparent-V2"/>
        <main className="bg-[#121316] pb-24 lg:pb-30">
            {children}
        </main>
        <FooterTwo/>
    </>
  )
}

export default laybout