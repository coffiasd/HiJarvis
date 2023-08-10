import Head from 'next/head'
import Sidebar from '../components/Sidebar';
import dynamic from 'next/dynamic';
import React from "react";

const Chat = dynamic(() => import('../components/Chat'), {
    ssr: false,
})

export default function Home() {
    return (
        <div className="min-h-screen" data-theme="wireframe">
            <Head>
                <title>Hi_Jarvis</title>
                <meta name="description" content="" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className='relative'>
                <Sidebar />
                <div className='flex justify-center'>
                    <Chat />
                </div>
            </div>
        </div >
    )
}
