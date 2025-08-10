import { Kafka } from 'kafkajs';

async function fixConsumerGroups() {
  console.log('🔧 Fixing Consumer Groups Issue...\n');

  const kafka = new Kafka({
    clientId: 'fix-consumer-groups',
    brokers: ['localhost:9092', 'localhost:9093'],
  });

  try {
    const admin = kafka.admin();
    await admin.connect();
    console.log('✅ Connected to Kafka brokers');

    // 1. Check if __consumer_offsets topic exists
    console.log('\n1️⃣ Checking __consumer_offsets topic...');
    const topics = await admin.listTopics();
    const hasConsumerOffsets = topics.includes('__consumer_offsets');
    console.log('📋 __consumer_offsets topic exists:', hasConsumerOffsets);

    if (!hasConsumerOffsets) {
      console.log('❌ __consumer_offsets topic is missing!');
      console.log('💡 This is likely the cause of your consumer groups issue.');
      console.log('\n🔧 Solutions:');
      console.log('1. Restart your Kafka brokers');
      console.log('2. Check your server.properties configuration');
      console.log('3. Ensure group coordinator is enabled');
    } else {
      console.log('✅ __consumer_offsets topic exists');
    }

    // 2. Try to create a test consumer group
    console.log('\n2️⃣ Testing consumer group creation...');
    const consumer = kafka.consumer({ 
      groupId: 'test-fix-group',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });

    try {
      await consumer.connect();
      console.log('✅ Consumer connected');

      // Subscribe to a topic
      await consumer.subscribe({ topic: 'orders', fromBeginning: false });
      console.log('✅ Subscribed to orders topic');

      // Start consuming (this should create the consumer group)
      await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
          console.log(`📨 Test message from ${topic}:${partition}`);
        },
      });
      console.log('✅ Consumer group created successfully!');

      // Wait a moment for the group to be registered
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if the group now appears
      const groups = await admin.listGroups();
      console.log('👥 Available consumer groups:', groups.groups.map(g => g.groupId));

      // Disconnect the consumer
      await consumer.disconnect();
      console.log('✅ Test consumer disconnected');

    } catch (error) {
      console.log('❌ Error creating consumer group:', error.message);
      console.log('\n🔧 Recommended fixes:');
      console.log('1. Restart your Kafka brokers');
      console.log('2. Check your server.properties for group coordinator settings');
      console.log('3. Ensure both brokers are properly configured');
    }

    await admin.disconnect();
    console.log('\n✅ Fix attempt completed');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixConsumerGroups().catch(console.error); 