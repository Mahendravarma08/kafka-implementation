import { Injectable } from '@nestjs/common';
import { EachMessagePayload, KafkaMessage } from 'kafkajs';
import { BaseConsumerService } from './base-consumer.service';
import { getConsumerConfig } from '../config/kafka.config';

export interface OrderMessage {
  orderId: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class OrdersConsumerService extends BaseConsumerService {
  constructor() {
    super(getConsumerConfig('orders'));
  }

  protected async processMessage(message: KafkaMessage, payload: EachMessagePayload): Promise<void> {
    try {
      const orderData: OrderMessage = JSON.parse(message.value?.toString() || '{}');
      
      this.logger.log(`Processing order: ${orderData.orderId} with status: ${orderData.status}`);
      
      // Process the order based on its status
      switch (orderData.status) {
        case 'pending':
          await this.processPendingOrder(orderData);
          break;
        case 'confirmed':
          await this.processConfirmedOrder(orderData);
          break;
        case 'shipped':
          await this.processShippedOrder(orderData);
          break;
        case 'delivered':
          await this.processDeliveredOrder(orderData);
          break;
        case 'cancelled':
          await this.processCancelledOrder(orderData);
          break;
        default:
          this.logger.warn(`Unknown order status: ${orderData.status} for order: ${orderData.orderId}`);
      }
      
      this.logger.log(`Successfully processed order: ${orderData.orderId}`);
    } catch (error) {
      this.logger.error(`Error processing order message:`, error);
      throw error;
    }
  }

  private async processPendingOrder(order: OrderMessage): Promise<void> {
    this.logger.log(`Processing pending order: ${order.orderId}`);
    // Add your business logic for pending orders
    // e.g., validate inventory, check customer credit, etc.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async processConfirmedOrder(order: OrderMessage): Promise<void> {
    this.logger.log(`Processing confirmed order: ${order.orderId}`);
    // Add your business logic for confirmed orders
    // e.g., allocate inventory, create shipping label, etc.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  private async processShippedOrder(order: OrderMessage): Promise<void> {
    this.logger.log(`Processing shipped order: ${order.orderId}`);
    // Add your business logic for shipped orders
    // e.g., update tracking information, send notifications, etc.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  private async processDeliveredOrder(order: OrderMessage): Promise<void> {
    this.logger.log(`Processing delivered order: ${order.orderId}`);
    // Add your business logic for delivered orders
    // e.g., update inventory, send delivery confirmation, etc.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  private async processCancelledOrder(order: OrderMessage): Promise<void> {
    this.logger.log(`Processing cancelled order: ${order.orderId}`);
    // Add your business logic for cancelled orders
    // e.g., refund payment, restore inventory, etc.
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 120));
  }
} 