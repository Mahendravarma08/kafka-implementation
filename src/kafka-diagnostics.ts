import { Kafka } from 'kafkajs';

async function diagnoseKafkaSetup() {
  console.log('🔍 Diagnosing Kafka Setup...\n');

  const kafka = new Kafka({
    clientId: 'diagnostic-client',
    brokers: ['localhost:9092', 'localhost:9093'],
  });

  try {
    // 1. Test basic connectivity
    console.log('1️⃣ Testing basic connectivity...');
    const admin = kafka.admin();
    await admin.connect();
    console.log('✅ Successfully connected to Kafka brokers');

    // 2. Get cluster metadata
    console.log('\n2️⃣ Getting cluster metadata...');
    const metadata = await admin.describeCluster();
    console.log('📊 Cluster Info:', {
      brokers: metadata.brokers.length,
      controller: metadata.controller,
      clusterId: metadata.clusterId,
    });

    // 3. List topics
    console.log('\n3️⃣ Checking topics...');
    const topics = await admin.listTopics();
    console.log('📋 Available topics:', topics);

    // 4. Get topic details
    console.log('\n4️⃣ Getting topic details...');
    for (const topic of topics) {
      try {
        const topicMetadata = await admin.fetchTopicMetadata({ topics: [topic] });
        console.log(`📝 Topic: ${topic}`, topicMetadata.topics[0]);
      } catch (error) {
        console.log(`❌ Error getting metadata for topic ${topic}:`, error.message);
      }
    }

    // 5. Test consumer group operations
    console.log('\n5️⃣ Testing consumer group operations...');
    try {
      const groups = await admin.listGroups();
      console.log('👥 Existing consumer groups:', groups.groups);
    } catch (error) {
      console.log('❌ Error listing consumer groups:', error.message);
    }

    // 6. Test creating a test consumer group
    console.log('\n6️⃣ Testing consumer group creation...');
    const consumer = kafka.consumer({ groupId: 'test-diagnostic-group' });
    try {
      await consumer.connect();
      console.log('✅ Successfully connected consumer');
      
      // Try to subscribe to a topic
      if (topics.length > 0) {
        await consumer.subscribe({ topic: topics[0], fromBeginning: false });
        console.log(`✅ Successfully subscribed to topic: ${topics[0]}`);
        
        // Try to start consuming (this will test group coordinator)
        await consumer.run({
          eachMessage: async ({ topic, partition, message }) => {
            console.log(`📨 Test message received from ${topic}:${partition}`);
          },
        });
        console.log('✅ Successfully started consuming (group coordinator working)');
        
        // Stop the consumer
        await consumer.disconnect();
        console.log('✅ Successfully disconnected test consumer');
      }
    } catch (error) {
      console.log('❌ Error with consumer group operations:', error.message);
    }

    await admin.disconnect();
    console.log('\n✅ Diagnostic completed successfully');

  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  }
}

// Run the diagnostic
diagnoseKafkaSetup().catch(console.error); 