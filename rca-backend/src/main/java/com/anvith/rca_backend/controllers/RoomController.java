package com.anvith.rca_backend.controllers;

import com.anvith.rca_backend.dto.createRoomIdDTO;
import com.anvith.rca_backend.entities.Message;
import com.anvith.rca_backend.entities.Room;
import com.anvith.rca_backend.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.redis.core.RedisTemplate;
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

    @Autowired
    private RedisTemplate<String, Message> redisTemplate; // Inject RedisTemplate

    // Create Room
    @PostMapping
    @CacheEvict(value = "rooms", key = "#roomId")
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
    @Cacheable(value = "rooms", key = "#roomId")
    public ResponseEntity<?> joinRoom(@PathVariable String roomId) {
        Room room = roomRepository.findByRoomId(roomId);
        if (room == null) {
            return ResponseEntity.badRequest().body("Room Not Found!!");
        }
        return ResponseEntity.ok(room);  // Automatically returns room as JSON
    }

    // Get All Messages of the Room (with pagination)
    @GetMapping("/{roomId}/messages")
    @Cacheable(value = "roomMessages", key = "#roomId + '_' + #page + '_' + #size")
    public ResponseEntity<List<Message>> getMessages(@PathVariable String roomId,
                                                     @RequestParam(value = "page", defaultValue = "0") int page,
                                                     @RequestParam(value = "size", defaultValue = "20") int size) {

        List<Message> messages;
        // Get messages from Redis
        List<Message> redisMessages = redisTemplate.opsForList()
                .range("room:" + roomId, 0, -1);

        if (!redisMessages.isEmpty()) {
            int start = Math.max(0, redisMessages.size() - (page + 1) * size);
            int end = Math.min(redisMessages.size(), start + size);
            messages = redisMessages.subList(start, end);
        } else {
            // Fallback to MongoDB
            Room room = roomRepository.findByRoomId(roomId);
            if (room == null) return ResponseEntity.badRequest().build();

            List<Message> allMessages = room.getMessages();
            int total = allMessages.size();
            int startIndex = Math.max(0, total - (page + 1) * size);
            int endIndex = Math.min(total, startIndex + size);
            messages = allMessages.subList(startIndex, endIndex);
        }

        return ResponseEntity.ok(messages);
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
