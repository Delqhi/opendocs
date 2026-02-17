package services

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gorilla/websocket"
)

type NotificationService struct {
	clients    map[*websocket.Conn]uint // map connection to userID
	broadcast  chan NotificationMessage
	register   chan clientRegistration
	unregister chan *websocket.Conn
	mu         sync.Mutex
}

type NotificationMessage struct {
	UserID  uint   `json:"user_id"`
	Type    string `json:"type"`
	Message string `json:"message"`
	Data    any    `json:"data"`
}

type clientRegistration struct {
	conn   *websocket.Conn
	userID uint
}

var Notifier *NotificationService

func InitNotifier() {
	Notifier = &NotificationService{
		clients:    make(map[*websocket.Conn]uint),
		broadcast:  make(chan NotificationMessage),
		register:   make(chan clientRegistration),
		unregister: make(chan *websocket.Conn),
	}
	go Notifier.run()
}

func (s *NotificationService) run() {
	for {
		select {
		case reg := <-s.register:
			s.mu.Lock()
			s.clients[reg.conn] = reg.userID
			s.mu.Unlock()
			log.Printf("User %d connected via WebSocket", reg.userID)

		case conn := <-s.unregister:
			s.mu.Lock()
			if userID, ok := s.clients[conn]; ok {
				delete(s.clients, conn)
				conn.Close()
				log.Printf("User %d disconnected from WebSocket", userID)
			}
			s.mu.Unlock()

		case msg := <-s.broadcast:
			s.mu.Lock()
			for conn, userID := range s.clients {
				if userID == msg.UserID {
					err := conn.WriteJSON(msg)
					if err != nil {
						log.Printf("Error sending WS message: %v", err)
						conn.Close()
						delete(s.clients, conn)
					}
				}
			}
			s.mu.Unlock()
		}
	}
}

func (s *NotificationService) NotifyUser(userID uint, msgType, message string, data any) {
	s.broadcast <- NotificationMessage{
		UserID:  userID,
		Type:    msgType,
		Message: message,
		Data:    data,
	}
}

func (s *NotificationService) Register(conn *websocket.Conn, userID uint) {
	s.register <- clientRegistration{conn: conn, userID: userID}
}

func (s *NotificationService) Unregister(conn *websocket.Conn) {
	s.unregister <- conn
}
