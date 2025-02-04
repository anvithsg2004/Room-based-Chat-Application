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

@RestController  // Changed to @RestController for automatic JSON handling
@RequestMapping("/api/v1/rooms")
@CrossOrigin("*")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    // Create Room
    @PostMapping
    public ResponseEntity<?> createRoom(@RequestBody String roomId) {
//        String roomId = createRoomIdDTO.getRoomId();

        if (roomRepository.findByRoomId(roomId) != null) {
            // Room was already created
            return ResponseEntity.badRequest().body("Room already exists.");
        }

        // Create a new Room
        Room room = new Room();
        room.setRoomId(roomId);
        Room savedRoom = roomRepository.save(room);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedRoom); // Return the saved room
    }

    // Get Room by roomId
    @GetMapping("/{roomId}")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room Not Found!!");
        }
        return ResponseEntity.ok(room);  // Automatically returns room as JSON
    }

    // Get All Messages of the Room (with pagination)
    @GetMapping("/{roomId}/messages")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId,
                                                     @RequestParam(value = "page", defaultValue = "0", required = false) int page,
                                                     @RequestParam(value = "size", defaultValue = "20", required = false) int size) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().build();  // 400 Bad Request if room not found
        }

        // Get Messages (Pagination)
        List<Message> messageList = room.getMessages();
        int start = Math.max(0, messageList.size() - (page + 1) * size);
        int end = Math.min(messageList.size(), start + size);
        List<Message> paginatedMessages = messageList.subList(start, end);
        return ResponseEntity.ok(paginatedMessages);  // Return paginated messages
    }

    // Get All Rooms
    @GetMapping("/allRooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();  // Fetch all rooms from MongoDB

        if (rooms.isEmpty()) {
            return ResponseEntity.noContent().build();  // Return 204 No Content if no rooms found
        }

        return ResponseEntity.ok(rooms);  // Return rooms with 200 OK status
    }
}
