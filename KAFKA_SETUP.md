# Production-Grade Kafka Consumer Setup

This project provides a production-ready Kafka consumer configuration with the following features:

## Features

- **Robust Error Handling**: Automatic retry mechanisms for transient errors
- **Health Monitoring**: Real-time health checks and metrics
- **Graceful Shutdown**: Proper cleanup on application termination
- **Configuration Management**: Environment-based configuration
- **Consumer Management**: Centralized control over all consumers
- **REST API**: Health monitoring and control endpoints
- **Type Safety**: Full TypeScript support with interfaces
- **Logging**: Comprehensive logging with different levels
- **Scalability**: Easy to add new consumers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Consumer Manager                        │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Orders Consumer │  │    Notification Consumer       │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Base Consumer Service                   │
│  • Connection Management                                   │
│  • Error Handling & Retry                                 │
│  • Health Monitoring                                      │
│  • Graceful Shutdown                                      │
└─────────────────────────────────────────────────────────────┘
```

## Configuration

Create a `.env` file in your project root:

```env
# Kafka Configuration
KAFKA_BROKERS=localhost:9092,localhost:9093

# Orders Consumer Configuration
KAFKA_ORDERS_CLIENT_ID=orders-consumer
KAFKA_ORDERS_GROUP_ID=orders-consumer-group

# Notification Consumer Configuration
KAFKA_NOTIFICATION_CLIENT_ID=notification-consumer
KAFKA_NOTIFICATION_GROUP_ID=notification-consumer-group

# Producer Configuration
KAFKA_PRODUCER_CLIENT_ID=kafka-producer

# Application Configuration
NODE_ENV=development
PORT=3000
```

## API Endpoints

### Health Monitoring

- `GET /consumer-health` - Overall health status
- `GET /consumer-health/consumers` - List all consumers
- `GET /consumer-health/consumers/:name` - Specific consumer health
- `GET /consumer-health/metrics` - Detailed metrics

### Consumer Control

- `POST /consumer-health/consumers/:name/pause` - Pause specific consumer
- `POST /consumer-health/consumers/:name/resume` - Resume specific consumer
- `POST /consumer-health/consumers/pause-all` - Pause all consumers
- `POST /consumer-health/consumers/resume-all` - Resume all consumers

## Adding New Consumers

1. **Create Consumer Configuration** in `src/config/kafka.config.ts`:

```typescript
export const kafkaConfig = {
  consumers: {
    // ... existing consumers
    newTopic: {
      clientId: process.env.KAFKA_NEW_TOPIC_CLIENT_ID || 'new-topic-consumer',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      groupId: process.env.KAFKA_NEW_TOPIC_GROUP_ID || 'new-topic-consumer-group',
      topic: 'new-topic',
      // ... other configuration
    },
  },
};
```

2. **Create Consumer Service** extending `BaseConsumerService`:

```typescript
@Injectable()
export class NewTopicConsumerService extends BaseConsumerService {
  constructor() {
    super(getConsumerConfig('newTopic'));
  }

  protected async processMessage(message: KafkaMessage, payload: EachMessagePayload): Promise<void> {
    // Your message processing logic
  }
}
```

3. **Register in Consumer Manager**:

```typescript
// In ConsumerManagerService constructor
constructor(
  private readonly ordersConsumer: OrdersConsumerService,
  private readonly notificationConsumer: NotificationConsumerService,
  private readonly newTopicConsumer: NewTopicConsumerService, // Add this
) {}

// In onModuleInit
this.registerConsumer('new-topic', this.newTopicConsumer);
```

4. **Add to Kafka Module**:

```typescript
@Module({
  providers: [
    OrdersConsumerService,
    NotificationConsumerService,
    NewTopicConsumerService, // Add this
    ConsumerManagerService,
  ],
  // ...
})
export class KafkaModule {}
```

## Message Processing

### Orders Consumer

Processes order messages with different statuses:
- `pending` - Validate inventory, check customer credit
- `confirmed` - Allocate inventory, create shipping label
- `shipped` - Update tracking information, send notifications
- `delivered` - Update inventory, send delivery confirmation
- `cancelled` - Refund payment, restore inventory

### Notification Consumer

Processes different types of notifications:
- `email` - Send emails via email service
- `sms` - Send SMS via SMS service
- `push` - Send push notifications via FCM/APNS
- `in-app` - Store in database, send via WebSocket

## Error Handling

The system includes comprehensive error handling:

- **Retryable Errors**: Network issues, timeouts, connection problems
- **Non-Retryable Errors**: Invalid message format, business logic errors
- **Exponential Backoff**: Configurable retry delays
- **Max Retries**: Configurable retry limits
- **Dead Letter Queue**: Failed messages can be sent to DLQ (implement as needed)

## Monitoring

### Health Checks

- Connection status
- Consumer group status
- Message processing rates
- Error rates
- Last message timestamp

### Metrics

- Total messages processed
- Error count
- Processing time
- Consumer lag
- Connection status

## Production Considerations

### Performance

- Configure appropriate batch sizes
- Set optimal auto-commit intervals
- Monitor consumer lag
- Use appropriate partition counts

### Reliability

- Use multiple Kafka brokers
- Configure appropriate replication factors
- Implement proper error handling
- Use idempotent message processing

### Security

- Enable SSL/TLS encryption
- Use SASL authentication
- Implement proper access controls
- Secure configuration management

### Monitoring

- Set up alerts for consumer health
- Monitor message processing rates
- Track error rates and types
- Monitor consumer lag

## Running the Application

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set up Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Kafka configuration
   ```

3. **Start Kafka** (if running locally):
   ```bash
   # Start your Kafka cluster
   ```

4. **Run the Application**:
   ```bash
   npm run start:dev
   ```

5. **Check Health**:
   ```bash
   curl http://localhost:3000/consumer-health
   ```

## Testing

### Manual Testing

1. **Send Test Messages**:
   ```bash
   # Send order message
   curl -X POST http://localhost:3000/messages/order \
     -H "Content-Type: application/json" \
     -d '{"orderId":"123","status":"pending"}'
   
   # Send notification message
   curl -X POST http://localhost:3000/messages/notification \
     -H "Content-Type: application/json" \
     -d '{"notificationId":"456","type":"email"}'
   ```

2. **Monitor Processing**:
   ```bash
   curl http://localhost:3000/consumer-health/metrics
   ```

### Health Check Examples

```bash
# Overall health
curl http://localhost:3000/consumer-health

# Specific consumer health
curl http://localhost:3000/consumer-health/consumers/orders

# Pause consumer
curl -X POST http://localhost:3000/consumer-health/consumers/orders/pause

# Resume consumer
curl -X POST http://localhost:3000/consumer-health/consumers/orders/resume
```

## Troubleshooting

### Common Issues

1. **Connection Issues**:
   - Check Kafka broker addresses
   - Verify network connectivity
   - Check firewall settings

2. **Consumer Group Issues**:
   - Verify group ID configuration
   - Check for conflicting consumers
   - Monitor consumer lag

3. **Message Processing Errors**:
   - Check message format
   - Verify business logic
   - Monitor error logs

### Logs

The application provides detailed logging:
- Connection events
- Message processing
- Error details
- Health check results

Check the console output for detailed information about consumer status and any issues. 