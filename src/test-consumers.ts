import { KafkaProducerService } from './services/kafka-producer.service';
import { getProducerConfig } from './config/kafka.config';

// Test script to demonstrate the consumer setup
async function testConsumers() {
  console.log('🚀 Testing Kafka Consumer Setup...\n');

  // Initialize producer
  const producerConfig = getProducerConfig();
  const producer = new KafkaProducerService();

  try {
    // Test Order Messages
    console.log('📦 Testing Orders Consumer...');
    
    const orderMessages = [
      {
        orderId: 'ORD-001',
        customerId: 'CUST-001',
        items: [
          { productId: 'PROD-001', quantity: 2, price: 29.99 }
        ],
        totalAmount: 59.98,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        orderId: 'ORD-002',
        customerId: 'CUST-002',
        items: [
          { productId: 'PROD-002', quantity: 1, price: 49.99 }
        ],
        totalAmount: 49.99,
        status: 'confirmed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        orderId: 'ORD-003',
        customerId: 'CUST-003',
        items: [
          { productId: 'PROD-003', quantity: 3, price: 19.99 }
        ],
        totalAmount: 59.97,
        status: 'shipped',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    for (const order of orderMessages) {
      await producer.produceMessage('orders', [{ value: JSON.stringify(order) }]);
      console.log(`✅ Sent order: ${order.orderId} (${order.status})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between messages
    }

    // Test Notification Messages
    console.log('\n📧 Testing Notification Consumer...');
    
    const notificationMessages = [
      {
        notificationId: 'NOTIF-001',
        userId: 'USER-001',
        type: 'email',
        title: 'Order Confirmation',
        message: 'Your order ORD-001 has been confirmed!',
        priority: 'high',
        createdAt: new Date().toISOString(),
      },
      {
        notificationId: 'NOTIF-002',
        userId: 'USER-002',
        type: 'sms',
        title: 'Shipping Update',
        message: 'Your order ORD-002 has been shipped!',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      },
      {
        notificationId: 'NOTIF-003',
        userId: 'USER-003',
        type: 'push',
        title: 'Delivery Confirmation',
        message: 'Your order ORD-003 has been delivered!',
        priority: 'urgent',
        createdAt: new Date().toISOString(),
      },
      {
        notificationId: 'NOTIF-004',
        userId: 'USER-004',
        type: 'in-app',
        title: 'Welcome Message',
        message: 'Welcome to our platform!',
        priority: 'low',
        createdAt: new Date().toISOString(),
      }
    ];

    for (const notification of notificationMessages) {
      await producer.produceMessage('notification', [{ value: JSON.stringify(notification) }]);
      console.log(`✅ Sent notification: ${notification.notificationId} (${notification.type})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between messages
    }

    console.log('\n🎉 Test completed successfully!');
    console.log('\n📊 Check the health endpoints:');
    console.log('   GET http://localhost:3000/consumer-health');
    console.log('   GET http://localhost:3000/consumer-health/metrics');
    console.log('   GET http://localhost:3000/consumer-health/consumers/orders');
    console.log('   GET http://localhost:3000/consumer-health/consumers/notification');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Cleanup
    await producer.onModuleDestroy();
    process.exit(0);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testConsumers().catch(console.error);
}

export { testConsumers }; 