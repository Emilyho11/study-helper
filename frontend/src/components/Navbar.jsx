import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faPencil } from "@fortawesome/free-solid-svg-icons";


const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const myLinks = [
    { name: 'HOME', url: '/' },
    { name: 'ABOUT', url: '/about' }
  ]

  return (
    <header className='header flex w-full h-[72px] bg-[#2c4b7d] relative shadow z-10 items-center px-10'>
      <div className='text-xl text-white text-center flex items-center gap-2'>
        STUDY HELPER
        <FontAwesomeIcon className='text-md' icon={faPencil} />
      </div>
      <div className="m-4 mr-32 absolute top-5 right-0 gap-14 text-base hidden lg:flex">
        {myLinks.map((link, index) => (
          <NavLink
            key={index}
            to={link.url}
            className={({ isActive }) =>
              [
                "text-white hover:text-blue-300 transition-all pb-2",
                !isActive ? "active" : "text-blue-300! scale-110 border-b-2 border-white",
              ].join(" ")
            }
          >
            {link.name}
          </NavLink>
        ))}
      </div>
      <div className="lg:hidden flex items-center absolute top-0 right-0 m-4">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-white hover:text-blue-300 focus:outline-none"
        >
          <FontAwesomeIcon icon={faBars} className="text-2xl text-white hover:text-blue-300" />
        </button>
      </div>
      {isOpen && (
        <div className="lg:hidden absolute top-14 right-0 w-1/2 md:w-1/3 bg-[#2c4b7d] shadow-lg flex flex-col text-lg z-10 gap-2 p-2">
          {myLinks.map((link, index) => (
            <NavLink
              key={index}
              to={link.url}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                [
                  "text-white hover:text-blue-300 transition-all text-right mr-8",
                  !isActive ? "active" : "text-blue-300! scale-110 underline",
                ].join(" ")
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  )
}

export default Navbar