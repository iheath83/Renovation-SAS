import { BridgeService } from './src/services/bridge.service.js';
import 'dotenv/config';

/**
 * Script de test de la connexion Bridge API
 */
async function testBridgeConnection() {
  console.log('🧪 Testing Bridge API Service...\n');
  console.log('Configuration:');
  console.log('- API URL:', process.env.BRIDGE_API_URL || 'https://renovision-sandbox.biapi.pro (default)');
  console.log('- Client ID:', process.env.BRIDGE_CLIENT_ID ? '✓ Set' : '✗ Not set');
  console.log('- Client Secret:', process.env.BRIDGE_CLIENT_SECRET ? '✓ Set' : '✗ Not set');
  console.log('- Webhook Secret:', process.env.BRIDGE_WEBHOOK_SECRET ? '✓ Set' : '✗ Not set');
  console.log('- Environment:', process.env.BRIDGE_ENVIRONMENT || 'sandbox');
  console.log('- Redirect URI:', process.env.BRIDGE_REDIRECT_URI || 'http://localhost:5173/comptes-bancaires/callback (default)');
  console.log('\n' + '='.repeat(60) + '\n');

  // Test 1: Get connect URL
  console.log('Test 1: Getting connect URL...');
  const connectResult = await BridgeService.getConnectUrl('test-user-id', 'test-projet-id');
  
  if (connectResult.success) {
    console.log('✅ Connect URL generated successfully');
    console.log('📍 URL:', connectResult.url);
  } else {
    console.error('❌ Failed to generate connect URL:', connectResult.error);
  }
  console.log('\n' + '-'.repeat(60) + '\n');

  // Test 2: Test connection
  console.log('Test 2: Testing API connection...');
  const connectionResult = await BridgeService.testConnection();
  
  if (connectionResult.success) {
    console.log('✅', connectionResult.message);
    if (connectionResult.data) {
      console.log('📊 Response:', JSON.stringify(connectionResult.data, null, 2));
    }
  } else {
    console.error('❌ Connection failed:', connectionResult.error);
    if (connectionResult.details) {
      console.error('Details:', JSON.stringify(connectionResult.details, null, 2));
    }
  }
  console.log('\n' + '-'.repeat(60) + '\n');

  // Test 3: Validate webhook signature
  console.log('Test 3: Testing webhook signature validation...');
  const testPayload = { event: 'transaction.created', data: { id: '123' } };
  const testSignature = 'test-signature';
  
  const isValid = BridgeService.validateWebhookSignature(testPayload, testSignature);
  
  if (!process.env.BRIDGE_WEBHOOK_SECRET) {
    console.log('⚠️  BRIDGE_WEBHOOK_SECRET not configured - skipping validation test');
  } else {
    console.log(isValid ? '✅ Signature validation working' : '❌ Invalid signature (expected for test)');
  }
  console.log('\n' + '='.repeat(60) + '\n');

  // Summary
  console.log('📋 Summary:');
  if (!process.env.BRIDGE_CLIENT_ID || !process.env.BRIDGE_CLIENT_SECRET) {
    console.log('\n⚠️  WARNING: Bridge API credentials not configured');
    console.log('Please set the following environment variables in backend/.env:');
    console.log('  - BRIDGE_API_URL');
    console.log('  - BRIDGE_CLIENT_ID');
    console.log('  - BRIDGE_CLIENT_SECRET');
    console.log('  - BRIDGE_WEBHOOK_SECRET');
    console.log('\nRefer to backend/.env.example for more details.');
  } else {
    console.log('\n✅ Bridge API service is ready to use!');
    console.log('\nNext steps:');
    console.log('1. Create the database models (CompteBancaire, TransactionBancaire)');
    console.log('2. Implement the API controllers');
    console.log('3. Set up webhook endpoint');
    console.log('4. Integrate with frontend');
  }
}

testBridgeConnection().catch(console.error);

