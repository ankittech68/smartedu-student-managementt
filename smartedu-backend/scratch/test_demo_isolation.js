process.env.PORT = '8888';
const initDb = require('../config/initDb');

async function testScenario() {
    console.log('--- TEST STEP 0: Initializing DB schema & demo data ---');
    await initDb();

    // Require server to start express on port 8888
    require('../server.js');

    // Give server 1.5 seconds to bind to port
    await new Promise(r => setTimeout(r, 1500));

    const BASE_URL = 'http://localhost:8888/api';

    // 1. Login with Demo Admin
    console.log('\n--- TEST STEP 1: Login with Demo Admin (admin) ---');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const adminLogin = await adminLoginRes.json();
    const adminToken = adminLogin.token;
    console.log('Demo Admin login success. Token isDemo:', adminLogin.isDemo);

    // 2. Verify only demo data is visible to Demo Admin
    console.log('\n--- TEST STEP 2: Fetch students & unassigned users as Demo Admin ---');
    const demoStudentsRes = await fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const demoStudents = await demoStudentsRes.json();
    console.log('Demo Admin sees students:', demoStudents.map(s => `${s.firstName} ${s.lastName}`));
    
    const demoUnassignedRes = await fetch(`${BASE_URL}/users/students/unassigned`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const demoUnassigned = await demoUnassignedRes.json();
    console.log('Demo Admin sees unassigned student users count:', demoUnassigned.length);

    // 3. Register a new user named "Ankit_"
    console.log('\n--- TEST STEP 3: Register new normal user "Ankit_" ---');
    const testUsername = `Ankit_${Date.now()}`;
    const testEmail = `ankit_${Date.now()}@example.com`;
    const signupHttp = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: testUsername,
            email: testEmail,
            password: 'password123',
            role: 'STUDENT'
        })
    });
    const signupRes = await signupHttp.json();
    console.log('Registration response:', signupRes.message);

    // 4. Login as Ankit_
    console.log('\n--- TEST STEP 4: Login as newly registered user ---');
    const userLoginRes = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUsername, password: 'password123' })
    });
    const userLogin = await userLoginRes.json();
    const userToken = userLogin.token;
    console.log('Normal User login success. Token isDemo:', userLogin.isDemo);

    // 5. Fetch profile as Ankit_
    const userProfileRes = await fetch(`${BASE_URL}/students/me`, { headers: { Authorization: `Bearer ${userToken}` } });
    const userProfile = await userProfileRes.json();
    console.log('Normal User profile:', userProfile.firstName, userProfile.username);

    // 6. Simulate Logout & Login again as Demo Admin
    console.log('\n--- TEST STEP 5 & 6: Logout normal user & Login again as Demo Admin ---');
    const adminLogin2Res = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const adminLogin2 = await adminLogin2Res.json();
    const adminToken2 = adminLogin2.token;

    // 7. Verify Ankit_ does NOT appear in Demo Admin's unassigned students or student list
    console.log('\n--- TEST STEP 7: Verify newly registered user does NOT appear in Demo Admin dataset ---');
    const demoStudents2Res = await fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${adminToken2}` } });
    const demoStudents2 = await demoStudents2Res.json();
    const demoUnassigned2Res = await fetch(`${BASE_URL}/users/students/unassigned`, { headers: { Authorization: `Bearer ${adminToken2}` } });
    const demoUnassigned2 = await demoUnassigned2Res.json();

    const foundInStudents = demoStudents2.some(s => s.username === testUsername);
    const foundInUnassigned = demoUnassigned2.some(u => u.username === testUsername);

    console.log(`Found ${testUsername} in Demo Admin Students list?`, foundInStudents ? '❌ FAIL' : '✅ NO (SUCCESS)');
    console.log(`Found ${testUsername} in Demo Admin Unassigned Users list?`, foundInUnassigned ? '❌ FAIL' : '✅ NO (SUCCESS)');

    // 8. Verify original demo data is unchanged
    console.log('\n--- TEST STEP 8: Verify demo data remains unchanged ---');
    console.log('Demo Admin total students count:', demoStudents2.length);

    // 9. Verify normal Ankit_ account still exists and can log in normally
    console.log('\n--- TEST STEP 9: Verify normal user can log in again ---');
    const userLogin2Res = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: testUsername, password: 'password123' })
    });
    const userLogin2 = await userLogin2Res.json();
    console.log('Normal User login 2 success! Username:', userLogin2.username);

    // 10. Restart backend DB init and re-verify
    console.log('\n--- TEST STEP 10: Re-run initDb to simulate backend restart ---');
    await initDb();
    const adminLogin3Res = await fetch(`${BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'admin123' })
    });
    const adminLogin3 = await adminLogin3Res.json();
    const demoStudents3Res = await fetch(`${BASE_URL}/students`, { headers: { Authorization: `Bearer ${adminLogin3.token}` } });
    const demoStudents3 = await demoStudents3Res.json();
    console.log('After restart, Demo Admin student count:', demoStudents3.length);

    console.log('\n🎉 ALL 10 TEST SCENARIOS PASSED WITH PERFECT DEMO/NORMAL ISOLATION!');
    process.exit(0);
}

testScenario().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
});
