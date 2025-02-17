import React, { useState } from "react";
import chatIcon from "../assets/chat.png";
import toast from "react-hot-toast";
import { createRoomApi, joinChatApi } from "../services/RoomService";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {

    //This will set the username(name) and the room ID (the room id).
    const [detail, setDetail] = useState({
        roomId: "",
        userName: "",
    });

    //This is why because the user has joined just now.
    //Here the user has now joined so nothing to do here.
    //Assgin all the with nothing here.
    const { roomId, userName, setRoomId, setCurrentUser, setConnected } =
        useChatContext();
    const navigate = useNavigate();

    function handleFormInputChange(event) {
        setDetail({
            ...detail,
            [event.target.name]: event.target.value,
        });
    }

    //This is for the user if they have entered both.
    //userName and value
    //The css of this is in the main.jsx
    function validateForm() {
        if (detail.roomId === "" || detail.userName === "") {
            toast.error("Invalid Input !!");
            return false;
        }
        return true;
    }

    async function joinChat() {
        if (validateForm()) {
            //join chat

            try {
                const room = await joinChatApi(detail.roomId);
                toast.success("joined..");
                setCurrentUser(detail.userName);
                setRoomId(room.roomId);
                setConnected(true);
                navigate("/chat");
            } catch (error) {
                if (error.status == 400) {
                    toast.error(error.response.data);
                } else {
                    toast.error("Error in joining room");
                }
                console.log(error);
            }
        }
    }

    async function createRoom() {
        if (validateForm()) {
            //create room
            console.log(detail);
            // call api to create room on backend
            try {
                const response = await createRoomApi(detail.roomId);
                console.log(response);
                toast.success("Room Created Successfully !!");

                //join the room
                setCurrentUser(detail.userName);
                setRoomId(response.roomId);
                setConnected(true);

                //forward to chat page...
                navigate("/chat");

            } catch (error) {
                console.log(error);
                if (error.status == 400) {
                    toast.error("Room  already exists !!");
                } else {
                    toast("Error in creating room");
                }
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-100 to-white animate-fade-in">
            <div className="p-10 border w-full flex flex-col gap-5 max-w-md rounded-lg shadow-2xl bg-white animate-scale-up">
                <div className="flex justify-center items-center">
                    <img
                        src={chatIcon}
                        className="w-24 h-24 animate-spin-slow hover:animate-spin"
                        alt="Chat Icon"
                    />
                </div>

                <h1 className="text-2xl font-semibold text-center text-gray-800 animate-pulse">
                    Join Room / Create Room
                </h1>

                <div className="relative animate-fade-in-up">
                    <label
                        htmlFor="name"
                        className="block font-medium mb-2 text-gray-700 transition-colors hover:text-orange-500"
                    >
                        Your name
                    </label>
                    <input
                        onChange={handleFormInputChange}
                        value={detail.userName}
                        type="text"
                        id="name"
                        name="userName"
                        placeholder="Enter the name"
                        className="w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-full shadow-sm 
               focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all 
               hover:border-orange-300 active:border-orange-500 text-black placeholder-gray-400"
                    />
                </div>

                <div className="relative animate-fade-in-up">
                    <label
                        htmlFor="roomId"
                        className="block font-medium mb-2 text-gray-700 transition-colors hover:text-orange-500"
                    >
                        Room ID / New Room ID
                    </label>
                    <input
                        name="roomId"
                        onChange={handleFormInputChange}
                        value={detail.roomId}
                        type="text"
                        id="roomId"
                        placeholder="Enter the room id"
                        className="w-full bg-gray-50 px-4 py-2 border border-gray-300 rounded-full 
               focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all 
               hover:border-orange-300 active:border-orange-500 text-black placeholder-gray-400"
                    />
                </div>

                <div className="flex justify-center gap-2 mt-6">
                    <button
                        onClick={joinChat}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
                        transition-all transform hover:scale-105 shadow-lg rounded-full text-white 
                        focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                        Join Room
                    </button>
                    <button
                        onClick={createRoom}
                        className="px-4 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 
                        transition-all transform hover:scale-105 shadow-lg rounded-full text-white 
                        focus:outline-none focus:ring-2 focus:ring-orange-300"
                    >
                        Create Room
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JoinCreateChat;
