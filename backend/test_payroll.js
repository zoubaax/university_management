const { query } = require('./src/config/db');
const Payroll = require('./src/models/Payroll');

async function test() {
    try {
        const month = '2026-03';
        const data = await Payroll.generateForMonth(month);
        console.log(JSON.stringify(data.filter(d => d.base_salary > 0), null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
