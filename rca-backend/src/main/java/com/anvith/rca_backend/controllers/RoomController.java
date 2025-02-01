package com.anvith.rca_backend.controllers;

import com.anvith.rca_backend.dto.createRoomIdDTO;
import com.anvith.rca_backend.entities.Message;
import com.anvith.rca_backend.entities.Room;
import com.anvith.rca_backend.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    @Autowired
    public RoomRepository roomRepository;

    //Create Room
    @PostMapping("/createRoom")
    public ResponseEntity<?> createRoom(@RequestBody createRoomIdDTO createRoomIdDTO) {

        String roomId = createRoomIdDTO.getRoomId();

        if (roomRepository.findByRoomId(roomId) != null) {
            //Room was already created.
            return ResponseEntity.badRequest().body("Room already exists.");
        }

        //Create a new Room
        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(room);
    }

    //Get Room
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room Not Found!!");
        }

        return ResponseEntity.ok(room);
    }

    //Get All the messages of the room.
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId,
                                                     @RequestParam(value = "page", defaultValue = "0", required = false) int page,
                                                     @RequestParam(value = "size", defaultValue = "20", required = false) int size) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            //build is equivalent to:
            //return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            return ResponseEntity.badRequest().build();
        }

        //Get Messages
        //Pagination of the messages
        List<Message> messageList = room.getMessages();
        int start = Math.max(0, messageList.size() - (page + 1) * size);
        int end = Math.min(messageList.size(), start + size);
        List<Message> paginatedMessages = messageList.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);
    }

    @GetMapping("/allRooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();  // Fetch all rooms from MongoDB

        if (rooms.isEmpty()) {
            return ResponseEntity.noContent().build();  // Return 204 No Content if no rooms found
        }

        return ResponseEntity.ok(rooms);  // Return rooms with 200 OK status
    }
}
