import { useState, useEffect } from "react";
import Head from 'next/head'
import Image from 'next/image'
// import { Inter } from 'next/font/google'
import styles from  '../styles/Home.module.css';
import axios from 'axios';
import TypingAnimation from "../components/TypingAnimation";


export default function Chat() {
    const prompt = "You are AI assistant,you can help the following oprations,1.create aa account,2.mint NFT,3.transfer NFT from different network to target network。you need to chat with user to get necessary informations,for opration one,let user provide three admin addresses,you need to format them info CREATEAA#{address1}#{address2}#{address3},no more output.";

    const [inputValue, setInputValue] = useState('');
    const [chatLog, setChatLog] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [history, setHistory] = useState([{ "role": "system", "content": prompt }]);

    const handleSubmit = (event) => {
        event.preventDefault();

        setChatLog((prevChatLog) => [...prevChatLog, { type: 'user', message: inputValue }])

        sendMessage(inputValue);

        setInputValue('');
    }

    const sendMessage = (message) => {
        console.log(message);
        const url = '/api/chat';
        
        setHistory((prevH) => [...prevH, { "role": "user", "content": message }]);

        const data = {
            model: "gpt-3.5-turbo",
            messages: history,
            max_tokens:200,
            temperature: 0.7,
            top_p:1,
            frequency_penalty:0.0,
            presence_penalty:0.0
        };

        setIsLoading(true);

        axios.post(url, data).then((response) => {
            console.log(response);
            setChatLog((prevChatLog) => [...prevChatLog, { type: 'bot', message: response.data.choices[0].message.content }]);

            setHistory((prevH) => [...prevH, { "role": "assistant", "content": response.data.choices[0].message.content }]);

            setIsLoading(false);
        }).catch((error) => {
            setIsLoading(false);
            console.log(error);
        })
    }

    return (
        <div className="container mx-auto">
            <div className="flex flex-col h-auto bg-gray-900 w-">
                <h1 className="bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text text-center py-3 font-bold text-6xl">chatSiri</h1>
                <div className="flex-grow p-6">
                    <div className="flex flex-col space-y-4">
                        {
                            chatLog.map((message, index) => (
                                <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                    }`}>
                                    <div className={`${message.type === 'user' ? 'bg-purple-500' : 'bg-gray-800'
                                        } rounded-lg p-4 text-white max-w-sm`}>
                                        {message.message}
                                    </div>
                                </div>
                            ))
                        }
                        {
                            isLoading &&
                            <div key={chatLog.length} className="flex justify-start">
                                <div className="bg-gray-800 rounded-lg p-4 text-white max-w-sm">
                                    <TypingAnimation />
                                </div>
                            </div>
                        }
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-none p-6">
                    <div className="flex rounded-lg border border-gray-700 bg-gray-800">
                        <input type="text" className="flex-grow px-4 py-2 bg-transparent text-white focus:outline-none" placeholder="Type your message..." value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        <button type="submit" className="bg-purple-500 rounded-lg px-4 py-2 text-white font-semibold focus:outline-none hover:bg-purple-600 transition-colors duration-300">Send</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
