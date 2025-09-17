// scripts/test-connection.js
const { MongoClient } = require('mongodb');

async function testConnection() {
    const uri = 'mongodb+srv://javidmushtan:Safiya%40123@cluster0.s8lp7kw.mongodb.net/e-bike-rental?retryWrites=true&w=majority&appName=Cluster0';

    console.log('Testing connection to MongoDB Atlas...');
    console.log('Connection URI:', uri.replace(/javidmushtan:([^@]+)@/, 'javidmushtan:****@'));

    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Successfully connected to MongoDB Atlas');

        // Check if database exists
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        console.log('\n📦 Available databases:');
        databases.databases.forEach(db => console.log(`   - ${db.name}`));

        // Check if our database exists
        const dbName = 'e-bike-rental';
        const dbExists = databases.databases.some(db => db.name === dbName);
        console.log(`\n🔍 Database '${dbName}' exists:`, dbExists);

        if (dbExists) {
            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();
            console.log('\n🗂️ Collections in database:');
            collections.forEach(col => console.log(`   - ${col.name}`));

            // Check if reservations collection exists
            if (collections.some(col => col.name === 'reservations')) {
                const reservationsCount = await db.collection('reservations').countDocuments();
                console.log(`\n📊 Reservations count: ${reservationsCount}`);

                // Get a sample reservation
                const sampleReservation = await db.collection('reservations').findOne();
                console.log('\n📄 Sample reservation:', sampleReservation);
            }
        }

        return true;
    } catch (error) {
        console.error('❌ Connection failed:', error.message);

        // Provide specific error guidance
        if (error.message.includes('authentication failed')) {
            console.log('\n🔐 Authentication failed. Please check your username and password.');
        } else if (error.message.includes('getaddrinfo ENOTFOUND')) {
            console.log('\n🌐 Network error. Please check your internet connection.');
        }

        return false;
    } finally {
        await client.close();
        console.log('\n🔌 Connection closed');
    }
}

testConnection();