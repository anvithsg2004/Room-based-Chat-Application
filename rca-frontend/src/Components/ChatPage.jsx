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
    const isSubscribed = useRef(false); // Track subscription status

    //Mount = First render
    //Render = Not exactly. Render means React is drawing (or updating) the UI based on state/props.
    //Refresh usually means reloading the entire page, which React avoids by updating only the necessary parts. 🚀

    //Here is a concept of useEffect.
    //useEffect Type	                    When It Runs?	        Use Case
    //useEffect(() => {...})                On every render	        Logging, animations
    //useEffect(() => {...}, [])	        Only on mount	        Fetching initial data
    //useEffect(() => {...}, [dependency])	When dependency changes	Fetching data when roomId changes
    //Cleanup(return () => {... })	        Before unmounting	    Cleaning event listeners, stopping intervals

    //Loading Previous Messages When User Joins
    //When the user joins a chat, fetches old messages and shows them.
    //Runs only when connected, roomId, or currentUser changes.
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
    }, [connected, roomId, currentUser]);

    //scroll down the chat box
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scroll({
                top: chatBoxRef.current.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [messages]);

    //Connecting to WebSocket
    //subscribe
    //Opens WebSocket connection when user joins a room.
    //Subscribes to the room to receive messages.
    //Disconnects WebSocket when the user leaves.
    useEffect(() => {
        const connectWebSocket = () => {
            const sock = new SockJS(`${baseURL}/chat`);
            const client = Stomp.over(sock);

            client.connect({}, () => {
                setStompClient(client);
                toast.success("Connected");

                // Track subscription status
                if (!isSubscribed.current) {
                    client.subscribe(`/topic/room/${roomId}`, (message) => {
                        const newMessage = JSON.parse(message.body);
                        setMessages((prev) => [...prev, newMessage]);
                    });
                    isSubscribed.current = true;
                }
            });
        };

        if (connected) {
            connectWebSocket();
        }

        return () => {
            if (stompClient) {
                stompClient.disconnect(); // Cleanup on unmount
                isSubscribed.current = false;
            }
        };
    }, [roomId, connected]); // Only re-run if roomId or connected changes

    //Sync Messages Across Multiple Tabs
    //If multiple browser tabs are open, ensures all tabs get the latest messages.
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
    //Sending a Message
    const sendMessage = async () => {
        if (stompClient && connected && input.trim()) {
            const message = {
                sender: currentUser,
                content: input,
                roomId: roomId,
            };

            stompClient.send(
                `/app/sendMessage/${roomId}`,
                {},
                JSON.stringify(message)
            );

            setInput("");
        }
    };

    // Load messages when connected, roomId, or currentUser changes
    useEffect(() => {
        async function loadMessages() {
            try {
                const messages = await getMessagess(roomId);
                setMessages(messages);
            } catch (error) {
                console.error("Error loading messages:", error);
            }
        }

        if (connected && roomId && currentUser) { // Ensure all required values are set
            loadMessages();
        }
    }, [connected, roomId, currentUser]); // Add dependencies here


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
            <header className="fixed w-full bg-white py-5 shadow flex justify-around items-center border-b border-orange-200">
                {/* room name container */}
                <div>
                    <h1 className="text-xl font-semibold text-gray-800">
                        Room : <span className="text-orange-500">{roomId}</span>
                    </h1>
                </div>
                {/* username container */}

                <div>
                    <h1 className="text-xl font-semibold text-gray-800">
                        User : <span className="text-orange-500">{currentUser}</span>
                    </h1>
                </div>
                {/* button: leave room */}
                <div>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-700 px-3 py-2 rounded-full text-white"
                    >
                        Leave Room
                    </button>
                </div>
            </header>

            <main
                ref={chatBoxRef}
                className="py-20 px-10 w-2/3 mx-auto h-screen overflow-auto bg-white"
            >
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`flex ${message.sender === currentUser ? "justify-end" : "justify-start"
                            } `}
                    >
                        <div
                            className={`my-2 ${message.sender === currentUser
                                ? "bg-orange-200 text-gray-800"
                                : "bg-gray-100 text-gray-800"
                                } p-2 max-w-xs rounded-lg shadow`}
                        >
                            <div className="flex flex-row gap-2">
                                <img
                                    className="h-10 w-10 rounded-full"
                                    src={"https://via.placeholder.com/40"}
                                    alt=""
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-bold">{message.sender}</p>
                                    <p>{message.content}</p>
                                    <p className="text-xs text-gray-500">
                                        {timeAgo(message.timeStamp)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </main>
            {/* input message container */}
            <div className="fixed bottom-4 w-full h-16">
                <div className="h-full pr-10 gap-4 flex items-center justify-between rounded-full w-1/2 mx-auto bg-white border border-gray-200 shadow">
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
                        className="w-full px-5 py-2 rounded-full h-full focus:outline-none focus:ring-2 focus:ring-orange-500 border border-gray-200 text-black placeholder-gray-400"
                    />

                    <div className="flex gap-1">
                        <button className="bg-purple-500 hover:bg-purple-700 h-10 w-10 flex justify-center items-center rounded-full text-white">
                            <MdAttachFile size={20} />
                        </button>
                        <button
                            onClick={sendMessage}
                            className="bg-orange-500 hover:bg-orange-700 h-10 w-10 flex justify-center items-center rounded-full text-white"
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