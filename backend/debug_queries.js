const { query } = require('./src/config/db');
require('dotenv').config();
const ClubMember = require('./src/models/ClubMember');
const ClubEvent = require('./src/models/ClubEvent');

async function debugQueries() {
    const clubId = 'a1bff507-4b23-4038-8963-49c72917eb38'; // From user log
    try {
        console.log('Testing ClubMember.findByClubId...');
        const members = await ClubMember.findByClubId(clubId);
        console.log('Members count:', members.length);
    } catch (e) {
        console.error('ClubMember Error:', e.message);
    }

    try {
        console.log('Testing ClubEvent.findByClubId...');
        const events = await ClubEvent.findByClubId(clubId);
        console.log('Events count:', events.length);
    } catch (e) {
        console.error('ClubEvent Error:', e.message);
    }
    process.exit(0);
}

debugQueries();
