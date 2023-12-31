import Head from 'next/head'
import Footer from '../components/Footer';
import dynamic from 'next/dynamic';
import React from "react";
import { Alert } from '../components/alert.jsx';
import { FaRocket } from "react-icons/fa";
import { useRouter } from 'next/router'

const Header = dynamic(() => import('../components/Header'), {
  ssr: false,
})

export default function Home() {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault()
    router.push('/chat')
  }

  return (
    <div className="min-h-screen" data-theme="wireframe">
      <Head>
        <title>Hi Jarvis</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header />

      <Alert />

      <div className="mt-40 min-h-screen">
        <div className="m-auto hero-content text-center flex flex-col">
          <div className="">
            <h1 className="text-5xl font-bold">Hi Jarvis</h1>
            {/* <p className="py-6 text-xl font-normal leading-normal mt-0 mb-2">Explore Web3 world with me</p> */}
          </div>

          <h3 className="text-3xl mt-10">What can Jarvis do?</h3>

          <div className="flex flex-col mt-10">

            <ul className="text-xl grid justify-items-start">
              <li className="my-2">1.create abstraction account</li>
              <li className="my-2">2.use aa to send token</li>
              <li className="my-2">3.transfer native token</li>
              <li className="my-2">4.create ERC20 contract</li>
              <li className="my-2">5.mint ERC20 token</li>
              <li className="my-2">6.switch network</li>
              <li className="my-2">7.TODO ...</li>
              </ul>

          </div>

          <div>
            <button className="btn rounded-lg normal-case mt-10" onClick={handleClick}>
              Lanch App &nbsp;
              <FaRocket size="1rem" />
            </button>
          </div>

        </div>


      </div>

      <Footer />
    </div >
  )
}
