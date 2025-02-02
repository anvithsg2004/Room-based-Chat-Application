package com.anvith.rca_backend.controllers;

import com.anvith.rca_backend.entities.Message;
import com.anvith.rca_backend.entities.MessageRequest;
import com.anvith.rca_backend.entities.Room;
import com.anvith.rca_backend.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@CrossOrigin("*")
public class ChatController {

    @Autowired
    public RoomRepository roomRepository;

    //For sending and receiving messages
    //1. @MessageMapping("/sendMessage/{roomId}"):
    //This is like a "listener" for messages.
    //When a user sends a message to /app/sendMessage/123, the ChatController picks it up.
    //The {roomId} is the ID of the chat room (e.g., 123).

    //2. @SendTo("/topic/room/{roomId}"):
    //After processing the message, the ChatController sends it to everyone subscribed to /topic/room/123.
    //This is how everyone in the same room sees the message.
    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ) {

        Room room = roomRepository.findByRoomId(request.getRoomId());

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if (room != null) {
            room.getMessages().add(message);
            roomRepository.save(room);
        } else {
            throw new RuntimeException("Room not found !!");
        }

        return message;

    }

}
