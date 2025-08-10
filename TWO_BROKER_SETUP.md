# 2-Broker Kafka Setup Guide

This guide is specifically for running the Kafka consumer application with 2 Kafka brokers for high availability and fault tolerance.

## 🏗️ **2-Broker Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Application                        │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │ Orders Consumer │  │    Notification Consumer       │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Kafka Cluster                          │
│  ┌─────────────────┐  ┌─────────────────────────────────┐ │
│  │   Broker 1      │  │         Broker 2               │ │
│  │ localhost:9092  │  │      localhost:9093           │ │
│  └─────────────────┘  └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## ⚙️ **Configuration**

### Environment Variables
Create a `.env` file with your 2-broker configuration:

```env
# Kafka 2-Broker Configuration
KAFKA_BROKERS=localhost:9092,localhost:9093

# Consumer Configurations
KAFKA_ORDERS_CLIENT_ID=orders-consumer
KAFKA_ORDERS_GROUP_ID=orders-consumer-group
KAFKA_NOTIFICATION_CLIENT_ID=notification-consumer
KAFKA_NOTIFICATION_GROUP_ID=notification-consumer-group

# Producer Configuration
KAFKA_PRODUCER_CLIENT_ID=kafka-producer

# Application Configuration
NODE_ENV=development
PORT=3000
```

### Default Configuration
If no environment variables are set, the application defaults to:
- **Broker 1**: `localhost:9092`
- **Broker 2**: `localhost:9093`

## 🚀 **Starting Your 2-Broker Setup**

### 1. Start Kafka Brokers
Make sure both brokers are running:

```bash
# Start Broker 1 (port 9092)
# Start Broker 2 (port 9093)
```

### 2. Start Your Application
```bash
npm run start:dev
```

### 3. Verify Connection
The application will automatically:
- Connect to both brokers
- Create topics if they don't exist
- Start all consumers
- Begin health monitoring

## 📊 **Benefits of 2-Broker Setup**

### ✅ **High Availability**
- If one broker fails, the other continues serving
- Automatic failover between brokers
- No single point of failure

### ✅ **Load Distribution**
- Messages distributed across both brokers
- Better performance under load
- Improved throughput

### ✅ **Fault Tolerance**
- Automatic reconnection to available brokers
- Message delivery guaranteed even if one broker is down
- Consumer group coordination across brokers

## 🔧 **Topic Configuration**

### Orders Topic
- **Partitions**: 3 (distributed across brokers)
- **Replication Factor**: 1 (minimum for 2 brokers)
- **Brokers**: Both brokers will handle partitions

### Notification Topic
- **Partitions**: 2 (distributed across brokers)
- **Replication Factor**: 1 (minimum for 2 brokers)
- **Brokers**: Both brokers will handle partitions

## 📈 **Monitoring 2-Broker Health**

### Check Overall Health
```bash
curl http://localhost:3000/consumer-health
```

### Check Specific Consumer
```bash
curl http://localhost:3000/consumer-health/consumers/orders
```

### Get Detailed Metrics
```bash
curl http://localhost:3000/consumer-health/metrics
```

## 🧪 **Testing 2-Broker Setup**

### Test Message Production
```bash
# Send test messages to both brokers
curl -X POST http://localhost:3000/messages/order \
  -H "Content-Type: application/json" \
  -d '{"orderId":"123","status":"pending"}'
```

### Test Consumer Processing
```bash
# Check that messages are being processed
curl http://localhost:3000/consumer-health/metrics
```

## 🔍 **Troubleshooting 2-Broker Issues**

### Common Issues

1. **One Broker Down**
   - Application continues with remaining broker
   - Automatic reconnection when broker comes back
   - Check logs for connection messages

2. **Both Brokers Down**
   - Consumers will pause until brokers are available
   - Health checks will show degraded status
   - Automatic recovery when brokers restart

3. **Network Issues**
   - Check firewall settings for both ports
   - Verify broker addresses are correct
   - Test connectivity to both brokers

### Health Check Responses

**Healthy (Both Brokers Up)**
```json
{
  "totalConsumers": 4,
  "activeConsumers": 4,
  "overallHealth": "healthy"
}
```

**Degraded (One Broker Down)**
```json
{
  "totalConsumers": 4,
  "activeConsumers": 2,
  "overallHealth": "degraded"
}
```

**Unhealthy (Both Brokers Down)**
```json
{
  "totalConsumers": 4,
  "activeConsumers": 0,
  "overallHealth": "unhealthy"
}
```

## 🎯 **Production Considerations**

### Broker Configuration
- Use different machines for each broker
- Configure proper memory and disk settings
- Set up monitoring for both brokers

### Network Configuration
- Ensure low latency between brokers
- Configure proper firewall rules
- Use dedicated network interfaces

### Monitoring
- Monitor both brokers independently
- Set up alerts for broker failures
- Track message distribution across brokers

## 📝 **Configuration Files**

### Kafka Config (`src/config/kafka.config.ts`)
Already configured for 2 brokers with:
- Automatic broker discovery
- Failover handling
- Retry mechanisms
- Health monitoring

### Admin Service (`src/services/kafka-admin.service.ts`)
Configured to:
- Connect to both brokers
- Create topics with proper replication
- Handle broker failures gracefully

### Producer Service (`src/services/kafka-producer.service.ts`)
Configured to:
- Send messages to both brokers
- Handle broker failures
- Retry failed messages

## 🚀 **Next Steps**

1. **Start both Kafka brokers**
2. **Run your application**: `npm run start:dev`
3. **Test the setup**: Use the health endpoints
4. **Monitor performance**: Check metrics regularly
5. **Scale as needed**: Add more consumers or topics

Your 2-broker Kafka setup is now optimized for high availability and fault tolerance! 🎉 