import { Injectable } from '@nestjs/common';
import { EachMessagePayload, KafkaMessage } from 'kafkajs';
import { BaseConsumerService } from './base-consumer.service';
import { getConsumerConfig } from '../config/kafka.config';

export interface NotificationMessage {
  notificationId: string;
  userId: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  metadata?: Record<string, any>;
  scheduledAt?: string;
  createdAt: string;
}

@Injectable()
export class NotificationConsumerService extends BaseConsumerService {
  constructor() {
    super(getConsumerConfig('notification'));
  }

  protected async processMessage(message: KafkaMessage, payload: EachMessagePayload): Promise<void> {
    try {
      const notificationData: NotificationMessage = JSON.parse(message.value?.toString() || '{}');
      
      this.logger.log(`Processing notification: ${notificationData.notificationId} of type: ${notificationData.type}`);
      
      // Process the notification based on its type
      switch (notificationData.type) {
        case 'email':
          await this.processEmailNotification(notificationData);
          break;
        case 'sms':
          await this.processSmsNotification(notificationData);
          break;
        case 'push':
          await this.processPushNotification(notificationData);
          break;
        case 'in-app':
          await this.processInAppNotification(notificationData);
          break;
        default:
          this.logger.warn(`Unknown notification type: ${notificationData.type} for notification: ${notificationData.notificationId}`);
      }
      
      this.logger.log(`Successfully processed notification: ${notificationData.notificationId}`);
    } catch (error) {
      this.logger.error(`Error processing notification message:`, error);
      throw error;
    }
  }

  private async processEmailNotification(notification: NotificationMessage): Promise<void> {
    this.logger.log(`Processing email notification: ${notification.notificationId}`);
    
    // Add your email sending logic here
    // e.g., integrate with email service (SendGrid, AWS SES, etc.)
    
    // Simulate email processing
    await this.simulateEmailSending(notification);
    
    this.logger.log(`Email notification sent successfully: ${notification.notificationId}`);
  }

  private async processSmsNotification(notification: NotificationMessage): Promise<void> {
    this.logger.log(`Processing SMS notification: ${notification.notificationId}`);
    
    // Add your SMS sending logic here
    // e.g., integrate with SMS service (Twilio, AWS SNS, etc.)
    
    // Simulate SMS processing
    await this.simulateSmsSending(notification);
    
    this.logger.log(`SMS notification sent successfully: ${notification.notificationId}`);
  }

  private async processPushNotification(notification: NotificationMessage): Promise<void> {
    this.logger.log(`Processing push notification: ${notification.notificationId}`);
    
    // Add your push notification logic here
    // e.g., integrate with FCM, APNS, etc.
    
    // Simulate push notification processing
    await this.simulatePushNotification(notification);
    
    this.logger.log(`Push notification sent successfully: ${notification.notificationId}`);
  }

  private async processInAppNotification(notification: NotificationMessage): Promise<void> {
    this.logger.log(`Processing in-app notification: ${notification.notificationId}`);
    
    // Add your in-app notification logic here
    // e.g., store in database, send via WebSocket, etc.
    
    // Simulate in-app notification processing
    await this.simulateInAppNotification(notification);
    
    this.logger.log(`In-app notification processed successfully: ${notification.notificationId}`);
  }

  private async simulateEmailSending(notification: NotificationMessage): Promise<void> {
    // Simulate email sending with different processing times based on priority
    const processingTime = this.getProcessingTimeByPriority(notification.priority);
    await new Promise(resolve => setTimeout(resolve, processingTime));
    
    // Simulate potential failures for high priority notifications
    if (notification.priority === 'urgent' && Math.random() < 0.1) {
      throw new Error('Email service temporarily unavailable');
    }
  }

  private async simulateSmsSending(notification: NotificationMessage): Promise<void> {
    // Simulate SMS sending
    const processingTime = this.getProcessingTimeByPriority(notification.priority);
    await new Promise(resolve => setTimeout(resolve, processingTime));
  }

  private async simulatePushNotification(notification: NotificationMessage): Promise<void> {
    // Simulate push notification sending
    const processingTime = this.getProcessingTimeByPriority(notification.priority);
    await new Promise(resolve => setTimeout(resolve, processingTime));
  }

  private async simulateInAppNotification(notification: NotificationMessage): Promise<void> {
    // Simulate in-app notification processing
    const processingTime = this.getProcessingTimeByPriority(notification.priority);
    await new Promise(resolve => setTimeout(resolve, processingTime));
  }

  private getProcessingTimeByPriority(priority: NotificationMessage['priority']): number {
    switch (priority) {
      case 'urgent':
        return 50; // Fastest processing for urgent notifications
      case 'high':
        return 100;
      case 'medium':
        return 200;
      case 'low':
        return 300; // Slowest processing for low priority notifications
      default:
        return 150;
    }
  }
} 