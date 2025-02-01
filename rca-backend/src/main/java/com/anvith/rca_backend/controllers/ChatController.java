package com.anvith.rca_backend.controllers;

import com.anvith.rca_backend.entities.Message;
import com.anvith.rca_backend.entities.MessageRequest;
import com.anvith.rca_backend.entities.Room;
import com.anvith.rca_backend.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
public class ChatController {

    @Autowired
    public RoomRepository roomRepository;

    @MessageMapping("/sendMessage/{roomId}")
    @SendTo("/topic/room/{roomId")
    public Message sendMessage(
            @DestinationVariable String roomId,
            @RequestBody MessageRequest request
    ) {

        Room byRoomId = roomRepository.findByRoomId(request.getRoomId());

        Message message = new Message();
        message.setContent(request.getContent());
        message.setSender(request.getSender());
        message.setTimeStamp(LocalDateTime.now());

        if (byRoomId != null) {
            byRoomId.getMessages().add(message);
            roomRepository.save(byRoomId);
        }

        return message;

    }

}
