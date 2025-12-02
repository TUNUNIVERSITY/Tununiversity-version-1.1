const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3000/api/import-export';

async function testImport(entity, filename, updateExisting = false) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${entity} import: ${filename}`);
  console.log('='.repeat(60));

  try {
    const formData = new FormData();
    const filePath = path.join(__dirname, filename);
    
    if (!fs.existsSync(filePath)) {
      console.error(`❌ File not found: ${filePath}`);
      return;
    }

    formData.append('file', fs.createReadStream(filePath));
    formData.append('updateExisting', updateExisting.toString());

    const response = await axios.post(`${API_BASE}/${entity}/import`, formData, {
      headers: formData.getHeaders(),
      maxContentLength: Infinity,
      maxBodyLength: Infinity
    });

    console.log('✅ SUCCESS!');
    console.log('\n📊 Summary:');
    console.log(`   ✓ Created: ${response.data.summary.success}`);
    console.log(`   ↻ Updated: ${response.data.summary.updated}`);
    console.log(`   ✗ Errors: ${response.data.summary.errors}`);

    if (response.data.details.success.length > 0) {
      console.log('\n✓ Successfully imported:');
      response.data.details.success.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${JSON.stringify(item)}`);
      });
    }

    if (response.data.details.updated.length > 0) {
      console.log('\n↻ Updated records:');
      response.data.details.updated.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${JSON.stringify(item)}`);
      });
    }

    if (response.data.details.errors.length > 0) {
      console.log('\n✗ Errors encountered:');
      response.data.details.errors.forEach((error, idx) => {
        console.log(`   ${idx + 1}. ${error.error}`);
        if (error.record) {
          console.log(`      Record: ${JSON.stringify(error.record).substring(0, 100)}...`);
        }
      });
    }

  } catch (error) {
    console.error('❌ ERROR!');
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data.error || error.message}`);
    } else {
      console.error(`   ${error.message}`);
    }
  }
}

async function runTests() {
  console.log('\n🧪 STARTING CSV IMPORT TESTS');
  console.log('=' .repeat(60));
  console.log('Server: http://localhost:3000');
  console.log('Testing with sample CSV files...\n');

  // Test each entity
  await testImport('groups', 'groups-test.csv', false);
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testImport('rooms', 'rooms-test.csv', false);
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testImport('students', 'students-test.csv', false);
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testImport('teachers', 'teachers-test.csv', false);
  await new Promise(resolve => setTimeout(resolve, 1000));

  await testImport('subjects', 'subjects-test.csv', false);
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('\n' + '='.repeat(60));
  console.log('🎉 ALL TESTS COMPLETED!');
  console.log('='.repeat(60));
  console.log('\nℹ️  Check your database to verify the imported records.');
  console.log('ℹ️  You can also test the export functionality in the web UI.');
}

// Run tests
runTests().catch(console.error);
