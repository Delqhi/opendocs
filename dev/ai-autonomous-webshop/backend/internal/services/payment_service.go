package services

import (
	"errors"
	"log"
	"time"
)

type PaymentService struct{}

type PaymentResult struct {
	TransactionID string
	Status        string
	Amount        float64
}

func (s *PaymentService) ProcessPayment(amount float64, cardNumber string) (*PaymentResult, error) {
	log.Printf("Processing payment of $%.2f for card ending in %s", amount, cardNumber[len(cardNumber)-4:])
	
	// Mock processing delay
	time.Sleep(1 * time.Second)

	// Simple mock logic: If card ends in '0000', fail it.
	if len(cardNumber) >= 4 && cardNumber[len(cardNumber)-4:] == "0000" {
		return nil, errors.New("payment declined: insufficient funds")
	}

	return &PaymentResult{
		TransactionID: "TXN-" + time.Now().Format("20060102150405"),
		Status:        "success",
		Amount:        amount,
	}, nil
}
