import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";
import SockJS from "sockjs-client";
import { Stomp } from "@stomp/stompjs";
import toast from "react-hot-toast";
import { baseURL } from "../config/AxiosHelper";
import { getMessagess } from "../services/RoomService";
import { timeAgo } from "../config/helper";
const ChatPage = () => {
    const {
        roomId,
        currentUser,
        connected,
        setConnected,
        setRoomId,
        setCurrentUser,
    } = useChatContext();
    // console.log(roomId);
    // console.log(currentUser);
    // console.log(connected);

    const navigate = useNavigate();
    useEffect(() => {
        if (!connected) {
            navigate("/");
        }
    }, [connected, roomId, currentUser]);

    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const inputRef = useRef(null);
    const chatBoxRef = useRef(null);
    const [stompClient, setStompClient] = useState(null);
    const connectedRef = useRef(false);  // Track connection status for toast

    //page init:
    //messages ko load karne honge

    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessagess(roomId);
                // console.log(messages);
                setMessages(messages);
            } catch (error) { }
        }
        if (connected) {
            loadMessages();
        }
    }, []);

    //scroll down

    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    //stompClient ko init karne honge
    //subscribe
    useEffect(() => {
        const connectWebSocket = () => {
            const sock = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(sock);

            client.connect({}, () => {
                setStompClient(client);
                toast.success("Connected");

                client.subscribe(`/topic/room/${roomId}`, (message) => {
                    const newMessage = JSON.parse(message.body);
                    // Store the new message in localStorage to notify other tabs
                    const messagesFromStorage = JSON.parse(localStorage.getItem(`messages_${roomId}`)) || [];
                    const updatedMessages = [...messagesFromStorage, newMessage];
                    localStorage.setItem(`messages_${roomId}`, JSON.stringify(updatedMessages));

                    // Update the current tab's state
                    setMessages(updatedMessages);
                });
            });
        };

        if (connected) {
            connectWebSocket();
        }
    }, [roomId]);

    useEffect(() => {
        // Listen for changes in localStorage
        const handleStorageChange = (e) => {
            if (e.key === `messages_${roomId}`) {
                // Retrieve the updated messages and set the state
                const updatedMessages = JSON.parse(e.newValue);
                setMessages(updatedMessages);
            }
        };

        window.addEventListener("storage", handleStorageChange);

        // Cleanup listener when the component is unmounted
        return () => {
            window.removeEventListener("storage", handleStorageChange);
        };
    }, [roomId]);


    //send message handle
    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
            };

            // Send the message via WebSocket
            stompClient.send(
                `/app/sendMessage/${roomId}`,
                {},
                JSON.stringify(message)
            );

            // Immediately add the sent message to the messages state to update the UI
            setMessages((prevMessages) => [...prevMessages, message]);

            // Clear the input field
            setInput("");
        }
    };


    function handleLogout() {
        stompClient.disconnect();
        setConnected(false);
        setRoomId("");
        setCurrentUser("");
        navigate("/");
    }

    return (
        <div className="">
            {/* this is a header */}
            <header className="dark:border-gray-700  fixed w-full dark:bg-gray-900 py-5 shadow flex justify-around items-center">
                {/* room name container */}
                <div>
                    <h1 className="text-xl font-semibold">
                        Room : <span>{roomId}</span>
                    </h1>
                </div>
                {/* username container */}

                <div>
                    <h1 className="text-xl font-semibold">
                        User : <span>{currentUser}</span>
                    </h1>
                </div>
                {/* button: leave room */}
                <div>
                    <button
                        onClick={handleLogout}
                        className="dark:bg-red-500 dark:hover:bg-red-700 px-3 py-2 rounded-full"
                    >
                        Leave Room
                    </button>
                </div>
            </header>

            <main
                ref={chatBoxRef}
                className="py-20 px-10   w-2/3 dark:bg-slate-600 mx-auto h-screen overflow-auto "
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"
                            } `}
                    >
                        <div
                            className={`my-2 ${message.sender === currentUser ? "bg-green-800" : "bg-gray-800"
                                } p-2 max-w-xs rounded`}
                        >
                            <div className="flex flex-row gap-2">
                                <img
                                    className="h-10 w-10"
                                    src={"https://avatar.iran.liara.run/public/43"}
                                    alt=""
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold">{message.sender}</p>
                                    <p>{message.content}</p>
                                    <p className="text-xs text-gray-400">
                                        {timeAgo(message.timeStamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>
            {/* input message container */}
            <div className=" fixed bottom-4 w-full h-16 ">
                <div className="h-full  pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto dark:bg-gray-900">
                    <input
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                sendMessage();
                            }
                        }}
                        type="text"
                        placeholder="Type your message here..."
                        className=" w-full  dark:border-gray-600 b dark:bg-gray-800  px-5 py-2 rounded-full h-full focus:outline-none  "
                    />

                    <div className="flex gap-1">
                        <button className="dark:bg-purple-600 h-10 w-10  flex   justify-center items-center rounded-full">
                            <MdAttachFile size={20} />
                        </button>
                        <button
                            onClick={sendMessage}
                            className="dark:bg-green-600 h-10 w-10  flex   justify-center items-center rounded-full"
                        >
                            <MdSend size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;
